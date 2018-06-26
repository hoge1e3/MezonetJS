unit SExtTree;

interface

uses SysUtils,Comctrls,Classes,Dialogs,Grammar;

type
    TNodeFunc = (Seq,FuncOr,Verb,FromTo,Linkable);
    TLexNode = record
        P:Pointer;
        Count:Integer;
        Name:pstring;
        Link:Pointer;
        case Func:TNodeFunc of
           Seq:(min,max:Integer);
           FromTo:(cf,ct:Char);
    end;
    PLexNode = ^TLexNode;
    TLexElem = record
        Kind:PLexNode;
        f,t:PChar;
        Data:Pointer;
    end;
    PLexElem = ^TLexElem;

function LexNodeItem (l:PLexNode;i:integer):PLexNode;
//procedure MakeLexNode (NewL:PLexNode;N:TTreeNode);
function GetSpaces (s:string):Integer;
procedure MakeLexNode (NewL:PLexNode;N:PStrs;var Ln:Integer);
procedure PutLexNode (ln:PLexNode;kais:string);
procedure LinkLexNode (ln:PLexNode);

function ExtLexaMod (N:PLexNode;var Pos:PChar):Boolean;
function ExtLexaOr (N:PLexNode;var Pos:PChar):Boolean;
function ExtLexa (N:PLexNode;var Pos:PChar):Boolean;
function ExtLexaAll (Sf,St:PChar):Pointer;

implementation

uses SPar,SExtPar,SString,UsrSub,SMezonet;

function LexNodeItem (l:PLexNode;i:integer):PLexNode;
begin
     result := PLexNode (PChar(l.P)+i*SizeOf (TLexNode));
end;

function GetSpaces (s:string):Integer;
var i,l:Integer;
begin
     result:=0;
     i:=1; l:=length (s);
     while i<=l do begin
           if s[i]=' ' then inc (result) else break;
           inc (i);
     end;
end;

procedure MakeLexNode (NewL:PLexNode;N:PStrs;var Ln:Integer);
var s,fs,ts:string;
    i,tmps,Spcs:integer;
begin
     //s:=N.Text;
     s:=N^[Ln];
     Spcs:=GetSpaces(s);
     s:=RightDol (s,Spcs+1);
     //ShowMessage (s);
    with NewL^ do begin
      Func:=Seq;
      case s[1] of
       '''':begin
          Func:=Verb;
          Name:=NewStr (RightDol (s,2));
          //if N.Count>0 then Bug ('Verb Tree can''t have child.');
       end;
       '$':begin
          Func:=Verb;
          Name:=NewStr (Chr(StrToInt (s)));
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
       '-': begin
          Func:=FromTo;
          Name:=NewStr (RightDol (s,2));
          //if N.Count<>2 then Bug ('"-" needs just two children to specify the range of acceptable letters');
          fs:=N^[Ln+1];
          fs:=RightDol(fs,Spcs+2);

          ts:=N^[Ln+2];
          ts:=RightDol(ts,Spcs+2);

          cf:=chr(0);ct:=chr(0);
          if fs[1]='''' then cf:=fs[2];
          if fs[1]='$' then cf:=Char(StrToInt(fs));
          if ts[1]='''' then ct:=ts[2];
          if ts[1]='$' then ct:=Char(StrToInt(ts));
          if (cf=chr(0)) or (ct=chr(0)) then Bug ('Please Put '''' or $ at the first letters of each children');
       end;
      else
          Name:=NewStr (s);
          Func:=LinkAble;
          {Link:=Search (LexNode,s);
          if Link=nil then begin
             Link:=NewL;
             min:=1;max:=1;
          end; }
      end;
      Link:=NewL;
      i:=0; Count:=0;
      inc (Ln);
      while True do begin
            tmps:=GetSpaces (N^[Ln+i]);
            if tmps=Spcs+1 then inc (Count);
            if tmps<=Spcs then break;
            inc (i);
      end;
      GetMem (P,SizeOf (TLexNode)*Count); IncGar_new;
      i:=0; while i<Count do begin
         MakeLexNode (LexNodeItem (NewL,i),N,Ln);
         inc (i);
      end;
    end;
