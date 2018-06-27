unit SEnv;
interface
{$ifdef ForM2}
uses SoundKer,Windows,MMsystem,SysUtils,SWavSave,SWavLoad,SCtrl;
{$else}
uses SoundKer,Windows,MMsystem,SysUtils,SWavLoad;
{$endif}

const
     Ses=10;

{   99=r 100=vol 101=ps (x*128)  255=end}
    MRest=99;
    MVol=100;
    Mps=101;
    MSelWav=102;
    MTempo=103;
    MJmp=104;
    MSlur=105;
    MPor=106;
    MSelEnv=107;
    MWait=108;
    MCom=109;
    MDet=110;
    MWOut=111;
    MWEnd=112;
    MWrtWav=113;
    MWrtEnv=114;
    MLfo=115;
    MSync=116;
    MPCMReg=117;
    MLfoD=118;
    MBaseVol=119;

    Mend=255;

    //sync=0:非同期、1:同期、2:ワンショット 3:鋸波形
    LASync = 0;
    LSync= 1;
    LOneShot =2;
    LSaw=3;

    Envs=16;
    PCMWavs=16; // 96-111
    FadeMax=256;

    sinMax_s=5;
    sinMax=65536 shr sinMax_s;  //2048;

     m2t:array [0..95] of Word
     =($d5d,$c9c,$be7,$b3c,$a9b,$a02,$973,$8eb,$86b,$7f2,$780,$714,
     $6af,$64e,$5f4,$59e,$54e,$501,$4ba,$476,$436,$3f9,$3c0,$38a,
     $357,$327,$2fa,$2cf,$2a7,$281,$25d,$23b,$21b,$1fd,$1e0,$1c5,
     $1ac,$194,$17d,$168,$153,$140,$12e,$11d,$10d,$fe,$f0,$e3,
     $d6,$ca,$be,$b4,$aa,$a0,$97,$8f,$87,$7f,$78,$71,
     $6b,$65,$5f,$5a,$55,$50,$4c,$47,$43,$40,$3c,$39,
     $35,$32,$30,$2d,$2a,$28,$26,$24,$22,$20,$1e,$1c,
     $1b,$19,$18,$16,$15,$14,$13,$12,$11,$10,$f,$e);

    stEmpty=-1;
    stFreq=1;
    stVol=2;
    stWave=3;
    sndElemCount=64;

type
     TSoundElem = record
         time:Integer;
         typ:Integer;
         val:Integer;
     end;
     TPlayState = (psPlay,psStop,psWait,psPause);
     TEnveloper = class (TSoundGenerator)
         BeginPlay:Boolean;
         SeqTime,SeqTime120:Integer;

         WavOutMode:Boolean;
         {$ifdef ForM2}
         WavOutObj:TWaveSaver;
         {$endif}
         EShape:array [0..Chs-1] of PChar;
         EVol,EBaseVol,ESpeed,ECount:array [0..Chs-1] of Word;
         Oct:array [0..Chs-1] of Byte;
         MCount:array [0..Chs-1] of Integer;
         MPoint:array [0..Chs-1] of PChar;
         Resting:array [0..Chs-1] of Boolean;
         PlayState:array [0..Chs-1] of TPlayState;
         Slur,Sync:array [0..Chs-1] of Boolean;
         Detune:array [0..Chs-1] of Integer;
         PorStart,PorEnd,PorLen:array [0..Chs-1] of Integer;
         LfoV,LfoA,LfoC,LfoD,LfoDC,LfoSync:array [0..Chs-1] of Integer;
         //sync=0:非同期、1:同期、2:ワンショット 3:鋸波形
         Fading:Integer;

         CurWav:array [0..Chs-1] of Integer;
         L2WL:array [0..Chs-1] of Integer;
         // log 2 WaveLength
         PCMW:array [0..PCMWavs-1] of TWavLoader;

         SeLen,SeVol,SeReptLen:array [0..Ses-1] of Integer;
         SePt:array [0..Ses-1] of PChar;
         Delay:Integer;

         WTime:Integer;
         //PrevWSum:Integer;
         Tempo:Integer;
         ComStr,WFilename:string;

         EnvDat:array [0..Envs-1,0..31] of Byte;

         LastWriteStartPos,LastWriteEndPos:Integer;
         BufferUnderRun:Integer;

         WriteMaxLen:Integer;
         calibrationLen:Integer;
         timeLag:Integer;
         //---
         sndElems:array [0..chs-1,0..SndElemCount-1] of TSoundElem;
         nextPokeElemIdx:array [0..chs-1] of Integer;
         nextPeekElemIdx:array [0..chs-1] of Integer;
         soundMode :array [0..chs-1] of Boolean;

         procedure calibration;
         procedure InitSin;
         procedure InitEnv;
         procedure ConvM2T;
         procedure PutEnv (c,t,v,sp:Word;s:PChar);
         {$ifdef ForM2}
         procedure WOutStart;
         procedure WOutEnd;
         procedure SetWOutMode (b:Boolean);
         {$endif}
         procedure Start;
         procedure RefreshPSG;
         procedure PlayKeyBd (n,WaveSel:Integer);
         constructor Create(Handle:Hwnd);
         procedure Play1Sound (c,n:Word;iss:Boolean);
         procedure Play1Por (c,f,t:Word;iss:Boolean);
         //procedure MMLProc (i:Integer);
         procedure PlayMML (c:Word;s:PChar);
         procedure StopMML (c:Integer);
         procedure stopLoopSe;
         procedure stopAllSe;
         procedure RestartMML (c:Integer);
         procedure WaitMML (c:Integer);
         procedure PlaySe (sn:Integer;p:PChar;l:Integer;v:Integer;rept:Boolean);
         procedure SelWav (ch,n:Integer);
         procedure RegPCM (fn:string;n:Integer);

         procedure setSound(ch:Integer; typ:Integer; val:Integer);
         procedure setSoundTime(ch:Integer; typ:Integer; val:Integer; t:Integer);
         function getPlayPos:Integer;
     end;

