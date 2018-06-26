unit UsrSub;

interface

uses SysUtils,Dialogs,UnInt,SEnv,SoundKer,SFixlist,Classes;

type
    EOutOfParam = class (Exception);
    EUndefVal = class (Exception);
    EValDepthOver = class (Exception);

    TLexKind = (Sym,SoundEl,SAlpha,Num,Option,DlmPm,DlmMd,DlmCp,DlmSb,dEnd,Obj,Rem);

    TLexType = record
            bstr:string;
            case Kind:TLexKind of
                Num,SAlpha: (val:Integer);
                //Option: (bstr:string);//(bstr:array [0..3] of char);
    end;
    PLexType = ^TLexType;

    TLbfElem = record
        Pos,LbNum:Integer;
    end;
    PLbfElem = ^TLbfElem;

    TChannel = record
        Len,Oct,Vol,VolShift{,Tempo},ToneShift:Integer;
        Det:Integer;
        Lbl:array [0..9] of Integer;
        Lbf:TList;
        ZCmd:Boolean;
    end;
    pint=^Integer;

function PutLexType (l:TLexType):string;
procedure LexOnEnd (s:string;var f,t:PChar;var Res:Pointer);
function GramOnEnd (r:TResultList):Pointer;
//function GramOn1End (r:TNodeList):Pointer;

const AtoG:array [0..6] of Integer = (9,11,0,2,4,5,7);
      VDefault = 65535;
var Channel:Integer;
    WmBuffer:TBuffer;
    ChInfo:TChannel;
    Tempo:Integer;
    BinBuf:array [0..Chs-1] of Pointer;
    ValueList:TStringList;
    LastValue:string;
    PrevRealSnd:Integer;
    ValDepth:Integer;

function WriteMML:Pointer;
procedure FreeBuffers;

implementation

uses SMezonet;

function WriteMML:Pointer;
var i,c:integer;
    wp:^byte;
begin
     i:=0;c:=WmBuffer.Count;
     GetMem (wp,c+4); IncGar_new;
     result:=wp;
     pint(wp)^:=c;
     inc (wp,4);
     while i<c do begin
           wp^:=byte(WmBuffer.Items[i]);
           //Form1.Memo1.Lines.Add (IntToStr (wp^));
           inc (wp);
           inc (i);
     end;
end;


function PutLexType (l:TLexType):string;
begin
     with l do
      case Kind of
          Num: result:='Num : '+IntToStr (val);
          SoundEl: result:='Se : '+IntTostr (val);
      end;
end;

procedure LexOnEnd (s:string;var f,t:PChar;var Res:Pointer);
var i:PLexType;
    tmp:byte;
    tval:Integer;
    ii:Integer;
begin
     try
        //ShowMessage (s+':'+f.Pos^+t.Pos^);
        New (i);IncGar_new;
        if s='Num' then begin
           with i^ do begin
                Kind:=Num;
                val:=0;
                while f<t do begin
                      tmp:=Byte (f^);
                      val:=val*10;
                      inc (val,tmp-Byte('0'));
                      inc (f);
                end;
           end;
        end else
        if s='OctShift' then begin
           with i^ do begin
                Kind:=Num;
                if f^='<' then val:=-1;
                if f^='>' then val:=1;
           end;
        end else
        if s='Periods' then begin
           with i^ do begin
                Kind:=Num;
                val:=t-f;
           end;
        end else
        if s='SoundEl' then begin
           with i^ do begin
                Kind:=SoundEl;
                tmp:=byte(f^);
                if {(tmp=Byte('R')) or }(tmp=Byte('r')) then begin
                   val:=-1;
                end else begin
                 if (tmp=Byte('^')) then val:=-2
                 else begin
                    if tmp>=Byte('a') then dec (tmp,Byte('a'));
                    //if tmp>=Byte('A') then dec (tmp,Byte('A'));

                    val:=AtoG[tmp];
                    tmp:=Byte((f+1)^);
                    if (tmp=Byte('+')) or (tmp=Byte('#')) then inc (val);
                    if tmp=Byte('-') then dec (val);
                 end;
                end;
           end;
        end else
        if (s='SingleOption') or (s='StrOption') then begin
           with i^ do begin
               Kind:=Option;
               bstr:='';
               while f<t do begin
                  bstr:=bstr+f^;
                  inc (f);
               end;
           end;
        end else
        if s='String' then begin
           with i^ do begin
               Kind:=Option;
               bstr:='';
               inc (f);
               while f<t-1 do begin
                  bstr:=bstr+f^;
                  inc (f);
               end;
           end;
        end else
        if s='Value' then begin
           with i^ do begin
               Kind:=Option;
               bstr:='';
               while f<t do begin
                  bstr:=bstr+f^;
                  inc (f);
               end;
           end;
        end else
        if s=';' then begin
           with i^ do begin
               Kind:=Rem;
           end;
           while (t^<>Chr(10)) and (t^<>Chr(0)) do inc (t);
        end else
        if s='/*' then begin
           with i^ do begin
               Kind:=Rem;
           end;
           while True do begin
             if t^=Chr(0) then break;
             if (t^='*') and ((t+1)^='/') then begin
                inc (t,2);
                break;
             end;
             inc (t);
           end;
        end;
     finally
        Res:=i;
     end;
