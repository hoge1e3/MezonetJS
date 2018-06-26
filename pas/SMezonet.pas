unit SMezonet;
{$define ForDelphi}
interface

{$ifdef ForDelphi}
uses SoundKer,SEnv,SWavLoad,ExtCtrls,Classes,SysUtils,Windows;
{$else}
uses SoundKer,SEnv,SWavLoad,Classes,SysUtils,Windows;
{$endif}

const Chs=10;
      Version=1200;


type
    TMZError = (MZE_NoError,MZE_NotFound,MZE_BadFormat,MZE_Broken,
      MZE_Unavailable,MZE_Version);

    NiseAr = array [0..1000000] of Integer;
    PNise = ^NiseAr;

    {$ifdef ForDelphi}
    TMezonet = class (TTimer)
    {$else}
    TMezonet = class
    {$endif}
      private
        Sg:TEnveloper;
        BinBuf:array [0..Chs-1] of PChar;
        CurSe:Pointer;
        SeList:TList;
        LastSeTime:Integer;
        //FBSize:Integer;
        procedure putBS (i:Integer);
        function getBS:Integer;
        procedure setDelay (i:Integer);
        function getDelay:Integer;
        procedure FRefresh (Sender:TObject);
      public
        EState:TMZError;
        {$ifdef ForDelphi}
        constructor Create (AOwner:TComponent); override;
        {$else}
        constructor Create;
        {$endif}
        destructor Destroy; override;

        function OnOff (t:Boolean):TMZError;
        procedure LoadWaveData (fn:String);
        procedure Clear;
        procedure WriteChannel (cn:Integer;p:PChar);
        function Load (fn:string):TMZError;
        function Play:TMZError;
        procedure Stop;
        function LoadSe (fn:String):Pointer;
        procedure FreeSe (p:Pointer);
        procedure FreeAllSe ;
        procedure PlaySe (P:Pointer;v:Integer;rept:Boolean);
        procedure PlaySePrio (P:Pointer;v:Integer);
        {procedure PlaySeWait (P:Pointer;v:Integer);
        procedure PlaySePrioWait (P:Pointer;v:Integer);}
        function CurrentSe:Pointer;
        function IndexOfSe (P:Pointer):Integer;
        function IsError:Boolean;
        procedure Refresh;
        function Caption:String;
        function GetVersion:Integer;
        function GetWavDat (wn:Integer):Pointer;
        procedure SaveWave (fn:string);
        procedure LoadWave (fn:string);

        function GetSg (PassWd:Integer):TEnveloper;
        procedure setFade(f:Integer);

        procedure setSound( ch:Integer; typ:Integer; val:Integer ; time:Integer);
        function getPlayPos(ty:Integer):Integer;
        procedure setWriteMaxLen(i:Integer);

        function Start:TMZError;
        procedure calibration(len:Integer; pos:Integer);
        //function getTimeLag:Integer;
      published
        property BufferSize:Integer read getBS write putBS;// default 11025;
        property Delay:Integer read getDelay write setDelay;
    end;

procedure IncGar;
procedure DecGar;
procedure IncGar_new;
procedure DecGar_new;

procedure Register;

var
   Gar,Gar_new:Integer;
{$ifndef ForDelphi}
   MZ1:TMezonet;
{$endif}

implementation

procedure TMezonet.calibration(len:Integer; pos:Integer);
begin
        Sg.calibrationLen:=len;
        if len>0 then
                Sg.timeLag:=pos;
end;

procedure TMezonet.setSound( ch:Integer; typ:Integer; val:Integer ; time:Integer);
begin
      if Sg<>nil then Sg.setSoundTime(ch,typ,val,time);
end;
function TMezonet.getPlayPos(ty:Integer):Integer;
begin
       result:=0;
      if Sg<>nil then begin
          case ty of
          0:result:= Sg.getPlayPos;
          1:result:= Sg.LastWriteStartPos;
          2:result:= Sg.LastWriteEndPos;
          3:result:= Sg.BufferUnderRun;
          end;
      end;
end;

procedure IncGar;
begin
     inc(Gar);
end;

procedure DecGar;
begin
     dec(Gar);
end;

procedure IncGar_new;
begin
     inc(Gar_new);
end;

procedure DecGar_new;
begin
     dec(Gar_new);
end;


//uses Dialogs;

procedure Register;
begin
     {$ifdef ForDelphi}
     RegisterComponents ('Samples',[TMezonet]);
     {$endif}
end;

function TMezonet.GetSg (PassWd:Integer):TEnveloper;
begin
     result:=Sg;
     if PassWd<>62574982 then result:=nil;
end;

procedure TMezonet.SaveWave (fn:string);
var f:file;
    r:Integer;
begin
     AssignFile (f,fn);
     ReWrite (f,1);
     BlockWrite (f,Sg.WaveDat,WvElc*WvC,r);
     BlockWrite (f,Sg.EnvDat,Envs*32,r);
     CloseFile (f);
