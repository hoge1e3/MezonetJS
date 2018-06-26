unit SoundKer;

interface

{$ifdef ForM2}
uses
  Windows, Messages,Mmsystem,
    SysUtils ;
{$else}
uses
  Windows, Messages,Mmsystem,
    SysUtils;
{$endif}

const
  Chs=10;
  Regs=Chs*3;
  WvElC=32;
  WvC=96;
  wdataSize=65536;
  
type
  {TForm2 =class (TForm)

  end;}

  WAVEFORMATEX = record
    wFormatTag:WORD  ;
    nChannels:WORD  ;
    nSamplesPerSec:DWORD ;
    nAvgBytesPerSec:DWORD ;
    nBlockAlign:WORD  ;
    wBitsPerSample:WORD  ;
    cbSize:WORD  ;
  end;
  WAVEHDR = record
    lpData:^byte       ;          // address of the waveform buffer
    dwBufferLength:DWORD  ;          // length, in bytes, of the buffer
    dwBytesRecorded:DWORD  ;          // see below
    dwUser:DWORD  ;                   // 32 bits of user data
    dwFlags:DWORD  ;                  // see below
    dwLoops:DWORD  ;                  // see below
    lpNext:Pointer; // reserved; must be zero
    reserved:DWORD ;                 // reserved; must be zero

  end;

  Tsmpte = record
    hour:BYTE ;   // hours
    min:BYTE ;    // minutes
    sec:BYTE ;    // seconds
    frame:BYTE ;  // frames
    fps:BYTE ;    // frames/sec. (24, 25, 29 (30 drop), or 30)
    dummy:BYTE ;  // dummy byte for alignment
    pad:array [1..2] of BYTE;   // more padding
  end;
  Tmidi = record
    songptrpos:DWord;
  end;
  MMTIME = record
    wType:UINT;
    case Integer of
    1:(ms:DWORD);        // see below
    2:(Sample:DWORD);    // see below
    3:(cb:DWORD);        // see below
    4:(ticks:DWORD);     // see below
    5:(st:Tsmpte);
    6:(md:Tmidi);
  end;
  TSoundGenerator = class
      res:MMRESULT;
      ErrorString:string;

      hwo:HWAVEOUT;
      wfx  :WAVEFORMATEX;
      wh   :WAVEHDR;
      mmt  : MMTIME;
      //wdata2:array[0..wdataSize-1] of byte;   //  for 16bit
      wdata2:array[0..wdataSize-1] of SmallInt;
      PSG:array[0..Regs] of integer;
  // PSG:0-(VolBase-1) Tone    VolBase-Regs Volume

      BSize,NextBSize:Integer;

      cbwh :integer;
      Pos,PrevPos,RPos:integer;
      LoopCount:integer;
      WaveAd:integer;
      InitialTime,PrevTime,RefreshTime:Longint;
      WriteAd:integer;
      SccCount:array [0..Chs-1] of Integer;
      Steps:array [0..Chs-1] of integer;
      SccWave:array [0..Chs-1] of PChar;
      WaveDat:array [0..WvC-1,0..WvElC-1] of Byte;
      RefreshRate:longint;
      RRPlus,PosPlus:integer;

      WavPlaying:Boolean;
      IsError:Boolean;

      // from TEnveloper
      {EShape:array [0..Chs-1] of PChar;
      EVol,ESpeed,ECount:array [0..Chs-1] of Word;
      Oct:array [0..Chs-1] of Byte;
      MCount:array [0..Chs-1] of Integer;
      MPoint:array [0..Chs-1] of PChar;
      }

      procedure InitWave;
      constructor Create (Handle:Hwnd);

      procedure Start;
      procedure Stop;

      destructor Destroy; override;

      //procedure RefreshPSG;
      function SetError (res:MMRESULT):string;
      procedure PutPSG (index,v:integer);
      function GetPSG (index:integer):integer;
      procedure ResetTimer;
      procedure WRRPlus (v:integer);
      procedure WPosPlus (v:integer);
      procedure ClearBuffer;
      procedure SetBSize (i:Integer);

      property Sound[index:integer]:integer read GetPSG write PutPSG;
      property RRShift:integer write WRRPlus;
      property PosShift:integer write WPosPlus;

      property BufferSize:Integer read NextBSize write SetBSize;
      // from TEnveloper
      //procedure PutEnv (c,t,v,sp:Word;s:PChar);

  end;

const
{  SPS=22050;
  SPS96=22080;
  SPS_60=22050 div 60;
 }
  SPS=44100;
  SPS96=22080;
//  SPS96=44160;
  SPS_60=44100 div 60;

  DivClock=111860.78125;
  LOOPS=163840;
  SCCWdata3: array[0..31] of byte
   = (128,138,140,139,141,138,141,140,142,138,139,140,143,138,128,110
      ,108,106,106,108,109,107,105,108,129,110,108,105,108,110,115,120);
  SCCWdata2: array[0..31] of byte
   = (106,108,110,112,114,116,118,120,122,124,126,128,130,132,134,136
      ,138,140,142,100,100,141,141,141,142,100,100,142,143,143,128,128);
  SCCWdata: array[0..31] of byte
   = (106,108,116,108,104,106,108,105,106,106,108,109,104,115,128,136
      ,138,140,142,140,140,141,141,141,142,140,140,142,143,143,138,118);

  VolBase=Chs*2;


implementation
{$ifdef ForM2}
//uses SWave;
{$endif}
procedure TSoundGenerator.SetBSize (i:Integer);
begin
     if (i>=256) and (i<60000) then begin
        NextBSize:=i;
     end;
end;

