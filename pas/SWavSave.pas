unit SWavSave;

interface

uses Classes;

type
    TWaveSaver = class
        FileName:string;
        fp:file;
        Size:Integer;
        Blocks:TList;
        BlockSize:Integer;
        isError:Boolean;
        constructor Create (s:string;bs:Integer);
        destructor Destroy; override;
        procedure AddBuffer (P:PChar;Sz:Integer);
    end;
    Arrays = array [0..1000000] of Byte;
    PArrays = ^Arrays;

const
    HdrSize = 44;

var
    WavHdr:array [0..HdrSize-1] of Byte
    =(
    $52,$49,$46,$46,  0,  0,  0,  0,$57,$41,$56,$45,
//  R   I   F   F                   W   A   V
    $66,$6d,$74,$20,
//  f   m   t
    $10,$00,$00,$00, //Len=16
    $01,$00, $01,$00,  $44,$AC,$00,$00, $44,$AC,$00,$00,
//   ?       mono      Samples          Bytes/sec
    $01,$00   ,$08,$00, $64,$61,$74,$61,  0,  0,  0,  0
//  Bytes/elem bits
    );

implementation

uses SMezonet;

constructor TWaveSaver.Create (s:string;bs:Integer);
begin
     FileName:=s;
     isError:=False;
     try
      AssignFile (fp,FileName);
      ReWrite (fp,1);
      Blocks:=TList.Create;  IncGar;
      BlockSize:=bs;
      Size:=HdrSize;
     except
      isError:=True;
     end;
end;

destructor TWaveSaver.Destroy;
var WriteSize:Integer;
    i:Integer;
    Pa:PArrays;
begin
     if isError then exit;
     WavHdr[4]:= ((Size-8) shr  0) and 255;
     WavHdr[5]:= ((Size-8) shr  8) and 255;
     WavHdr[6]:= ((Size-8) shr 16) and 255;
     WavHdr[7]:= ((Size-8) shr 24) and 255;

     WavHdr[40]:=((Size-44) shr  0) and 255;
     WavHdr[41]:=((Size-44) shr  8) and 255;
     WavHdr[42]:=((Size-44) shr 16) and 255;
     WavHdr[43]:=((Size-44) shr 24) and 255;

     BlockWrite (fp,WavHdr,HdrSize);
     dec (Size,HdrSize);
     i:=0; while i<Blocks.Count do begin
           if Size>BlockSize then WriteSize:=BlockSize
           else WriteSize:=Size;

           Pa:=Blocks.Items[i];
           BlockWrite (fp,Pa^,WriteSize);
           FreeMem (Pa);DecGar_new;

           dec (Size,WriteSize);
           inc (i);
     end;
     //if Size<>0 then ShowMessage ('Your Leftover Pizza...');
     if Blocks<>nil then begin
      Blocks.Free; DecGar;
     end;
     CloseFile (fp);
end;

procedure TWaveSaver.AddBuffer (P:PChar;Sz:Integer);
var i:Integer;
    DstP:PChar;
begin
     if isError then exit;
     if Sz<=0 then exit;
     GetMem (DstP,Sz); IncGar_new;
     Blocks.Add (DstP);
     for i:=0 to Sz-1 do begin
           (DstP+i)^:=(P+i)^;
     end;
     inc (Size,Sz);
end;

end.