var m2tInt:array[0..95] of Integer;
    sinT:array [0..sinMAX-1] of ShortInt;
    TTL:Integer;
    cnt:Integer;// debug

implementation

uses SMezonet;

function TEnveloper.getPlayPos:Integer;
begin
     if not(WavPlaying) then exit;
     mmt.wType:=TIME_SAMPLES;
     WaveOutGetPosition (hwo, @mmt, SizeOf(MMTIME));
     result:=mmt.Sample+ timeLag;
end;

procedure TEnveloper.setSound(ch:Integer; typ:Integer; val:Integer);
begin
     soundMode[ch]:=True;
     case typ of
     stFreq:
           Steps[ch]:=val;
     stVol:
           EVol[ch]:=val;

     end;
end;
procedure TEnveloper.setSoundTime(ch:Integer; typ:Integer; val:Integer; t:Integer);
var e:^TSoundElem;
begin
     soundMode[ch]:=True; // TODO: ほんとはまずい(t が遠い未来のばあい）
     e:=@sndElems[ch, nextPokeElemIdx[ch]];
     e.time:=t;
     e.typ:=typ;
     e.val:=val;
     nextPokeElemIdx[ch]:=(nextPokeElemIdx[ch]+1) mod sndElemCount;
     
end;

procedure TEnveloper.stopLoopSe;
var i:Integer;
begin
        for i:=0 to Ses-1 do begin
            if SeReptLen[i]>0 then begin
                SeReptLen[i]:=0;
                SeLen[i]:=0;
            end;
        end;
end;

procedure TEnveloper.stopAllSe;
var i:Integer;
begin
        for i:=0 to Ses-1 do begin
            SeLen[i]:=0;
            SePt[i]:=nil;
        end;
end;


procedure TEnveloper.InitSin;
var i:Integer;
begin
     for i:=0 to sinMax-1 do begin
         sinT[i]:=Trunc (sin(3.1415926*2*i/sinMax)*127);
         {if ((i and 127)=0) then
            ShowMessage (IntToStr (sinT[i]));}
     end;

end;

procedure TEnveloper.InitEnv;
var i,j:Integer;
begin
     for i:=0 to Envs-1 do begin
         for j:=0 to 31 do begin
             EnvDat[i,j]:=(31-j) div 2;
         end;
     end;
end;

procedure TEnveloper.ConvM2T;
var i:Integer;
begin
     for i:=0 to 95 do begin
         m2tInt[i]:=Trunc (DivClock*65536/m2t[i{12+(95-i) mod 48}]*65536/SPS);
     end;
end;