function TSoundGenerator.SetError (res:MMRESULT):string;
var s:string;
begin
     s:='MMSYSTEM'+IntToStr (Integer(res));
     case res of
     MMSYSERR_NOERROR:   s:='MMSYSERR_NOERROR';
     MMSYSERR_ALLOCATED: s:='MMSYSERR_ALLOCATED';
     MMSYSERR_BADDEVICEID: s:='MMSYSERR_BADDEVICEID';
     MMSYSERR_NODRIVER:s:='MMSYSERR_NODRIVER';
     MMSYSERR_NOMEM:s:='MMSYSERR_NOMEM';
     WAVERR_BADFORMAT:s:='WAVERR_BADFORMAT';
     WAVERR_SYNC:s:='WAVERR_SYNC';
     MMSYSERR_INVALHANDLE:s:='MMSYSERR_INVALHANDLE';
     WAVERR_UNPREPARED:s:='WAVERR_UNPREPARED';
     MMSYSERR_NOTSUPPORTED:s:='MMSYSERR_NOTSUPPORTED';
     end;
     SetError:=s;
     ErrorString:=s;
     result:=s;
end;

procedure TSoundGenerator.InitWave;
var i,j:Integer;
begin
     for i:=0 to WvC-1 do begin
         for j:=0 to WvElC div 2-1 do begin
             WaveDat[i,j]:=103;
             WaveDat[i,j+WvElc div 2]:=153;
         end;
     end;
end;

constructor TSoundGenerator.Create (Handle:Hwnd);
var
   s:string;
   //res:MMRESULT;
   i:integer;
   fp:file;
begin
     IsError:=False;
     WriteAd:=0;
     WaveAd:=0;
     WavPlaying:=False;
     BSize:=11025*2;
     NextBSize:=BSize;
     InitWave;
     for i:=0 to Chs-1 do Sccwave[i]:=@WaveDat[0,0];
     for i:=0 to BSize-1 do wdata2[i]:=0; //128;              // 0 for 16bit

     ResetTimer;
     PSG[0]:=0;
     PSG[1]:=1;
     PSG[8]:=10;

     WaveAd:=0;
     RRPlus:=3000;
     PosPlus:=200;

     PrevPos:=0;

end;

procedure TSoundGenerator.Start;
begin
     if WavPlaying then exit;

     BSize:=NextBSize;
     ClearBuffer;

     {WriteAd:=0;
     WaveAd:=0;}


     wfx.wFormatTag:=WAVE_FORMAT_PCM;
     wfx.nChannels:=1;
     wfx.nSamplesPerSec:=SPS;
     wfx.nAvgBytesPerSec:=wfx.nSamplesPerSec;
//     wfx.wBitsPerSample:=8;                    // 16 for 16bit
     wfx.wBitsPerSample:=16;                   
     wfx.nBlockAlign:=wfx.nChannels*wfx.wBitsPerSample div 8;
     wfx.cbSize:=0;

     res:=WaveOutOpen (@hwo,WAVE_MAPPER,@wfx,0,0,CALLBACK_NULL);
     if res<>MMSYSERR_NOERROR then begin
         SetError(res);
         {$ifdef ForM2}
         //ShowMessage (SetError (res)+': 他のアプリケーションが音を使ってます。他アプリケーションの音を止めて下さい');
         {$endif}
         IsError:=True;
         exit;
     end;

     cbwh:=SizeOf(WAVEHDR);

     res:=WaveOutReset (hwo);

     LoopCount:=0;
     wh.lpData:=@wdata2;
     wh.dwBufferLength:=BSize*2;              // *2 for 16bit
     wh.dwFlags:=WHDR_BEGINLOOP or WHDR_ENDLOOP;
     wh.dwLoops:=LOOPS;

     res:=WaveOutPrepareHeader (hwo,@wh,cbwh);
     if res<>MMSYSERR_NOERROR then begin
         SetError(res);
         IsError:=True;
         exit;
     end;
     res:=WaveOutWrite (hwo,@wh,cbwh);
     PrevPos:=0;
     if res<>MMSYSERR_NOERROR then begin
        SetError(res);
         //ShowMessage (SetError (res)+': 他のアプリケーションが音を使ってます。他アプリケーションの音を止めて下さい');
         IsError:=True;
         exit;
     end;
     IsError:=False;

     WaveOutRestart (hwo);
     WavPlaying:=True;



end;

procedure TSoundGenerator.ClearBuffer;
var i:Integer;
begin
     for i:=0 to BSize-1 do begin
         wdata2[i]:=128;
     end;
end;

procedure TSoundGenerator.Stop;
//var  res:MMRESULT;
begin
     if WavPlaying then begin
        WaveOutReset (hwo);
        ClearBuffer;
        res:=WaveOutUnPrepareHeader (hwo,@wh,cbwh);
        WaveOutClose (hwo);
     end;
     WavPlaying:=False;
end;

destructor TSoundGenerator.Destroy;
begin
     Stop;
end;

procedure TSoundGenerator.WRRPlus (v:integer);
begin
     if (v<0) or (v>BSize) then exit;
     RRPlus:=v;
end;

procedure TSoundGenerator.WPosPlus (v:integer);
begin
     if (v<-BSize+1) or (v>BSize) then exit;
     PosPlus:=v;
end;

procedure TSoundGenerator.ResetTimer;
begin
     RefreshTime:=0;
end;

procedure TSoundGenerator.PutPSG (index,v:integer);
var maxv:integer;
begin
     if (index<0) or (index>Regs) then exit;
     if index<VolBase then maxv:=255 else maxv:=15;
     if (v<0) or (v>maxv) then exit;
     PSG[index]:=v;
end;

function TSoundGenerator.GetPSG (index:integer):integer;
begin
     if (index<0) or (index>Regs) then exit;
     result:=PSG[index];
end;

end.
