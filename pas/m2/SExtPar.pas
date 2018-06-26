unit SExtPar;

interface

uses SysUtils,Comctrls,Classes,Dialogs,SExtTree,SFixList,Grammar;

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

    TGramNode = record
        Opr:Pointer;
        P:Pointer;
        Count:Integer;
        Name:pstring;
        Link:Pointer;
        case Func:TNodeFunc of
           Seq:(min,max:Integer);
    end;
    PGramNode = ^TGramNode;

//procedure MakeGramNode (NewL:PGramNode;N:TTreeNode);
procedure MakeGramNode (NewL:PGramNode;N:PStrs;var Ln:Integer);
procedure PutGramNode (ln:PGramNode;kais:string);
procedure LinkGramNode (ln:PGramNode);

function ExtParseMod (N:PGramNode;var Pos:TLexPos;var Res:Pointer):Boolean;
function ExtParseOr (N:PGramNode;var Pos:TLexPos;var Res:Pointer;var Ist:TElKind):Boolean;
function ExtParse (N:PGramNode;var Pos:TLexPos;var Res:Pointer):Boolean;
procedure Bug (s:string);
function ReadLexToken (p:Pointer;var t:TLexPos):Pointer;

{var
   LastLexPos:Integer;
 }
implementation

uses SPar,SString,UsrSub,SMezonet;

function ReadLexToken (p:Pointer;var t:TLexPos):Pointer;
var it:PLexElem;
begin
     result:=nil;
     with t do begin
          if i>=l.Count then exit;
          it:=l.Items[i];
          if it^.Kind=p then begin
             {if (LastPos=nil) or (LastPos<it^.f) then }LastPos:=it^.f;
             //LastLexPos:=i;
             result:=it;//.Data;
             inc (i);
          end;
     end;
end;

function Nop:Integer;
begin
     result:=0;
end;

procedure Bug (s:string);
begin
     ShowMessage ('ƒoƒO”­¶:'+s);
end;

function GramNodeItem (l:PGramNode;i:integer):PGramNode;
begin
     result := PGramNode (PChar(l.P)+i*SizeOf (TGramNode));
end;

procedure MakeGramNode (NewL:PGramNode;N:PStrs;var Ln:Integer);
var s:string;
    i,c,tmps,Spcs:integer;
    tmpl:PLexNode;
begin
     //s:=N.Text;
     s:=N^[Ln];
     Spcs:=GetSpaces(s);
     s:=RightDol (s,Spcs+1);
     //ShowMessage (s);
    with NewL^ do begin
      Func:=Seq;
      Link:=NewL;
      case s[1] of
       '''':begin
          Func:=Verb;
          Name:=NewStr (RightDol (s,2));
          c:=ExtLexNode.Count;
          i:=0; while i<c do begin
             tmpl:=LexNodeItem (@ExtLexNode,i);
             if tmpl^.Name^=Name^ then begin
                Link:=tmpl;
                break;
             end;
             inc (i);
          end;
          if i>=c then Bug (Name^+' is not linked.');
          //if N.Count>0 then Bug ('Verb Tree can''t have child.');
       end;
       '|': begin
          Func:=FuncOr;
          Name:=NewStr (RightDol (s,2));
       end;
       '{': begin
          Name:=NewStr (RightDol (s,3));
          min:=0;max:=123456;
       end;
       '[': begin
          Name:=NewStr (RightDol (s,3));
          if s[2]=']' then begin
             min:=0;max:=1;
          end else begin
             min:=1;
             max:=123456;
          end;
       end;
      else
          Name:=NewStr (s);
          Func:=LinkAble;
      end;
      {with OpEntry do begin
         i:=Indexof (Name^);
         if i>-1 then
            Opr:=Pointer(Objects[i])
         else begin
            //ShowMessage ('No Opration Ent. for '+Name^);
            Opr:=@OpErr;
         end;
      end; }
      //Count:=N.Count;
      i:=0; Count:=0;
      inc (Ln);
      while True do begin
            tmps:=GetSpaces (N^[Ln+i]);
            if tmps=Spcs+1 then inc (Count);
            if tmps<=Spcs then break;
            inc (i);
      end;
      //ShowMessage (s+'..Count='+IntToStr (Count));
      GetMem (P,SizeOf (TGramNode)*Count); IncGar_new;
      i:=0; while i<Count do begin
         MakeGramNode (GramNodeItem (NewL,i),N,Ln);
         inc (i);
      end;
    end;
end;


{procedure MakeGramNode (NewL:PGramNode;N:TTreeNode);
var s:string;
    i,c:integer;
    tmpl:PLexNode;
begin
     s:=N.Text;
    with NewL^ do begin
      Func:=Seq;
      Link:=NewL;
      case s[1] of
       '''':begin
          Func:=Verb;
          Name:=NewStr (RightDol (s,2));
          c:=ExtLexNode.Count;
          i:=0; while i<c do begin
             tmpl:=LexNodeItem (@ExtLexNode,i);
             if tmpl^.Name^=Name^ then begin
                Link:=tmpl;
                break;
             end;
             inc (i);
          end;
          if i>=c then Bug (Name^+' is not linked.');
          if N.Count>0 then Bug ('Verb Tree can''t have child.');
       end;
       '|': begin
          Func:=FuncOr;
          Name:=NewStr (RightDol (s,2));
       end;
       '{': begin
          Name:=NewStr (RightDol (s,3));
          min:=0;max:=123456;
       end;
       '[': begin
          Name:=NewStr (RightDol (s,3));
          if N.Text[2]=']' then begin
             min:=0;max:=1;
          end else begin
              min:=1;
              max:=123456;
          end;    
       end;
      else
          Name:=NewStr (s);
          Func:=LinkAble;
      end;
      {with OpEntry do begin
         i:=Indexof (Name^);
         if i>-1 then
            Opr:=Pointer(Objects[i])
         else begin
            //ShowMessage ('No Opration Ent. for '+Name^);
            Opr:=@OpErr;
         end;
      end;  }
{      Count:=N.Count;
      GetMem (P,SizeOf (TGramNode)*Count); IncGar_new;
      i:=0; while i<Count do begin
         MakeGramNode (GramNodeItem (NewL,i),N.Item[i]);
         inc (i);
      end;
    end;
end;}

