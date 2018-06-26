unit STreead;

interface

uses Classes,ComCtrls,Windows,Dialogs,SysUtils,SFixList;

type
    TLexPos = record
         l:TList;
         i:Integer;
    end;
    pint = ^Integer;
    TIntRead = record
           i,p:Integer;
    end;
    PintRead = ^TIntRead;

procedure Bug (s:string);
{function ParseOr (N:TTreeNode;var Pos:TLexPos;var Res:Pointer;var ist:TElKind):Boolean;
function ParseRept (N:TTreeNode;var Pos:TLexPos;var Res:Pointer;min,max:Integer):Boolean;
function ParseElement (N:TTreeNode;var Pos:TLexPos;var res:Pointer;var ist:TElKind):Boolean;
function ParseSeq (N:TTreeNode;var Pos:TLexPos;var Res:Pointer):Boolean;
function ParseMod (N:TTreeNode;var Pos:TLexPos;var Res:Pointer):Boolean;}
function ParseMod (N:TTreeNode;var Pos:TLexPos;var Res:Pointer):Boolean;
function ParseOr (N:TTreeNode;var Pos:TLexPos;var Res:Pointer;var Ist:TElKind):Boolean;

implementation

uses UsrSub,SPar,STreesub;

function Nop:Integer;
begin
     result:=0;
end;

procedure Bug (s:string);
begin
     ShowMessage ('ÉoÉOî≠ê∂:'+s);
end;


