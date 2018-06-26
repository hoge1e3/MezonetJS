unit SPar;

interface

uses
  Windows, Messages, SysUtils, Classes, Graphics, Controls, Forms, Dialogs,
  ComCtrls, Menus, StdCtrls, ExtCtrls,UsrSub,
  SoundKer,SEnv, UnInt,SFixList,SExtTree,SExtPar;

type
  TForm1 = class(TForm)
    Timer1: TTimer;
    Memo1: TRichEdit;
    procedure FormCreate(Sender: TObject);
    procedure PutRes(s:TResultList;kais:string);
    procedure Timer1Timer(Sender: TObject);
  private
    { Private êÈåæ }
  public
    { Public êÈåæ }
  end;

var
  Sg:TEnveloper;
  //Mz:TMezonet;
  Time_r:integer;
  Tone:Integer;
  PRevRPos:integer;
  SeBuf:PChar;
  Size:Integer;

  Form1: TForm1;
  StartInput:Pchar;
  StateMent:string;
  LexNode,GramNode:TTreeNode;
  SrcTime,OnEndTime:Integer;
  LexRes:TList;
  Dats:array [0..10] of Integer;
  SBuf:PChar;
  Capt:^string;

  NLCrets,NLDests:Integer;

  ExtLexNode:TLexNode;
  ExtGramNode:TGramNode;
  PrevCom:String;


implementation

uses SWave,SEdit,SObj,Grammar,SMezonet;

{$R *.DFM}
procedure TForm1.FormCreate(Sender: TObject);
var c,i:Integer;
    Ln,Spcs:Integer;
    fn:string;
begin
     Sg:=nil;
     Gar:=0;
     PrevCom:='';

     for i:=0 to Chs-1 do BinBuf[i]:=nil;

     Ln:=0;  Spcs:=0;
     MakeLexNode (@ExtLexNode,@StrLexical,Ln);
     LinkLexNode (@ExtLexNode);

     Ln:=0;  Spcs:=0;
     MakeGramNode (@ExtGramNode,@StrGrammar,Ln);
     LinkGramNode (@ExtGramNode);


     //Mz:=TMezonet.Create(Self);
     SG:=TEnveloper.Create (Application.Handle);      IncGar;

     FormWave:=TFormWave.Create (Application);
     FormEditor.Show;

     fn:=AppDir+'\AutoPlay.mzo';
     if FileExists (fn) then begin
        LoadObj (fn);
        FormEditor.L1Click (Self);
        FormEditor.Compiled:=False;
     end;

end;

procedure TForm1.PutRes(s:TResultList;kais:string);
var i,c:Integer;
    pn,dp:String;
begin
     Memo1.Lines.Add (kais+s.Name);

     kais:=kais+'- ';
     i:=0;c:=s.Count;
     while i<c do begin
           if s.ItemKind[i]=NonTerm then
              PutRes (TResultList(s.Items[i]),kais)
           else
              Memo1.Lines.Add (kais+PutLexType (PLexType (s.Items[i])^));
           inc (i);
     end;
end;

procedure TForm1.Timer1Timer(Sender: TObject);
begin
     //Caption:=IntToStr(Sg.BSize);
     if Sg=nil then exit;
     SG.RefreshPSG;
     if PrevCom<>Sg.ComStr then begin
        FormEditor.Caption:=Sg.ComStr;
        PrevCom:=Sg.ComStr
     end;
     //Caption:=IntToStr (Gar_new)+'/'+IntToStr (Gar);
end;

end.