constructor TEnveloper.Create (Handle:Hwnd);
var i,j:Integer;
begin
     inherited Create (Handle);
     Delay:=2000;
     InitEnv;
     InitSin;
     ConvM2T;
     for i:=0 to PCMWavs-1 do begin
         PCMW[i]:=nil;
     end;
     for i:=0 to Chs-1 do begin
         EShape[i]:=@EnvDat[0,0];
         EVol[i]:=0;
         EBaseVol[i]:=128;
         MPoint[i]:=nil;
         ESpeed[i]:=5;
         PlayState[i]:=psStop;
         Detune[i]:=0;
         LfoV[i]:=0;
         SelWav(i,0);
         LfoD[i]:=0;
         LfoDC[i]:=0;
         {for j:=0 to SndElemCount-1 do begin
            sndElems[i][j].typ:=stEmpty;
         end;}
         nextPokeElemIdx[i]:=0;
         nextPeekElemIdx[i]:=0;
         soundMode[i]:=False;
     end;
     for i:=0 to Ses-1 do begin
         SeLen[i]:=0;
     end;
     Fading:=FadeMax;
     timeLag:=2000;

     WriteMaxLen:=20000;
     WavOutMode:=False;
     WFilename:='';
     {$ifdef ForM2}
     WavOutObj:=nil;
     {$endif}
     Tempo:=120;
     ComStr:='';
end;

procedure TEnveloper.PutEnv (c,t,v,sp:Word;s:PChar);
begin
     Sound[c*2]:=t and 255;
     Sound[c*2+1]:=t div 256;
     EVol[c]:=v;
     ESpeed[c]:=sp;
     ECount[c]:=0;
     EShape[c]:=s;
end;

procedure TEnveloper.Play1Sound (c,n:Word;iss:Boolean);
var TP:Integer;
begin
     if soundMode[c] then exit;
     if n=MRest then begin
         Resting[c]:=True;
         exit;
     end;
     if (c<0) or (c>=Chs) or (n<0) or (n>95) then exit;
     Resting[c]:=False;
     {Sound[c*2]:=m2t[n] and 255;
     Sound[c*2+1]:=m2t[n] div 256;}
     if not (iss) then begin
        ECount[c]:=0;
        if Sync[c] then SccCount[c]:=0;
        if LfoSync[c]<>LASync then LfoC[c]:=0;
     end;
     {TP:=PSG[0+c*2]+PSG[1+c*2]*256;
     if TP=0 then TP:=1;}

     if CurWav[c]<Wvc then
        Steps[c]:=m2tInt[n]+Detune[c]*(m2tInt[n] div 2048)//Trunc (DivClock/TP*65536/SPS);
        // m2tInt*(1+Detune/xx)    (1+256/xx )^12 =2  1+256/xx=1.05946
        //    256/xx=0.05946   xx=256/0.05946  = 4096?
     else begin
        if L2WL[c]>=2 then
           Steps[c]:=($40000000 shr (L2WL[c]-2))
                     div (m2tInt[36] div 65536) * (m2tInt[n] div 65536);
     end;

     PorLen[c]:=-1;
end;

procedure TEnveloper.Play1Por (c,f,t:Word;iss:Boolean);
var TP:Integer;
begin
     if (c<0) or (c>=Chs) or (f<0) or (f>95)or
        (f<0) or (f>95) then exit;
     Resting[c]:=False;

     //TP:=m2t[f];
     PorStart[c]:=m2tInt[f]+Detune[c]*m2tInt[f] div 2048;//Trunc (DivClock/TP*65536/SPS)+Detune[c];
     //TP:=m2t[t];
     PorEnd[c]:=m2tInt[t]+Detune[c]*m2tInt[t] div 2048;//Trunc (DivClock/TP*65536/SPS)+Detune[c];

     if not (iss) then ECount[c]:=0;

end;
{$ifdef ForM2}
procedure TEnveloper.SetWOutMode (b:Boolean);
begin
     WavOutMode:=b;
     WFilename:='';
end;

procedure TEnveloper.WOutStart;
begin
     if WavOutObj=nil then begin
        WavOutObj:=TWaveSaver.Create (WFilename,BSize*2);IncGar;
     end;
end;

procedure TEnveloper.WOutEnd;
begin
     if WavOutObj<>nil then begin
      WavOutObj.Free;DecGar;
      WavOutObj:=nil;
     end;
end;
{$endif}
procedure TEnveloper.PlayMML (c:Word;s:PChar);
begin
     if (c<0) or (c>=Chs) then exit;
     MPoint[c]:=s;
     PlayState[c]:=psPlay;
     MCount[c]:=SeqTime;
     LoopCount:=Loops+1;
end;

procedure TEnveloper.StopMML (c:Integer);
begin
     if (c<0) or (c>=Chs) then exit;
     //MPoint[c]:=nil;
     WaitMML (c);
     PlayState[c]:=psStop;
     MCount[c]:=SeqTime+1;
     //WOutEnd;
end;