end;
{
procedure MakeLexNode (NewL:PLexNode;N:TTreeNode);
var s:string;
    i:integer;
begin
     s:=N.Text;
    with NewL^ do begin
      Func:=Seq;
      case s[1] of
       '''':begin
          Func:=Verb;
          Name:=NewStr (RightDol (s,2));
          if N.Count>0 then Bug ('Verb Tree can''t have child.');
       end;
       '$':begin
          Func:=Verb;
          Name:=NewStr (Chr(StrToInt (s)));
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
       '-': begin
          Func:=FromTo;
          Name:=NewStr (RightDol (s,2));
          if N.Count<>2 then Bug ('"-" needs just two children to specify the range of acceptable letters');

          cf:=chr(0);ct:=chr(0);
          if N.Item[0].Text[1]='''' then cf:=N.Item[0].Text[2];
          if N.Item[0].Text[1]='$' then cf:=Char(StrToInt(N.Item[0].Text));
          if N.Item[1].Text[1]='''' then ct:=N.Item[1].Text[2];
          if N.Item[1].Text[1]='$' then ct:=Char(StrToInt(N.Item[1].Text));
          if (cf=chr(0)) or (ct=chr(0)) then Bug ('Please Put '''' or $ at the first letters of each children');
       end;
      else
          Name:=NewStr (s);
          Func:=LinkAble;
          {Link:=Search (LexNode,s);
          if Link=nil then begin
             Link:=NewL;
             min:=1;max:=1;
          end; }
{      end;
      Link:=NewL;
      Count:=N.Count;
      GetMem (P,SizeOf (TLexNode)*Count); IncGar_new;
      i:=0; while i<Count do begin
         MakeLexNode (LexNodeItem (NewL,i),N.Item[i]);
         inc (i);
      end;
    end;
end; }

procedure LinkLexNode (ln:PLexNode);
var i,c:Integer;
    tmpl:PLexNode;
begin
    if ln^.Func=LinkAble then begin
      ln^.Link:=ln;
      i:=0; while i<ExtLexNode.Count do begin
         tmpl:=LexNodeItem (@ExtLexNode,i);
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
          LinkLexNode (LexNodeItem (ln,i));
          inc (i);
       end;
    end;
end;


procedure PutLexNode (ln:PLexNode;kais:string);
var i:Integer;
begin
    {with ln^ do begin
       FormVal.Print (kais+Name^);
       kais:=kais+' ';
       i:=0; while i<Count do begin
          PutLexNode (LexNodeItem (ln,i),kais);
          inc (i);
       end;
    end;   }
end;

function ReadToken (s:string;var Pos:PChar):Boolean;
var nt:PChar;
    i,c:Integer;
begin
     result:=False;
     nt:=@s[1];
     i:=0;
     c:=length(s);
     while i<c do begin
           {case (Pos+i)^ of
           'A'..'Z':if Byte((Pos+i)^)-Ord('A')+Ord('a')
                    <> Byte((nt+i)^) then break;
           else }
           if (Pos+i)^<>(nt+i)^ then break;
           //end;
           inc (i);
     end;
     if i>=c then begin
        result:=True;
        inc (Pos,i);
     end;
end;


function ExtLexaOr (N:PLexNode;var Pos:PChar):Boolean;
var i,c:Integer;
    nn,NLink:PLexNode;
    Tmpos:PChar;
begin
    //ShowMessage ('OR '+N^.Name^);

     Tmpos:=Pos;
     with N^ do begin
        c:=Count;
        i:=0; while i<c do begin
           { Same as ReadMod From Here except RecvRes}
           nn:=LexNodeItem (N,i);
           NLink:=nn^.Link;
           with NLink^ do begin {of ReadElement}
             case Func of
             Verb: result:=ReadToken (Name^,Pos);
             FromTo: begin
                 result:=(Pos^>=cf) and (Pos^<=ct);
                 if result then inc (Pos);
               end;
             FuncOr:result:=ExtLexaOr (NLink,Pos);
             Seq   :result:=ExtLexaMod (NLink,Pos);
             end;
             { End Of Same as ReadMod }
           end;  {of ReadElement}
           if result then exit
           else Pos:=TmPos;
           inc (i);
        end;
     end;

