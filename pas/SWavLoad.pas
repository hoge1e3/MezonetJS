unit SWavLoad;

interface

const
     HdrSize=44;

type
    TWavFmt = record
        len:Integer;
        _type,Stereo:Word; // mono=1 Stereo=2
        Rate,_bytespersec:Integer;  //  11025 22500 44100
        _bytesperelem,Bit8_16:Word; // 8bit=8  16bit=16;
    end;
    PWavFmt = ^TWavFmt;
    TWavLoader = class
        fmt:TWavFmt;
        
        FileName:string;
        Buffer,Start:PChar;
        WholeLen,Len,Log2Len:Integer;
        ErrorNotFound,ErrorFormat,ErrorData:Boolean;
        function isError:Boolean;
        constructor Create (fn:string);
        procedure ReadWAVEfmt;
        procedure Readdata;
        function FindStr (s:string):PChar;
        destructor Destroy; override;
        constructor Clone (t:TObject);
        function elementSize:Integer;
        // element: 右左の音素セット。最大４バイト
        procedure elementAt(i:Integer;var l,r:Integer);
    end;
    BigData = array [0..100000] of Char;
    PBigData = ^BigData;
    PShortInt = ^ShortInt;
    PSmallInt = ^SmallInt;

var
       WavHdr:array [0..HdrSize-1] of Byte
    =(
    $52,$49,$46,$46,  0,  0,  0,  0,$57,$41,$56,$45,$66,$6d,$74,$20,
    $10,$00,$00,$00,$01,$00, $01,$00,$22,$56,$00,$00,$22,$56,$00,$00,
    $01,$00,$08,$00, $64,$61,$74,$61,  0,  0,  0,  0
    );


implementation

uses SysUTils,SMezonet;

function TWavLoader.isError:Boolean;
begin
     result:=ErrorNotFound or ErrorFormat or ErrorData;
end;

function TWavLoader.FindStr (s:string):PChar;
var i,l:Integer;
begin
     l:=Length(s);
     result:=Buffer;
     while result<Buffer+WholeLen-l do begin
           i:=0;
           while i<l do begin
               if (result+i)^<>s[i+1] then break;
               inc (i);
           end;
           if i>=l then exit;
           inc (result);
     end;
     result:=nil;

end;

procedure TWavLoader.ReadWAVEfmt;
var s:string;
    p:PChar;
    i,l:Integer;
begin
     ErrorFormat:=True;
     p:=FindStr ('WAVEfmt ');
     if p<>nil then begin
         inc (p,8); // Skip "Wavefmt "
         fmt:=PWavFmt(p)^;
         inc (p,6); // Skip HdrLength,Tag
         // mono?(2)     Samples(4)
         // Bytes/sec(4)    Bytes/elem(2)   bits(2)
         {for i:=0 to 13 do begin
             if Byte((p+i)^)<>WavHdr[i+22] then break;
             if i=13 then ErrorFormat:=False;
         end;      }
         ErrorFormat:=False;
     end;
end;

function TWavLoader.elementSize:Integer;
begin
     result:=Len div fmt._bytesperelem;
end;

procedure TWavLoader.elementAt(i:Integer;var l,r:Integer);
begin
     if fmt.Bit8_16=8 then begin
        l := (Byte((Start+i*fmt._bytesperelem )^)-128)*256;
     end else begin
        l := (PSmallInt(Start+i*fmt._bytesperelem ))^;
     end;
     r := l;
end;

procedure TWavLoader.Readdata;
var s:string;
    p,newb:PChar;
    i,l,ll,rr,newSize:Integer;
begin
     ErrorData:=True;
     p:=FindStr('data');
     if p<>nil then begin
         inc (p,4);   // Skip "data"
         Len:=0;
         {Len:=Len or ( Byte((p+0)^) shl 0 );
         Len:=Len or ( Byte((p+1)^) shl 8 );
         Len:=Len or ( Byte((p+2)^) shl 16 );
         Len:=Len or ( Byte((p+3)^) shl 24 );}
         Start:=p+4;
         //ShowMessage (IntTostr  (Integer(Pointer(Start)))+'**' );

         Len:=Buffer+WholeLen-Start;
         ErrorData:=False;
         //if Start+Len=Buffer+WholeLen then ErrorData:=False;
         newSize:=elementSize * (44100 div fmt.Rate);
         GetMem (newb,newSize);
         for i:=0 to newSize-1 do begin
             elementAt(i div (44100 div fmt.Rate) ,ll,rr);
             (newb+i)^:=Chr( 128+ (ll div 256) );
         end;
         FreeMem(Buffer);
         Buffer:=newb;
         Start:=newb;
         Len:=newSize;
         WholeLen:=Len;

     end;
end;

destructor TWavLoader.Destroy;
begin
     inherited Destroy;
     FreeMem (Buffer);  DecGar_new;
end;

constructor TWavLoader.Clone (t:TObject);
var tt:TWavLoader;
    i,c:Integer;
begin
     tt:=TWavLoader(t);
     Len:=1;Log2Len:=0;
     while Len<tt.Len do begin
           inc(Log2Len);
           Len:=Len*2;
     end;
     GetMem (Buffer,Len); IncGar_new;
     Start:=Buffer;
     i:=0;c:=Len;
     {ShowMessage (IntTostr  (Integer(Pointer(Start)))+'//'
                  +IntTostr (Integer(Pointer(tt.Start))) );}
     //try
     while i<c do begin
         if i<tt.Len-1 then (Start+i)^:=(tt.Start+i)^
         else (Start+i)^:=Chr(128);//(tt.Start+tt.Len-1)^;
         inc(i);
     end;
     {except
          ShowMessage (IntTostr (i)+'//');

     end;    }
end;

constructor TWavLoader.Create (fn:string);
var f:file;
begin
     if fn='' then exit;

     ErrorNotFound:=False;
     try
       AssignFile (f,fn);
       ReSet (f,1);
     except
       ErrorNotFound:=True;
     end;
     if ErrorNotFound then exit;
     WholeLen:=FileSize (f);
     GetMem (Buffer,WholeLen);  IncGar_new;
     BlockRead (f,PBigData(Buffer)^,WholeLen);
     CloseFile (f);

     ReadWAVEfmt;
     ReadData;

     {if not ErrorFormat and not ErrorData then begin
         ShowMessage ('Success '+fn+' : Length='+IntToStr(Len));
     end; }
end;


end.