procedure TEnveloper.RestartMML (c:Integer);
begin
     if (c<0) or (c>=Chs) then exit;
     if PlayState[c]=psWait then begin
        PlayState[c]:=psPlay;
        MCount[c]:=SeqTime+1;
     end;
end;

procedure TEnveloper.WaitMML (c:Integer);
var i:Integer;
begin
     if (c<0) or (c>=Chs) then exit;
     //MPoint[c]:=nil;
     PlayState[c]:=psWait;
     MCount[c]:=SeqTime+1;
     i:=0; while i<Chs do begin
         if PlayState[i]=psPlay then break;
         inc (i);
     end;
     if i>=Chs then begin
         for i:=0 to Chs-1 do begin
              RestartMML (i);
         end;
     end;
end;

procedure TEnveloper.Start;
var i:Integer;
begin
     if WavPlaying then exit;
     inherited Start;

     for i:=0 to chs-1 do begin
         nextPokeElemIdx[i]:=0;
         nextPeekElemIdx[i]:=0;
         soundMode[i]:=False;
     end;
     LastWriteEndPos:=0;
     BeginPlay:=True;
end;

procedure TEnveloper.SelWav (ch,n:Integer);
begin
     CurWav[ch]:=n;
     if n<Wvc then begin
        SccWave[ch]:=@WaveDat[n,0];
        L2WL[ch]:=5;
        Sync[ch]:=False;
     end else begin
         if PCMW[n-Wvc]<>nil then begin
            SccWave[ch]:=PCMW[n-Wvc].Start;
            L2WL[ch]:=PCMW[n-Wvc].Log2Len;
            Sync[ch]:=True;
         end;
     end;
end;

procedure TEnveloper.RegPCM (fn:string;n:Integer);
var i:Integer;
    wl,wl2:TWavLoader;
begin
     if not FileExists(fn) then begin
        fn:=ExtractFilePath (ParamStr(0))+'\'+fn;
        if not FileExists(fn) then exit;
     end;
     for i:=0 to Chs-1 do
         if CurWav[i]=n then SelWav(i,0);
     wl:=TWavLoader.Create (fn);IncGar;
     if not wl.isError then begin
        if PCMW[n-Wvc]<>nil then begin
           PCMW[n-Wvc].Free; DecGar;
        end;   
        wl2:=TWavLoader.Clone (TObject(wl));  IncGar;
        PCMW[n-Wvc]:=wl2;
     end;
     wl.Free;   DecGar;

end;

procedure TEnveloper.RefreshPSG;
var i,ch,WaveMod,WriteBytes,wdtmp,inext,mid,w1,w2,APos:integer;
    TP,vCenter:array [0..Chs-1] of Integer;
    //Steps:array [0..Chs-1] of Integer;
    Lambda,NewLambda:Real;
    res:MMRESULT;
    WriteTwice,LfoInc:Boolean;
    WriteMax:integer;
    nowt:longint;
   // AllVCenter:Integer;
    Wf,Wt,WMid,WRes,WSum,v,NoiseP,Tmporc:Integer;
    LParam,WParam:Byte;
    JmpSafe,EnvFlag:Integer;
    se:^TSoundElem;
begin
     if not(WavPlaying) then exit;
     if BSize>wDataSize then BSize:=wDataSize;
     mmt.wType:=TIME_SAMPLES;
     WaveOutGetPosition (hwo, @mmt, SizeOf(MMTIME));
     //ShowMessage (IntToSTr (SizeOf (MMTIME)));
     APos:=mmt.Sample;
     //BufferUnderRun:= APos - LastWriteEndPos;
     Pos:=mmt.Sample mod Bsize;
     if calibrationLen>0 then begin
        calibration;
        exit;
     end;
     RPos:=Pos;
     {if (LoopCount>=LOOPS) then begin
            WaveOutReset (hwo);
            LoopCount:=0;
            wh.lpData:=@wdata2;
            wh.dwBufferLength:=BSize;
            wh.dwFlags:=WHDR_BEGINLOOP or WHDR_ENDLOOP;
            wh.dwLoops:=LOOPS;
            res:=WaveOutPrepareHeader (hwo,@wh,cbwh);
            res:=WaveOutWrite (hwo,@wh,cbwh);
            res:=WaveOutUnPrepareHeader (hwo,@wh,cbwh);

     end;

     if (PrevPos<(BSize div 2)) xor (Pos<(BSize div 2)) then begin
         inc (LoopCount);
     end; }
     {$ifdef ForM2}