end;

function ExtLexaMod (N:PLexNode;var Pos:PChar):Boolean;
var Tmpos,Tmpos2:PChar;
    i,c:Integer;
    nn,NLink:PLexNode;
    repts:Integer;
begin
   //ShowMessage ('Seq '+N^.Name^);
   {if N^.Name^='Num' then begin
      if N^.Name^='SAlpha' then repts:=0;
   end;  }
   repts:=0;
   TmPos2:=Pos;
   with N^ do begin
     while repts<max do begin {of ReadRept}
       Tmpos:=Pos;
       c:=Count;
       i:=0; while i<c do begin
           nn:=LexNodeItem (N,i);
           NLink:=nn^.Link;
           with NLink^ do begin {of ReadElement}
             { Same as ReadOr From Here except RecvRes}
             case Func of
             Verb: result:=ReadToken (Name^,Pos);
             FromTo: begin
                 result:=(Pos^>=cf) and (Pos^<=ct);
                 if result then inc (Pos);
             end;
             FuncOr:result:=ExtLexaOr (NLink,Pos);
             Seq   :result:=ExtLexaMod (NLink,Pos);
             end;
             { End Of Same as ReadOr }
           end;  {of ReadElement}
           if not (Result) then break;
           inc (i);
       end;
       if not (Result) then begin
          Pos:=TmPos;
          break;
       end;
       inc (repts);
     end;   {of ReadRept}
     result:=(repts>=min);
   end;
   if not (Result) then Pos:=TmPos2;
end;

function ExtLexa (N:PLexNode;var Pos:PChar):Boolean;
begin
   with N^ do begin
     case Func of
     FuncOr: result:=ExtLexaOr (Link,Pos);
     Verb: result:=ReadToken (N.Name^,Pos);
     FromTo: begin
                 result:=(Pos^>=cf) and (Pos^<=ct);
                 if result then inc (Pos);
             end;
     else
       result:=ExtLexaMod (Link,Pos);
     end;
   end;
end;

function ExtLexaAll (Sf,St:PChar):Pointer;
var RecvRes:Pointer;
    SendRes:TList;
    i,c:Integer;
    Pos,Tmpos:PChar;
    N:PLexNode;
    IsSym,LSuc:Boolean;
    lEl:PLexElem;
begin
     c:=ExtLexNode.Count;
     SendRes:=TList.Create;      IncGar;
     Pos:=Sf;
     while Pos<St do begin
        Tmpos:=Pos;
        IsSym:=False;
        {case Pos^ of
        'a'..'z','A'..'Z':begin
              i:=LAlpNode+1;
              IsSym:=True;
        end;
        '0'..'9':i:=LNumNode+1;
        else
            i:=LDlmNode+1;
        end;   }
        i:=0;
        while i<c do begin
           N:=LexNodeItem (@ExtLexNode,i);
           if N^.Name^[1]='*' then begin
              i:=c;
              break;
           end;
           LSuc:=ExtLexa (N,Tmpos);
           {case Tmpos^ of
           'a'..'z','A'..'Z','0'..'9':LSuc:=LSuc and not(IsSym);
           end;  // "in" captures "index1"  then,invalidate "in"}
           if LSuc then begin
              LexOnEnd (N.Name^,Pos,Tmpos,RecvRes);
              //SendRes.Add (LexNode.Item[i]);
              New (lEl); IncGar_new;
              lEl^.Kind:=N;
              lEl^.f:=Pos;
              lEl^.t:=TmPos;
              lEl^.Data:=RecvRes;

              {SendRes.Add (N);
              SendRes.Add (RecvRes);}
              SendRes.Add (lEl);
              Pos:=Tmpos;
              break;
           end;
           inc (i);
        end;
        if i>=c then
           inc (Pos);
     end;
     Result:=SendRes;
end;


end.