procedure LinkGramNode (ln:PGramNode);
var i,c:Integer;
    tmpl:PGramNode;
begin
    if ln^.Func=LinkAble then begin
      ln^.Link:=ln;
      c:=ExtGramNode.Count;
      i:=0; while i<c do begin
         tmpl:=GramNodeItem (@ExtGramNode,i);
         if tmpl^.Name^=ln^.Name^ then begin
            ln^.Link:=tmpl;
            break;
         end;
         inc (i);
      end;
      if ln^.Link=ln then begin
         ln^.Func:=Seq;
         ln^.min:=1;
         ln^.max:=1;
      end;
    end;
    with ln^ do begin
       i:=0; while i<Count do begin
          LinkGramNode (GramNodeItem (ln,i));
          inc (i);
       end;
    end;
end;


procedure PutGramNode (ln:PGramNode;kais:string);
var i:Integer;
begin
    {with ln^ do begin
       FormVal.Print (kais+Name^);
       kais:=kais+' ';
       i:=0; while i<Count do begin
          PutGramNode (GramNodeItem (ln,i),kais);
          inc (i);
       end;
    end;   }
end;

function ExtParseOr (N:PGramNode;var Pos:TLexPos;var Res:Pointer;var Ist:TElKind):Boolean;
var i,c:Integer;
    nn,NLink:PGramNode;
    TmPos:TLexPos;
begin
     //ShowMessage ('OR '+N^.Name^);

     Tmpos:=Pos;
     with N^ do begin
        c:=Count;
        i:=0; while i<c do begin
           nn:=GramNodeItem (N,i);
           NLink:=nn^.Link;
           if nn^.Func=Verb then begin
             Res:=ReadLexToken (NLink,Pos);
             Ist:=Term;
             result:=(Res<>nil);
           end else begin
             with NLink^ do begin {of ReadElement}
               case Func of
               FuncOr:result:=ExtParseOr (NLink,Pos,Res,Ist);
               Seq   :begin
                  Ist:=NonTerm;
                  result:=ExtParseMod (NLink,Pos,Res);
                end;
               end;
             end;
           end; {of ReadElement}
           if result then exit
           else Pos:=TmPos;
           inc (i);
        end;
     end;

end;

function ExtParseMod (N:PGramNode;var Pos:TLexPos;var Res:Pointer):Boolean;
var Tmpos,Tmpos2:TLexPos;
    i,c:Integer;
    nn,NLink:PGramNode;
    repts:Integer;
    tmpcou:Integer;
    RecvRes:Pointer;
    Ist:TElKind;

begin
  { if (N^.Name^='Args') or (N^.Name^='numonly') then begin
       if N^.Name^='Aho' then inc (i);
   end; }
   repts:=0;
   TmPos2:=Pos;
   Res:=TResultList.Create (N^.Name^{,N^.Opr});      IncGar;


   with N^ do begin
     while repts<max do begin {of ReadRept}
       tmpcou:=TResultList(Res).Count;
       Tmpos:=Pos;
       c:=Count;
       i:=0; while i<c do begin
           nn:=GramNodeItem (N,i);
           NLink:=nn^.Link;
           with NLink^ do begin {of ReadElement}
             if nn^.Func=Verb then begin
               RecvRes:=ReadLexToken (NLink,Pos);
               Ist:=Term;
               result:=(RecvRes<>nil);
             end else begin
               with NLink^ do begin {of ReadElement}
                 case Func of
                 FuncOr:result:=ExtParseOr (NLink,Pos,RecvRes,Ist);
                 Seq   :begin
                      Ist:=NonTerm;
                      result:=ExtParseMod (NLink,Pos,RecvRes);
                  end;
                 end;
               end;
             end;
           end;  {of ReadElement}
           if result then begin
              TResultList(Res).Add (Recvres,Ist);
           end else begin
              Pos:=Tmpos;
              with TResultList(Res) do
                while Count>tmpcou do Delete (tmpcou);
                  break;
           end;
           inc (i);
       end;
       if not (Result) then begin
          break;
       end;
       inc (repts);
     end;   {of ReadRept}
     result:=(repts>=min);
   end;
   if not (Result) then begin
      Pos:=TmPos2;
      if Res<>nil then begin
        TResultList(Res).Free; DecGar;
        Res:=nil;
      end;  
   end;
end;

function ExtParse (N:PGramNode;var Pos:TLexPos;var Res:Pointer):Boolean;
var Ist:TElKind;
begin
   with N^ do begin
     case Func of
     FuncOr: result:=ExtParseOr (Link,Pos,Res,Ist);
     Verb: begin
           Res:=ReadLexToken (Link,Pos);
           result:=(Res<>nil);
     end;
     Seq: result:=ExtParseMod (Link,Pos,Res);
     end;
   end;
   if Pos.i<Pos.l.Count then begin
      ShowMessage ('•¶–@‚ªŒë‚Á‚Ä‚¢‚Ü‚·');
      //LastPos:=PLexElem (Pos.l.Items[Pos.i])^.f;
      result:=False;
   end;
end;


end.
