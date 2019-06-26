define(["Klass"], function (Klass) {
    var BinBuf=Klass.define({
        $:function (){
            this.buf=[];
            this.p=0;
        },
        addInt:function (val, bytes) {
            while(bytes--) {
                this.addByte(val&255);
                val=val>>8;
            }
        },
        addStr:function (str){
            for (var i=0;i<str.length;i++) {
                this.addByte(str.charCodeAt(i));
            }
        },
        addByte:function (b) {
            if (this.buf.length<=this.p) this.buf.push(0);
            this.buf[this.p++]=b;
        },
        getLen:function () {
            return this.buf.length;
        },
        pos:function () {return this.p;},
        seek:function (p) {this.p=p;}
    });
    var wavSPS=44100;
    WavWriter=Klass.define({
        $:function (raw, rawSampleRate) {
            this.raw=raw;
            this.rawSampleRate=rawSampleRate;
            this.buf=new BinBuf;
            this.onEnd=(function(){});
        },
        write: function () {
             var b=this.buf;
             b.addStr("RIFF");
             b.fileSizePos=b.pos();
             b.addInt(36,4); // file size
             b.addStr("WAVE");
             b.addStr("fmt ");
             b.addInt(16,4); // size of fmt
             b.addInt(1,2);  // fmt id
             b.addInt(1,2);  // #ch
             b.addInt(wavSPS,4); //samplerate
             b.addInt(wavSPS*2, 4); // bps
             b.addInt(2,2); // block size=byte/sample*ch
             b.addInt(16,2); // bit/sample
             b.addStr("data");
             //        44100  / 48000    crate=0.??
             var crate=wavSPS/this.rawSampleRate;
             b.dataSize=Math.floor(this.raw.length*crate);
             b.addInt(b.dataSize*2,4);
             for (var i=0 ;  i<b.dataSize;i++) {
                 b.addInt(Math.floor( (this.raw[Math.floor(i/crate)]||0)*32767),2);
             }
             var fileSize=b.pos();
             b.seek(b.fileSizePos);
             b.addInt(fileSize,4);
             this.onEnd();
             return b.buf;
         }
    });
    return WavWriter;
});