//     if (BSize<0) or (BSize>30000) then exit;
     if WavOutObj<>nil then begin
         WriteAd:=0;
         WriteMax:=BSize-1;
     end else begin
     {$endif}
         if BeginPlay then begin
            // WriteAd:=(Pos+BSize-1) mod BSize;
            LastWriteStartPos  := mmt.Sample+WriteMaxLen-2;
            LastWriteEndPos    := mmt.Sample+WriteMaxLen-1;
            BeginPlay:=False;
         end else begin
            //WriteAd:=PrevPos;
            LastWriteStartPos  := LastWriteEndPos;
            LastWriteEndPos    := (mmt.Sample+BSize-1);
         end;
         if (LastWriteEndPos-mmt.Sample>WriteMaxLen) then begin
             LastWriteEndPos:=mmt.Sample+WriteMaxLen;
         end;
         WriteAd  := LastWriteStartPos mod BSize;
         WriteMax := LastWriteEndPos   mod BSize;
         if WriteAd<0 then WriteAd:=0;
         if WriteMax<0 then WriteMax:=0;

         //WriteMax:=Pos;
     {$ifdef ForM2}
     end;
     {$endif}
     //for ch:=0 to Chs-1 do inc (AllVCenter,vCenter[ch]);

     WTime:=GetTickCount;
     EnvFlag:=0;
     LfoInc:=True;
     inc(cnt);
     if cnt mod 4 =0 then begin
{$ifdef ForM2}
        FormCtl.setParam(PrevPos,Pos,writeAd,writeMax);
{$endif}
     end;
     while (WriteAd<>WriteMax) do begin
//       if (BSize<0) or (BSize>30000) then exit;
       LfoInc:=not LfoInc;