end;

procedure FreeBuffers;
begin
     if WmBuffer<>nil then begin
         WmBuffer.Free; DecGar;
         WmBuffer:=nil;
     end;
     if ValueList<>nil then begin
        ValueList.Free;DecGar;
        ValueList:=nil;
     end;   
end;


function GramOnEnd (r:TResultList):Pointer;
var ni,a,b:pint;
    i,c,tmpt,tmpl,li,lc,ofs:Integer;
    len:Integer;
    sa,sb:PLexType;
    Nr,NNr,TmpR:TResultList;
    SaveChf:TChannel;
    LbElem:PLbfElem;

    ChkLeak:Pointer;
begin
     Result:=nil;
     if r.Name='Expr' then begin
       PrevRealSnd:=3;
       ValueList:=TStringList.Create;  IncGar;
       { Read Values ($a1$[cde] etc.)}
       Channel:=31;
       li:=0; lc:=r.Count;
       while li<lc do begin
              ChkLeak:=GramOnEnd (r.Items[li]);
              if (ChkLeak<>nil) then ShowMessage ('Memory Leaked1');
              inc (li);
       end;
       ValDepth:=0;
       { End of ReadVal}
       for Channel:=0 to Chs-1 do begin
        with ChInfo do begin
             Oct:=4;
             Vol:=120;
             VolShift:=0;
             Len:=SPS div 4;
             //Tempo:=120;
             Lbf:=TList.Create;  IncGar;
             ToneShift:=0;
             ZCmd:=False;
             for i:=0 to 9 do Lbl[i]:=0;
        end;

        WmBuffer:=TBuffer.Create;  IncGar;
        with WmBuffer do begin
            Add (MVol); Add (120);
            Add (Mps);  Add (5);
            Add (MDet);  Add (0);
            Add (MSelWav);  Add (0);
            Add (MSelenv);  Add (0);
            Add (MLfo);  Add (0);Add (0);Add (0);
            Add (MLfoD); Add (0);
            Add (MSync);  Add (0);
            if Channel=0 then begin
               Add (MTempo);  Add (120); Add (0);
            end;
        end;
        li:=0; lc:=r.Count;
        while li<lc do begin
              ChkLeak:=GramOnEnd (r.Items[li]);
              if (ChkLeak<>nil) then ShowMessage ('Memory Leaked2');
              inc (li);
        end;

        WmBuffer.Add (MEnd);
        WmBuffer.Add (MEnd);
        WmBuffer.Add (MEnd);
        {Fill Label}
        with ChInfo.Lbf do begin
             i:=0; c:=Count;
             while i<c do begin
                   LbElem:=Items[0];
                   ofs:=ChInfo.Lbl[LbElem^.LbNum]-LbElem^.Pos;
                   {ShowMessage ('Wrote '+IntToStr(ofs)
                   +' at '+IntTostr(LbElem^.Pos+1));}
                   WmBuffer.Items[LbElem^.Pos+1]:=(ofs shr  0) and 255;
                   WmBuffer.Items[LbElem^.Pos+2]:=(ofs shr  8) and 255;
                   WmBuffer.Items[LbElem^.Pos+3]:=(ofs shr 16) and 255;
                   WmBuffer.Items[LbElem^.Pos+4]:=(ofs shr 24) and 255;
                   Remove (LbElem);
                   FreeMem (LbElem); DecGar_new;
                   inc (i);
             end;
        end;
        if ChInfo.Lbf<>nil then begin
         ChInfo.Lbf.Free; DecGar;
        end;

        BinBuf[Channel]:=WriteMML;
        if WmBuffer<>nil then begin
         WmBuffer.Free;  DecGar;
         WmBuffer:=nil;
        end;
       end;
       if ValueList<>nil then begin
        ValueList.Free;DecGar;
        ValueList:=nil;
       end;
       exit;
     end;
     if r.Name='Block' then begin
          // Block =   "1[cde]"
            a:=GramOnEnd (r.Items[0]);  // ChRange
            if (a^ and (1 shl Channel))<>0 then begin
              if Channel<31 then begin
                 ChkLeak:=GramOnEnd (r.Items[2]);  //Exs
                 if (ChkLeak<>nil) then ShowMessage ('Memory Leaked3');
              end else
                 ValueList.AddObject (LastValue,r.Items[2]);

            end;
            FreeMem(a); DecGar_new;
            exit;
     end;
     if r.Name='Exs' then begin
        with r do begin
            i:=0;c:=Count;
            while i<c do begin
                ChkLeak:=GramOnEnd (Items[i]);       //  'real | 'sing | 'setl
                if (ChkLeak<>nil) then ShowMessage ('Memory Leaked4');
                inc (i);
            end;
        end;
     end;
     if r.Name='replace' then begin
         sa:=PLexType (r.LItems[0]);

         with ValueList do begin
              inc (ValDepth);
              if ValDepth>16 then
                 raise EValDepthOver.Create ('マクロ参照が複雑すぎます');
              i:=IndexOf (sa^.bstr);
              if i<0 then begin
                 raise EUndefVal.Create (sa^.bstr+'は定義されていません');
              end;
              ChkLeak:=GramOnEnd (TResultList (Objects[i]) );
              if (ChkLeak<>nil) then ShowMessage ('Memory Leaked5');
              dec (ValDepth);
         end;
         exit;
     end;
     if r.Name='zcmd' then begin
        ChInfo.ZCmd:=True;
        ChkLeak:=GramOnEnd (r.Items[1]);
        if (ChkLeak<>nil) then ShowMessage ('Memory Leaked6');

        ChInfo.ZCmd:=False;
     end;
     if r.Name='toneshift' then begin
        sa:=PLexType(r.LItems[2]);  // SoundEl
        ChInfo.ToneShift:=sa^.val;

        Nr:=r.Items[1];  // <<< or >>>
        i:=0; c:=Nr.Count;
        while i<c do begin
              sa:=PLexType(Nr.LItems[i]);
              inc (ChInfo.ToneShift,sa^.val*12);
              inc (i);
        end;
        exit;
     end;
     if r.Name='realsound' then begin
        // SoundEl defnum
        sa:=PLexType(r.LItems[0]);  // SoundEl
        a:=pint (GramOnEnd (r.Items[1]));       // length

        case sa^.val of
        -1:WmBuffer.Add (MRest);
        -2:begin
                WmBuffer.Add (MSlur);
                WmBuffer.Add (PrevRealSnd);
        end;
        else
          PrevRealSnd:=sa^.val+ChInfo.Oct*12-12+ChInfo.ToneShift;
          if PrevRealSnd>95 then PrevRealSnd:=95;
          if PrevRealSnd<0 then PrevRealSnd:=0;
          WmBuffer.Add (PrevRealSnd);
        end;
        li:=a^*2;// div ChInfo.Tempo;
        WmBuffer.Add (li and 255);
        WmBuffer.Add (li div 256);

        Freemem (a);     DecGar_new;
        Result:=nil;
        exit;
     end;
     if r.Name='portament' then begin
        WmBuffer.Add (MPor);

        sa:=PLexType(r.LItems[1]);  // SoundEl
        tmpt:=sa^.val+ChInfo.Oct*12-12+ChInfo.ToneShift;
        if tmpt<0 then tmpt:=0;
        if tmpt>95 then tmpt:=95;
        WmBuffer.Add (tmpt);

        ChkLeak:=GramOnEnd (r.Items[2]);
        if (ChkLeak<>nil) then ShowMessage ('Memory Leaked7');

        sa:=PLexType(r.LItems[3]);  // SoundEl
        tmpt:=sa^.val+ChInfo.Oct*12-12+ChInfo.ToneShift;
        if tmpt<0 then tmpt:=0;
        if tmpt>95 then tmpt:=95;
        WmBuffer.Add (tmpt);
        {if sa^.val<0 then WmBuffer.Add (MRest)
        else WmBuffer.Add (sa^.val+ChInfo.Oct*12-12);}


        a:=pint (GramOnEnd (r.Items[4]));       // length
        li:=a^*2;//40 div ChInfo.Tempo;
        WmBuffer.Add (li and 255);
        WmBuffer.Add (li div 256);

        Freemem (a);     DecGar_new;
        Result:=nil;
        exit;
     end;
     if r.Name='renpu' then begin

        Nr:=r.Items[1];
        i:=0; c:=Nr.Count; tmpl:=c div 2;
        a:=pint (GramOnEnd (r.Items[3]));       // length
        li:=a^*2;
        li:=li div tmpl;
        Freemem (a);       DecGar_new;

        while i<c do begin

              sa:=PLexType(Nr.LItems[i]);  // SoundEl
              tmpt:=sa^.val+ChInfo.Oct*12-12+ChInfo.ToneShift;
              if tmpt<0 then tmpt:=0;
              if tmpt>95 then tmpt:=95;
              WmBuffer.Add (tmpt);
              WmBuffer.Add (li and 255);
              WmBuffer.Add (li div 256);

              ChkLeak:=GramOnEnd (Nr.Items[i+1]);
              if (ChkLeak<>nil) then ShowMessage ('Memory Leaked8');
              inc (i,2);
        end;

        Result:=nil;
        exit;
     end;

     if r.Name='tieslur' then begin
        WmBuffer.Add (MSlur);
        result:=nil;
        exit;
     end;
     if r.Name='wait' then begin
        WmBuffer.Add (MWait);
        result:=nil;
        exit;
     end;
     if r.Name='stringequ' then begin
        sa:=PLexType (r.LItems[0]);       // StrOpt
        sb:=PLexType  (r.LItems[1]);       // String;
        if sa^.bstr='@com' then begin
           WmBuffer.Add (MCom);
        end else
        if sa^.bstr='@wavout' then begin
           WmBuffer.Add (MWOut);
        end;

        li:=length (sb^.bstr);
        i:=1; while i<=li do begin
            WmBuffer.Add (Ord(sb^.bstr[i]));
            inc (i);
        end;
        WmBuffer.Add (0);

        exit;
     end;
     if r.Name='pcmreg' then begin
        sa:=PLexType (r.LItems[1]);       // String
        b:=pint (GramOnEnd (r.Items[3]));       // DefNum;
        if (b^<Wvc) or (b^>=Wvc+PCMWavs) then
           raise EOutOfParam.Create ('PCMデータの登録番号が'
           +IntToStr (Wvc)+'未満または'+IntToStr(Wvc+PCMWavs)+'を超えました');

        WmBuffer.Add (MPCMReg);

        li:=length (sa^.bstr);
        i:=1; while i<=li do begin
            WmBuffer.Add (Ord(sa^.bstr[i]));
            inc (i);
        end;
        WmBuffer.Add (0);
        WmBuffer.Add (b^);
        FreeMem(b);DecGar_new;
        exit;
     end;
     if r.Name='singleequ' then begin
        sa:=PLexType (r.LItems[0]);       // SngOpt
        b:=pint (GramOnEnd (r.Items[1]));       // Defnum;
        if b^<>VDefault then begin
            if sa^.bstr='o' then begin
                 ChInfo.Oct:=b^;
                 if (b^<1) or (b^>8) then
                    raise EOutOfParam.Create ('オクターブが1未満または8を超えました');
            end else
            if sa^.bstr='t' then begin
                 //ChInfo.Tempo:=b^;
                 if (b^<32) or (b^>1023) then
                    raise EOutOfParam.Create ('テンポが32未満または1023を超えました');
                 with WmBuffer do begin
                      Add (MTempo);
                      Add ((b^) and 255);
                      Add ((b^) div 256);
                 end;
            end else
            if (sa^.bstr='v') or (sa^.bstr='@v') then
              begin
                 if sa^.bstr='v' then b^:=b^ * 8;
                 inc (b^,ChInfo.VolShift);
                 if (b^<0) or (b^>127) then
                    raise EOutOfParam.Create (sa^.bstr+':パラメータが範囲外');
                 with WmBuffer do begin
                      Add (MVol);
                      Add (b^);
                 end;
              end else
            if (sa^.bstr='v=+') or (sa^.bstr='v=-') then
              begin
                 if sa^.bstr='v=+' then with WmBuffer do begin
                        Add(MBaseVol)           ;
                        Add(128+b^);
                 end;
                 if sa^.bstr='v=-' then with WmBuffer do begin
                        Add(MBaseVol)            ;
                        Add(128-b^);
                 end;
              end else
            if sa^.bstr='@' then
              begin
                 if (b^<0) or (b^>=Wvc+PCMWavs) then
                    raise EOutOfParam.Create ('音色番号が0未満または95を超えました');

                 with WmBuffer do begin
                     if ChInfo.Zcmd then Add (MWrtWav)
                     else Add (MSelWav);
                     Add (b^);
                 end;
                 if ChInfo.Zcmd then begin
                     Nr:=r.Items[2];
                     i:=0;c:=Nr.Count;
                     if c<>64 then begin
                        raise EOutOfParam.Create ('音色設定パラメータ数が32個ではありません');
                     end;
                     while i<c do begin
                          FreeMem (b);  DecGar_new;
                          b:=pint(GramOnEnd (Nr.Items[i+1]));
                          WmBuffer.Add (b^);
                          inc (i,2);
                     end;
                 end;
              end else
            if sa^.bstr='@lfo' then
              begin
                 WmBuffer.Add (MLfo);
                 WmBuffer.Add (b^); //LfoOp

                 Nr:=r.Items[2];
                 c:=Nr.Count;
                 if c>=2 then begin
                     FreeMem (b);  DecGar_new;
                     b:=pint(GramOnEnd (Nr.Items[1]));
                     if (b^<0) or (b^>127) then
                        raise EOutOfParam.Create ('LFO速度が0未満または127を超えました');
                     WmBuffer.Add (b^);   //LfoV

                     if c>=4 then begin
                        FreeMem (b); DecGar_new;
                        b:=pint(GramOnEnd (Nr.Items[3]));
                        if (b^<0) or (b^>127) then
                           raise EOutOfParam.Create ('LFO振幅が0未満または127を超えました');
                        WmBuffer.Add (b^);   //LfoA
                     end else begin
                         WmBuffer.Add (0);
                     end;
                     if c>=6 then begin
                        FreeMem (b); DecGar_new;
                        b:=pint(GramOnEnd (Nr.Items[5]));
                        if (b^<0) or (b^>255) then
                           raise EOutOfParam.Create ('LFO遅延時間が0未満または255を超えました');
                        WmBuffer.Add(MLfoD);
                        WmBuffer.Add (b^);   //LfoD

                     end;
                 end else begin
                     WmBuffer.Add (0);
                     WmBuffer.Add (0);
                 end;
              end else
            if sa^.bstr='pa' then
              begin
                 if (b^<0) or (b^>15) then
                    raise EOutOfParam.Create ('エンベロープ番号が0未満または15を超えました');

                 with WmBuffer do begin
                     if ChInfo.Zcmd then Add (MWrtEnv)
                     else Add (MSelEnv);
                     Add (b^);
                 end;
                 if ChInfo.Zcmd then begin
                     Nr:=r.Items[2];
                     i:=0;c:=Nr.Count;
                     if c<>64 then begin
                        raise EOutOfParam.Create ('エンベロープパターン設定パラメータ数が32個ではありません');
                     end;
                     while i<c do begin
                          FreeMem (b);  DecGar_new;
                          b:=pint(GramOnEnd (Nr.Items[i+1]));
                          WmBuffer.Add (b^);
                          inc (i,2);
                     end;
                 end;
              end else
            if sa^.bstr='ps' then
              begin
                   if (b^<0) or (b^>100) then
                      raise EOutOfParam.Create (sa^.bstr+':パラメータが範囲外');
                   with WmBuffer do begin
                            Add (MPs);
                            Add (b^);
                   end;
              end else
            if (sa^.bstr='@dt') or (sa^.bstr='@dt-') then
              begin
                   if (b^<0) or (b^>127) then
                      raise EOutOfParam.Create (sa^.bstr+':パラメータが範囲外');
                   WmBuffer.Add (MDet);
                   if sa^.bstr='@dt' then WmBuffer.Add (b^)
                   else WmBuffer.Add (-b^)
              end else
            if sa^.bstr='@sync' then
              begin
                   WmBuffer.Add (MSync);
                   WmBuffer.Add (b^);
              end;
            if sa^.bstr='@label' then
              begin
                   if (b^<0) or (b^>9) then
                      raise EOutOfParam.Create (sa^.bstr+':パラメータが範囲外');
                   ChInfo.Lbl[b^]:=WmBuffer.Count;
              end else
            if sa^.bstr='@jump' then
              begin
                   if (b^<0) or (b^>9) then
                      raise EOutOfParam.Create (sa^.bstr+':パラメータが範囲外');
                   New (LbElem); IncGar_new;
                   LbElem^.LbNum:=b^;
                   LbElem^.Pos:=WmBuffer.Count;
                   ChInfo.Lbf.Add (LbElem);
                   with WmBuffer do begin
                            Add (MJmp);
                            Add (5);
                            Add (0);
                            Add (0);
                            Add (0);
                   end;
            end;
        end else begin
           if sa^.bstr='@endwav' then begin
               WmBuffer.Add (MWEnd);
           end else
           if sa^.bstr='@lfo' then begin
               WmBuffer.Add (MLfo);
               WmBuffer.Add (0);
               WmBuffer.Add (0);
               WmBuffer.Add (0);
           end;

        end;

        Freemem (b);DecGar_new;
        exit;
     end;
     if r.Name='ValOnly' then begin
         New (a); IncGar_new;
         a^:=1 shl 31;
         result:=a;
         sa:=PLexType (r.LItems[0]);
         LastValue:=sa^.bstr;
         exit;
     end;
     if r.Name='ChSel' then begin
         New (a); IncGar_new;
         a^:=0;
         TmpR:=r.Items[0];
         Nr:=r.Items[1]; i:=1;c:=Nr.Count;
         while True do begin
             b:=pint(GramOnEnd (TmpR));
             a^:=a^ or b^;
             FreeMem (b); DecGar_new;
             if i>=c then break;
             Tmpr:=Nr.Items[i];
             inc (i,2);
         end;
         result:=a;
         exit;
     end;
     if r.Name='ChRange' then begin
         New (a);  IncGar_new;
         sa:=PLexType (r.LItems[0]);
         i:=sa^.val-1;
         a^:=1 shl i;
         Nr:=r.Items[1];
         if Nr.Count>0 then begin
            sb:=PLexType (Nr.LItems[1]);
            while i<sb^.val do begin
                  a^:=a^ or (1 shl i);
                  inc (i);
            end;
         end;
         result:=a;
     end;
     if r.Name='reloct' then begin
        sa:=PLexType (r.LItems[0]);
        inc (ChInfo.Oct,sa^.val);
        if (ChInfo.Oct<1) or (ChInfo.Oct>8) then
           raise EOutOfParam.Create ('オクターブが1未満または8を超えました');
        exit;
     end;
     if r.Name='relocts' then begin
        i:=0; c:=r.Count;
        while i<c do begin
              ChkLeak:=GramOnEnd (r.Items[i]);
              if (ChkLeak<>nil) then ShowMessage ('Memory Leaked10');
              inc (i);
        end;
        exit;
     end;
     if r.Name='setlen' then begin
        a:=pint (GramOnEnd (r.Items[1]));       // Length;
        ChInfo.Len:=a^;
        Freemem (a);  DecGar_new;
        exit;
     end;
     if r.Name='repts' then begin
        sa:=PLexType (r.LItems[3]);
        SaveChf:=ChInfo;
        i:=0; while i<sa^.val do begin
            ChInfo:=SaveChf;
            ChkLeak:=GramOnEnd (r.Items[1]);
            if (ChkLeak<>nil) then ShowMessage ('Memory Leaked11');

            inc (i);
        end;
     end;

     if r.Name='Length' then begin
        a:=pint (GramOnEnd (r.Items[0]));       // defnum
        Nr:=TResultList (r.Items[1]);           // []
        if Nr.Count=1 then begin
           sa:=PLexType (Nr.LItems[0]);       // Periods
           tmpl:=sa^.val;
        end else tmpl:=0;
        if a^=VDefault then a^:=ChInfo.Len
        else begin
             if ((a^)<=0) or ((a^)>128) then
             raise EOutOfParam.Create ('長さの指定が1未満または128を超えました');
             a^:=SPS96 div a^;
        end;
        a^:=a^*2-(a^ div (1 shl tmpl));
        result:=a;
        exit;
     end;
     if r.Name='Defaultnum' then begin
        Nr:=TResultList (r.Items[0]);
        New (a); IncGar_new;
        if Nr.Count=0 then a^:=VDefault
        else begin
             sa:=pLexType (Nr.LItems[0]);
             a^:=sa^.val;
        end;
        Result:=a;
        exit;
     end;
end;


end.