{function GetLexToken (s:string;var t:TTrace):Boolean;
var nt:PChar;
    i,c:Integer;
begin
     result:=False;
     nt:=@s[2];
     i:=0;
     c:=length(s)-1;
     while i<c do begin
           if (t.Pos+i)^<>(nt+i)^ then break;
           inc (i);
     end;
     if i>=c then begin
        result:=True;
        inc (t.Pos,i);
     end;
end; }
{
function ParseOr (N:TTreeNode;var Pos:TLexPos;var Res:Pointer;var ist:TElKind):Boolean;
var
    c,i,j,nsc:integer;
    tmpos:TLexPos;
begin
     //s:=N.text;
     Res:=nil;
     result:=False;
     //Nst:=TFStack.Create;

     c:=N.Count;
     with N do begin
          i:=0;while i<c do begin
              result:=ParseElement (Item[i],Pos,Res,Ist) ;
              if result then break;
              inc (i);
          end;
     end;

end;

function ParseRept (N:TTreeNode;var Pos:TLexPos;var Res:Pointer;min,max:Integer):Boolean;
// min must be <=1
var
    c,i,repts:integer;
    tp:Pointer;
    s,its:string;
begin
     Res:=TResultList.Create (N.Text);
     repts:=0;
     if max>2 then max:=123456;
     while repts<=max do begin
           if not (ParseSeq (N,Pos,Res)) then begin
              break;
           end;
           inc (repts);
     end;
     result:=(repts>=min);

end;

function ParseElement (N:TTreeNode;var Pos:TLexPos;var Res:Pointer;var ist:TElKind):Boolean;
var nn:TTreeNode;
    s:Char;
begin
// {}// : 0-inf   []:0-1     [} 1-inf
{     Res:=nil;
     s:=N.Text[1];
     Ist:=NonTerm;
     case s of
     '{': result:=ParseRept   (N,Pos,Res,0,255);
     '[': if N.Text[2]=']' then result:=ParseRept(N,Pos,Res,0,1)
          else result:=ParseRept(N,Pos,Res,1,255);
     '|': result:=ParseOr     (N,Pos,Res,Ist);
     '''':begin
               Res:=ReadLexToken  (N.Data,Pos);
               Ist:=Term;
               result:=(Res<>nil);
          end;
     else
         nn:=N.Data;
         if nn<>nil then result:=ParseMod (nn,Pos,Res)
         else result:=ParseMod (N,Pos,Res);
     end;

end;

function ParseSeq (N:TTreeNode;var Pos:TLexPos;var Res:Pointer):Boolean;
var
    c,i,tmpcou:integer;
    Recvres:Pointer;
    Ist:TElKind;
begin
     with N do begin
        c:=Count;
        tmpcou:=TResultList(Res).Count;
        i:=0; while i<c do begin
           if ParseElement (N.Item[i],Pos,Recvres,Ist) then begin
              TResultList(Res).Add (Recvres,Ist);
           end else begin
               {if N.Text='realsound' then begin
                  Nop;
               end;  }
{               result:=False;
               //Res.Free;
               with TResultList(Res) do
                    while Count>tmpcou do Delete (tmpcou);
               exit;
           end;
           inc (i);
        end;
     end;
     result:=True;

end;

function ParseMod (N:TTreeNode;var Pos:TLexPos;var Res:Pointer):Boolean;
var RecvRes:Pointer;
    Tmpos:TLexPos;
    i,c:Integer;
begin
     Res:=TResultList.Create (N.Text);
     if ParseSeq (N,Pos,Res) then result:=True
     else begin
          TResultList(Res).Free;
          Res:=nil;
          result:=False;
     end;
end;   }

function ParseOr (N:TTreeNode;var Pos:TLexPos;var Res:Pointer;var Ist:TElKind):Boolean;
var Tmpos:TLexPos;
    i,c,tmpcou:Integer;
    s:Char;
    min,max:Integer;
    nn:TTreeNode;
begin
     Tmpos:=Pos;
     with N do begin
        c:=Count;
        i:=0; while i<c do begin
           with Item[i] do begin {of ReadElement}
             case Text[1] of
             '''':begin
                   Res:=ReadLexToken  (Data,Pos);
                   Ist:=Term;
                   result:=(Res<>nil);
                  end;
             '|' :result:=ParseOr (N.Item[i],Pos,Res,Ist);
             else
                Ist:=NonTerm;
                nn:=Data;
                if nn<>nil then result:=ParseMod (nn,Pos,Res)
                else result:=ParseMod (N.Item[i],Pos,Res);
             end;
             if result then exit
             else Pos:=TmPos;
           end;  {of ReadElement}
           inc (i);
        end;
     end;

end;

function ParseMod (N:TTreeNode;var Pos:TLexPos;var Res:Pointer):Boolean;
var RecvRes:Pointer;
    Tmpos:TLexPos;
    i,c,tmpcou:Integer;
    s:Char;
    min,max:Integer;
    nn:TTreeNode;
    repts:Integer;
    Ist:TElKind;
begin
     s:=N.Text[1];
     min:=1;max:=1;
     //ShowMessage (N.Text);
     {if N.Text='singleequ' then begin
        Nop;
     end;  }
     case s of
     '{': begin
               min:=0;max:=123456;
          end;
     '[': if N.Text[2]=']' then begin
             min:=0;max:=1;
          end else max:=123456;
     '|','''':begin
               Bug ('Term Sym/| is not a Module.');
               exit;
          end;
     end;

     Res:=TResultList.Create (N.Text);
     repts:=0;
     while repts<max do begin {of ReadRept}
      tmpcou:=TResultList(Res).Count;
      Tmpos:=Pos;
      with N do begin {of ReadSeq}
        c:=Count;
        i:=0; while i<c do begin
           with Item[i] do begin {of ReadElement}
             case Text[1] of
             '''':begin
                   Recvres:=ReadLexToken  (Data,Pos);
                   Ist:=Term;
                   result:=(RecvRes<>nil);
                  end;
             '|' :result:=ParseOr (N.Item[i],Pos,RecvRes,Ist);
             else
                Ist:=NonTerm;
                nn:=Data;
                if nn<>nil then result:=ParseMod (nn,Pos,RecvRes)
                else result:=ParseMod (N.Item[i],Pos,RecvRes);
             end;
             if result then begin
                TResultList(Res).Add (Recvres,Ist);
             end else begin
                 Pos:=Tmpos;
                 with TResultList(Res) do
                   while Count>tmpcou do Delete (tmpcou);
                     break;
             end;
           end;  {of ReadElement}
           inc (i);
        end;
      end;
      if not (Result) then break;
      inc (repts);
     end;   {of ReadRept}
     result:=(repts>=min);

     if not (result) then begin
          TResultList(Res).Free;
          Res:=nil;
     end;
     {if (#False) and (result) then begin
        {ShowMessage (TResultList(Res).Name);
        if Ist=NonTerm then ShowMessage ('NOnt');}
     {   Nop;
     end;}

end;


end.