//     repeat
           //AllVCenter:=128;
           WSum:=0; //128;   // 0 for 16bit
           inc(EnvFlag); if EnvFlag>1 then EnvFlag:=0;
           for ch:=0 to Chs-1 do begin
              if MPoint[ch]=nil then StopMML (ch);
              if (not soundMode[ch]) and (PlayState[ch]<>psPlay) then continue;
              //----
              while nextPeekElemIdx[ch]<>nextPokeElemIdx[ch] do begin
                 se:=@(sndElems[ch, nextPeekElemIdx[ch]]);
                 if APos>=se.time then begin
                     setSound(ch,se.typ,se.val);
                     nextPeekElemIdx[ch]:=(nextPeekElemIdx[ch]+1) mod sndElemCount;
                 end else break;
              end;

              //---
              if (soundMode[ch]) then
                 v:=EVol[ch]
              else if (Resting[ch]) then
                 v:=0
              else
                 v:=(( Byte(( EShape[ch]+(ECount[ch] shr 11) )^) )*EVol[ch]*EBaseVol[ch] { div 128});  // 16bit
              if (Fading<FadeMax) then begin
                 v:=v * Fading div FadeMax;  // 16bit
              end;


              if v>0 then begin
                  i:=SccCount[ch] shr (32-L2WL[ch]);
                  //inext:=(i+1) and ((1 shl L2WL[ch])-1);

                  //mid:=(SccCount[ch] shr (24-L2WL[ch])) and 255;

                  // *****000 00000000 00000000 00000000
                  //                      ***** 00000000

                  w1:=Byte((SccWave[ch]+i)^) ;
                  //w2:=Byte((SccWave[ch]+inext)^) ;

                  inc (WSum,(
                            ( {(w2*mid+w1*(256-mid)) div 256}w1*v ) div (16*128)
                         )-v div 16
                  );
                  if not Sync[Ch] then begin
                     inc (SccCount[Ch],Steps[Ch]);
                  end else begin
                      if (SccCount[Ch]<-Steps[Ch]*2) or (SccCount[Ch]>=0)
                      then inc (SccCount[Ch],Steps[Ch]);
                  end;
                  if (LfoV[Ch]<>0)  then begin
                     if (LfoDC[ch]>0) then begin
                        dec(LfoDC[ch],Tempo);
                     end else begin
                       inc(SccCount[Ch],
                        sinT[LfoC[Ch] shr (16+sinMax_s)]*(Steps[Ch] div 512)
                        *LfoA[Ch] div 256
                       );
                       if LfoInc then inc(LfoC[Ch],LfoV[Ch]);
                     end;

                  end;
              end;
              if (ECount[ch]+ESpeed[ch]<65536) and (EnvFlag=0) then inc (ECount[ch],ESpeed[ch]);
              //####MMLProc (ch);
                 JmpSafe:=0;
                 //dec (MCount[ch]);
                 if PorLen[ch]>0 then begin
                   Tmporc:=MCount[ch]-SeqTime;
                   Steps[ch]:=(
                      PorStart[ch] div PorLen[ch]*TmPorc+
                      PorEnd[ch] div PorLen[ch]*(PorLen[ch]-Tmporc)
                   );
                 end;

                 while MCount[ch]<=SeqTime do begin
                       //MCount[ch]:=0;
                       LParam:=Byte((MPoint[ch]+1)^);
                       case Byte(MPoint[ch]^) of
                       0..95,MRest:begin
                           Play1Sound (ch,Byte(MPoint[ch]^),Slur[ch]);
                           if not Slur[ch] then LfoDC[ch]:=LfoD[ch];
                           Slur[ch]:=False;
                           //MCount[ch]:=SPS div Byte((MPoint[ch]+1)^);
                           MCount[ch]:=SeqTime+
                           ( Byte((MPoint[ch]+1)^)+Byte((MPoint[ch]+2)^)*256 )*2;
                           // SPS=22050の場合 *2 を *1 に。
                           inc (MPoint[ch],3);

                       end;
                       MPor:begin
                            Play1Por (ch,
                              Byte((MPoint[ch]+1)^),
                              Byte((MPoint[ch]+2)^),
                              Slur[ch]
                            );
                            Slur[ch]:=False;
                            MCount[ch]:=SeqTime+
                            ( Byte((MPoint[ch]+3)^)+Byte((MPoint[ch]+4)^)*256 )*2;
                           // SPS=22050の場合 *2 を *1 に。
                            PorLen[ch]:=MCount[ch]-SeqTime;
                            inc (MPoint[ch],5);
                       end;
                       MTempo:begin
                           Tempo:=Byte((MPoint[ch]+1)^)+
                           Byte((MPoint[ch]+2)^)*256;
                           inc (MPoint[ch],3);
                       end;
                       MVol:begin
                          EVol[ch]:=Byte((MPoint[ch]+1)^);
                          inc (MPoint[ch],2);
                       end;
                       MBaseVol:begin
                          EBaseVol[ch]:= Byte((MPoint[ch]+1)^);
                          inc (MPoint[ch],2);
                       end;
                       Mps:begin
                          ESpeed[ch]:=Byte((MPoint[ch]+1)^);
                          inc (MPoint[ch],2);
                       end;
                       MSelWav:begin
                         //SccWave[ch]:=@WaveDat[LParam,0];
                         SelWav (ch,LParam);
                         inc (MPoint[ch],2);
                       end;
                       MWrtWav:begin
                         inc (MPoint[ch],2);
                         for i:=0 to 31 do begin
                             WaveDat[LParam,i]:=Byte(MPoint[Ch]^);
                             inc (MPoint[ch]);
                         end;
                       end;
                       MSelEnv:begin
                         EShape[ch]:=@EnvDat[LParam,0];
                         inc (MPoint[ch],2);
                       end;
                       MWrtEnv:begin
                         inc (MPoint[ch],2);
                         for i:=0 to 31 do begin
                             wdtmp:=Byte(MPoint[Ch]^);
                             if wdtmp>15 then wdtmp:=15;
                             EnvDat[LParam,i]:=wdtmp;
                             inc (MPoint[ch]);
                         end;
                       end;
                       MJmp:begin
                           if WavOutMode then begin
                              inc (MPoint[ch],5);
                           end else
                           inc (MPoint[ch],
                           Byte((MPoint[ch]+1)^) shl  0+
                           Byte((MPoint[ch]+2)^) shl  8+
                           Byte((MPoint[ch]+3)^) shl 16+
                           Byte((MPoint[ch]+4)^) shl 24
                           );
                           inc (JmpSafe);
                           if JmpSafe>1 then begin
                              StopMML (ch);
                              MCount[ch]:=SeqTime+1;
                           end;
                       end;
                       MSlur:begin
                         Slur[ch]:=True;
                         inc (MPoint[ch],1);
                       end;
                       MWait:begin
                          WaitMML (ch);
                          inc (MPoint[ch],1);
                       end;
                       MCom:begin
                          comstr:=StrPas(MPoint[ch]+1);
                          inc (MPoint[ch],length(comstr)+2);
                       end;
                       MWOut:begin
                        Wfilename:=MPoint[ch]+1;
                        {$ifdef ForM2}
                        if (WavOutMode) and (WavOutObj=nil) then begin
                           WOutStart;
                           WriteAd:=0;
                           WriteMax:=BSize-1;
                        end;
                        {$endif}
                        inc (MPoint[ch],length(WFilename)+2);
                       end;
                       MWEnd:begin
                         {$ifdef ForM2}
                         if WavOutMode then begin
                            if WavOutObj<>nil then begin
                               WavOutObj.AddBuffer (@wdata2[0],WriteAd);
                               WOutEnd;
                            end;
                         end;
                         {$endif}
                         inc (MPoint[ch]);
                       end;
                       MDet:begin
                          Detune[ch]:=ShortInt((MPoint[ch]+1)^);
                          inc (MPoint[ch],2);
                       end;
                       MLfo:begin
                          LfoSync[ch]:=ShortInt((MPoint[ch]+1)^);
                          LfoV[ch]:=ShortInt((MPoint[ch]+2)^)*65536;
                          LfoA[ch]:=ShortInt((MPoint[ch]+3)^);
                          LfoD[ch]:=0;
                          inc (MPoint[ch],4);
                       end;
                       MLfoD:begin
                          LfoD[ch]:=Byte((MPoint[ch]+1)^)*SPS;
                          inc (MPoint[ch],2);
                       end;
                       MSync:begin
                          Sync[ch]:=(ShortInt((MPoint[ch]+1)^)=1);
                          inc (MPoint[ch],2);
                       end;
                       MPCMReg:begin
                        Wfilename:=MPoint[ch]+1;
                        inc (MPoint[ch],length(WFilename)+2);
                        RegPCM (WFileName,Byte(MPoint[Ch]^));
                        inc (MPoint[ch]);
                       end;
                       Mend:StopMML (ch);//MPoint[ch]:=nil;
                       else
                          //ShowMessage ('???'+IntToSTr(Byte(MPoint[ch]^)));
                          StopMML (ch);
                          inc (MPoint[ch]);
                       end;
                 end;
              // End Of MMLProc
           end;
           inc (SeqTime,((SeqTime120+Tempo) div 120)
                       -( SeqTime120        div 120)
           );
           inc (SeqTime120,Tempo);

           for ch:=0 to Ses-1 do begin
               if SeLen[ch]>0 then begin
                  //inc (WSum,(Byte(Sept[ch]^)-128)*SeVol[ch] div 128);    //16bit
                  inc (WSum,(Byte(Sept[ch]^)-128)*SeVol[ch]);    //16bit
                  dec (SeLen[ch]);
                  if (SeLen[ch]<=0) and (SeReptLen[ch]>0) then begin
                        SeLen[ch]:=SeReptLen[ch];
                        dec (SePt[ch],SeLen[ch]);
                  end;
                  inc (Sept[ch]);

               end;
           end;
           {if (Fading<FadeMax) then begin
                WSum:=WSum * Fading div FadeMax;  // 16bit
           end;
            }

           //if WSum>255 then WSum:=255;     //16bit
           //if WSum<0 then WSum:=0;         //16bit
           if WSum>32767 then WSum:=32767;     //16bit
           if WSum<-32768 then WSum:=-32768;         //16bit

           //mid:=random(5)+1;
           //WSum:=(PrevWSum+WSum*5) div (5+1);
           //if (writeAd and 255) <128 then WSum:=4000 else WSum:=0;

           wdata2[WriteAd]:=WSum;
           //PrevWSum:=WSum;

           inc (NoiseP);
           WaveDat[95,NoiseP and 31]:=Random(78)+90;
           inc (WriteAd);
           WriteAd:=WriteAd mod BSize;
           inc(APos);
           //if GetTickCount-WTime>5000 then break;