end;

procedure TMezonet.LoadWave (fn:string);
var f:file;
    r:Integer;
begin
     AssignFile (f,fn);
     ReSet (f,1);
     BlockRead (f,Sg.WaveDat,WvElc*WvC,r);
     BlockRead (f,Sg.EnvDat,Envs*32,r);
     CloseFile (f);

end;

function TMezonet.GetWavDat (wn:Integer):Pointer;
begin
     result:=@(Sg.WaveDat[wn,0]);
end;

procedure TMezonet.WriteChannel (cn:Integer;p:PChar);
begin
     BinBuf[cn]:=p;
end;

function TMezonet.GetVersion:Integer;
begin
     result:=Version;
end;

function TMezonet.Caption:String;
begin
     result:=Sg.comStr;
end;

function TMezonet.IsError:Boolean;
begin
     result:=Sg.IsError;
end;

function TMezonet.getDelay:Integer;
begin
     result:=Sg.Delay;
end;

procedure TMezonet.setDelay (i:Integer);
begin
     if (i>=0) and (i<BufferSize-10) then
        Sg.Delay:=i;
end;

function TMezonet.getBS:Integer;
begin
     //ShowMessage ('iwa'+IntToStr (Sg.BufferSize));
     result:=Sg.BufferSize;
end;

procedure TMezonet.putBS (i:Integer);
begin
     //if (i>=256) and (i<20000) then begin
     Sg.BufferSize:=i;
        //if (Sg<>nil) then Sg.BSize:=FBSize;
     //end;
end;
procedure TMezonet.setWriteMaxLen(i:Integer);
begin
      Sg.WriteMaxLen:=i;
end;

destructor TMezonet.Destroy;
var i,c:Integer;
begin
     //if not (csDesigning in ComponentState) then begin
       i:=0;c:=SeList.Count;
       while i<c do begin
         FreeSe (SeList[0]);
         inc (i);
       end;
       if SeList<>nil then begin
         SeList.Free;DecGar;
       end;
       Stop;
       Clear;
       if Sg<>nil then begin
          Sg.Free;DecGar;
          Sg:=nil;
       end;   
     //end;
     {$ifdef ForDelphi}
     inherited Destroy;
     {$endif}
end;

{$ifdef ForDelphi}
constructor TMezonet.Create (AOwner:TComponent);
{$else}
constructor TMezonet.Create;
{$endif}
var Chn:Integer;
begin
     for Chn:=0 to Chs-1 do begin
         BinBuf[Chn]:=nil;
     end;
     //FBSize:=11025;
     EState:=MZE_NoError;
     Sg:=nil;
     {$ifdef ForDelphi}
     inherited Create (AOwner);
     Interval:=50;
     {$endif}
     //if not (csDesigning in ComponentState) then begin
       SeList:=TList.Create;  IncGar;
       Sg:=TEnveloper.Create (GetDesktopWindow);IncGar;
       //BufferSize:=FBSize;
       Clear;
       if FileExists ('tones.wdt') then LoadWaveData ('tones.wdt');
     //end;
     CurSe:=nil;
end;

procedure TMezonet.LoadWaveData (fn:String);
var f:file;
    r:Integer;
begin
     AssignFile (f,fn);
     ReSet (f,1);
     BlockRead (f,Sg.WaveDat,WvElc*WvC,r);
     BlockRead (f,Sg.EnvDat,Envs*32,r);
     CloseFile (f);
end;

function TMezonet.OnOff (t:Boolean):TMZError;
begin
     if t then Sg.Start
     else Sg.Stop;
     if IsError then EState:=MZE_Unavailable
     else EState:=MZE_NoError;
     result:=EState;
end;

function TMezonet.Play:TMZError;
var Chn:Integer;
begin
     //Interval:=50;
     {$ifdef ForDelphi}
     OnTimer:=FRefresh;
     {$endif}
//     Enabled:=True;
     OnOff (True);

     if not IsError then begin
       for Chn:=0 to Chs-1 do
         if BinBuf[Chn]<>nil then
          Sg.PlayMML (Chn,BinBuf[Chn]+4);
     end;
     result:=EState;
end;
function TMezonet.start:TMZError;
begin
     Sg.Start;
     result:=MZE_NoError;
end;

procedure TMezonet.setFade(f:Integer);
begin
     if not IsError then begin
        Sg.Fading:=f;
     end;
end;

procedure TMezonet.Stop;
var Chn:Integer;
begin
     //Sg.Stop;
     if not IsError then begin
      for Chn:=0 to Chs-1 do
         Sg.StopMML (Chn);
      Sg.stopLoopSe;
     end;
end;

procedure TMezonet.FreeSe (p:Pointer);
var r:TWavLoader;
begin
     OnOff(False);
     Sg.StopAllSe;
     r:=p;
     if r=nil then exit;
     if SeList.IndexOf (r)>=0 then begin
        SeList.Remove (r);
        r.Free;DecGar;
     end;