//     until WriteAd=WriteMax;
     end;
     {$ifdef ForM2}
     if WavOutObj<>nil then begin
         WavOutObj.AddBuffer (@wdata2[0],WriteMax*2); //*2 for 16bit
         i:=0; while i<Chs do begin
             if PlayState[i]<>psStop then break;
             inc (i);
         end;
         if i>=Chs then WOutEnd;
     end;
     {$endif}
         SeqTime120:=SeqTime120 mod 120;
         WTime:=GetTickCount-WTime;
         PrevPos:=Pos;

     {mmt.wType:=TIME_SAMPLES;
     WaveOutGetPosition (hwo, @mmt, SizeOf(MMTIME));}
     BufferUnderRun:= getPlayPos - LastWriteStartPos;

     //--------------|---------------------------
     //             playpos  LS            LE
     //                       +-------------+

end;

procedure TEnveloper.PlayKeyBd (n,WaveSel:Integer);
var i,ch,WaveMod,WriteBytes,wdtmp:integer;
    TP,vCenter:array [0..Chs-1] of Integer;
    Lambda,NewLambda:Real;
    res:MMRESULT;
    WriteMax:integer;
    nowt:longint;
    AllVCenter:Integer;
    Wf,Wt,WMid,WRes,WSum,v,NoiseP:Integer;
    LParam,WParam:Byte;
    JmpSafe:Integer;