end;

procedure TMezonet.FreeAllSe;
var i,c:Integer;
begin
     i:=0;c:=SeList.Count;
     while i<c do begin
        FreeSe (SeList[0]);
        inc (i);
     end;
     for i:=0 to Ses-1 do begin
      Sg.SeLen[i]:=0;
      Sg.SePt[i]:=nil;
     end; 
end;

function TMezonet.LoadSe (fn:String):Pointer;
var r:TWavLoader;
begin
     r:=TWavLoader.Create (fn); IncGar;

     EState:=MZE_NoError;
     if r.ErrorNotFound then EState:=MZE_NotFound;
     if r.ErrorFormat then EState:=MZE_BadFormat;
     result:=nil;
     if EState=MZE_NoError then begin
          SeList.Add (r);
          result:=r;
     end;
end;

procedure TMezonet.PlaySe (P:Pointer;v:Integer;rept:Boolean);
var r:TWavLoader;
begin
     OnOff (True);
     if not IsError then begin
        r:=P;
        if r=nil then exit;
        Sg.PlaySe (0,r.Start,r.Len,v,rept);
        LastSeTime:=GetTickCount;
        Curse:=p;
     end;
end;

procedure TMezonet.PlaySePrio (P:Pointer;v:Integer);
var r:TWavLoader;
begin
     if IndexOfSe(CurrentSe)<=IndexOfSe(P) then begin
        if (CurrentSe<>P) or (GetTickCount-LastSeTime>20) then PlaySe (P,v,False);
     end;
end;

{procedure TMezonet.PlaySeWait (P:Pointer;v:Integer);
var r:TWavLoader;
begin
     OnOff (True);
     if not IsError then begin
        r:=P;
        //Sg.PlaySe (0,r.Start,r.Len,v);
        if r=nil then exit;
        Sg.SePt:=r.Start;
        Sg.SeLen:=r.Len;
        Sg.SeVol:=v;

        LastSeTime:=GetTickCount;
        Curse:=p;
     end;
end;

procedure TMezonet.PlaySePrioWait (P:Pointer;v:Integer);
var r:TWavLoader;
begin
     if IndexOfSe(CurrentSe)<=IndexOfSe(P) then begin
        if (CurrentSe<>P) or (GetTickCount-LastSeTime>20) then PlaySeWait (P,v);
     end;
end;}


function TMezonet.CurrentSe:Pointer;
begin
     if Sg.SeLen[0]<=0 then CurSe:=nil;
     result:=CurSe;
end;

function TMezonet.IndexOfSe (P:Pointer):Integer;
begin
     result:=SeList.IndexOf (P);
end;

{function TMezonet.SeAt (P:Pointer):Pointer;
begin
     result:=SeList.IndexOf (P);
end;
}

procedure TMezonet.Clear;
var Chn:Integer;
begin
     Stop;
     for Chn:=0 to Chs-1 do begin
         if BinBuf[Chn]<>nil then begin
            FreeMem (BinBuf[Chn]);    DecGar_new;
            BinBuf[Chn]:=nil;
         end;
     end;
end;

function TMezonet.Load (fn:string):TMZError;
var Chn,Ver,Size,FSize:Integer;
    f:file;
    d:PNise;
begin
   try
     EState:=MZE_NoError;

     try
       AssignFile (f,fn);
       ReSet (f,1);
     except
       EState:=MZE_NotFound;
       exit;
     end;

     FSize:=FileSize (f);

     BlockRead (f,Ver,4);
     if Ver>Version then
       //ShowMessage ('このオブジェクトはバージョンが新しいため、演奏できない可能性があります。');
       EState:=MZE_Version;

     BlockRead (f,Chn,1);
     Chn:=Chn and 255;
     if Chn<>Chs then begin
        EState:=MZE_Broken;
        //ShowMessage ('このオブジェクトは壊れています');
        exit;
     end;

     Clear;
     for Chn:=0 to Chs-1 do begin
         BlockRead (f,Size,4);
         if Size>FSize then begin
            EState:=MZE_Broken;
            //ShowMessage ('このオブジェクトは壊れています!');
            Clear;
            exit;
         end;
         if Size>0 then begin
             GetMem (BinBuf[Chn],Size+4); IncGar_new;
             d:=PNise(BinBuf[Chn]);
             d^[0]:=Size;
             BlockRead (f,d^[1],Size);
         end;
     end;
    finally
     //CloseFile (f);
     if EState<>MZE_NotFound then CloseFile (f);
     result:=EState;
    end;
end;

procedure TMezonet.Refresh;
begin
     if Sg=nil then exit;
     if not IsError then
        Sg.RefreshPSG;
end;

procedure TMezonet.FRefresh (Sender:TObject);
begin
     Refresh;
end;


end.