begin
     Start;
     ch:=Chs-1;
     Play1Sound (ch,n,False);
     EVol[ch]:=127;
     SccWave[ch]:=@WaveDat[WaveSel,0];

     mmt.wType:=TIME_SAMPLES;
     WaveOutGetPosition (hwo, @mmt, SizeOf(MMTIME));

     Pos:=mmt.Sample mod Bsize;
     WriteAd:=(Pos+Delay) mod BSize;
     WriteMax:=(Pos+BSize-1) mod BSize;

     while WriteAd<>WriteMax do begin
           WSum:=0;//wdata2[WriteAd];
           v:=(( Byte(( EShape[ch]+(ECount[ch] shr 11) )^) )*EVol[ch]*EBaseVol[ch]);
           if v>0 then begin
                  i:=SccCount[ch] shr 27;
                  inc (WSum,(
                            ( Byte((SccWave[ch]+i)^)*v ) div (16*128)
                         )-v div 16
                  );
                  inc (SccCount[Ch],Steps[Ch]);
           end;
           if ECount[ch]+ESpeed[ch]<65536 then inc (ECount[ch],ESpeed[ch]);


           //WSum:=(PrevWSum+WSum) div 2;

           WRes:=WSum+wdata2[WriteAd];

           if WRes>32767 then WRes:=32767;     //16bit
           if WRes<-32768 then WRes:=-32768;         //16bit

           wdata2[WriteAd]:=WRes;

           //PrevWSum:=WSum;

           inc (WriteAd);
           WriteAd:=WriteAd mod BSize;
     end;

end;

procedure TEnveloper.calibration;
var l,p,i:Integer;
begin
     p:=(Pos+timeLag+BSize) mod BSize;
     for i:=0 to BSize-1 do begin
          l:=i-p;
          if l<-BSize div 2 then inc(l,BSize);
          if l>=BSize div 2 then dec(l,BSize);
          if ((i mod 100)<50) and
              (abs(l)<calibrationLen)  then begin
                wdata2[i]:=20000*(calibrationLen-abs(l)) div calibrationLen  ;

          end else wdata2[i]:=0;
     end;
end;


procedure TEnveloper.PlaySe (sn:Integer;p:PChar;l:Integer;v:Integer;rept:Boolean);
var Ps,Lmax,WriteAd,WriteMax,WSum:Integer;
    WriteTwice:Boolean;
begin
     //RefreshPSG;
     {Ps:=PrevPos;
     SePt[Sn]:=p; SeLen[Sn]:=l;
     Lmax:=((BSize-Ps) mod (Bsize div 2)) +(Bsize div 2);
     if l>LMax div 2 then l:=LMax;
     inc (SePt,l);
     dec (SeLen,l);}
     repeat
           inc(sn);
     until (SeLen[sn]=0) or (sn>=Ses-1) ;

     SePt[Sn]:=p; SeLen[Sn]:=l;
     SeVol[Sn]:=v;
     if rept then SeReptLen[Sn]:=l else SeReptLen[Sn]:=0;

     mmt.wType:=TIME_SAMPLES;
     WaveOutGetPosition (hwo, @mmt, SizeOf(MMTIME));
     WriteAd:=(mmt.Sample+Delay) mod Bsize;

     //WriteMax:=PrevPos mod BSize;
     WriteMax:= LastWriteEndPos mod BSize;
     if WriteAd<0 then WriteAd:=0;
     if WriteMax<0 then WriteMax:=0;
     repeat
           WSum:=wdata2[WriteAd];
           inc (WSum,(Byte(Sept[Sn]^)-128)*SeVol[Sn]{ div 128});    //16bit
           if WSum>32767 then WSum:=32767;     //16bit
           if WSum<-32768 then WSum:=-32768;         //16bit
           wdata2[WriteAd]:=WSum;

           dec (SeLen[Sn]);
           if SeLen[Sn]<=0 then begin
              if SeReptLen[Sn]=0 then break
              else begin
                  SeLen[Sn]:=SeReptLen[Sn];
                  dec (SePt[Sn],SeLen[Sn]);
              end;
           end;
           inc (Sept[Sn]);
           WriteAd:=(WriteAd+1) mod BSize;

     until WriteAd=WriteMax;
end;

end.
