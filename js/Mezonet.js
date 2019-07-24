define(["Klass","SEnv","Tones2","promise"],
function (Klass,SEnv,WDT2,_) {
    var Mezonet={};
    Mezonet.Source=Klass.define({
        $this:true,
        $:function (t,array) {
            t.chdata=[];
            t.Mezonet=Mezonet;
            t.load(array);
        },
        playback: function (t,context) {
            return new Mezonet.Playback(context, {
                source:t,
                //chdata:t.chdata,
                WaveDat:Mezonet.WDT.WaveDat,
                EnvDat: Mezonet.WDT.EnvDat
            });
        },
        load:function (t,d) {
            var ver=readLong(d);
            var chs=readByte(d);
            //var chdatas;
            //t.MPoint=chdatas=[];
            for (var i=0;i<chs;i++) {
                var chdata=[];
                //chdatas.push(chdata);
                var len=readLong(d);
                //console.log(len);
                //if(len>999999) throw new Error("LONG");
                for (var j=0;j<len;j++) {
                    chdata.push(readByte(d));
                }
                t.chdata[i]=chdata;
            }
            function readByte(a) {
                if (a.length==0) throw new Error("Out of data");
                return a.shift();
            }
            function readLong(a) {
                if (a.length<4) throw new Error("Out of data");
                var r=a.shift(),e=1;
                e<<=8;
                r+=a.shift()*e;
                e<<=8;
                r+=a.shift()*e;
                e<<=8;
                r+=a.shift()*e;
                return r;
            }
        }
    });
    Mezonet.Playback=SEnv;
    function WDT2Float(w) {return w/128-1;}
    var WvC=96;
    Mezonet.WDT={
        WaveDat:[],
        EnvDat:[],
        setNoiseWDT: function () {
            var t=this;
            // Noise
            for (var j=0;j<1024;j++) {
                t.WaveDat[WvC-1][j]=WDT2Float( Math.floor(Math.random() * 78 + 90) );
            }
            t.WaveDat[WvC-1].lambda=32;
        },
        load: function(){
            var t=this;
            if (t.loaded) return Promise.resolve();
            return new Promise(function (succ,fail) {
/*            try{
                var url=WDT;
                var oReq = new XMLHttpRequest();
                oReq.open("GET", url, true);
                oReq.responseType = "arraybuffer";
                oReq.onload = function (oEvent) {
                    var arrayBuffer = oReq.response,i,j;
                    if (arrayBuffer) {*/
                        var b = WDT2;//new Uint8Array(arrayBuffer);
                        //console.log("Loading wdt",b.length);
                        //WaveDat
                        var idx=0,i,j;
                        for (i = 0; i < WvC; i++) {
                            t.WaveDat[i]=[];
                            for (j=0;j<32;j++) {
                                t.WaveDat[i][j]=WDT2Float( b[idx++] );
                            }
                        }
                        t.setNoiseWDT();
                        //EnvDat
                        for (i=0 ;i<16;i++) {//Envs
                            t.EnvDat[i]=[];
                            for (j=0;j<32;j++) {
                                t.EnvDat[i][j]=b[idx++];
                            }
                        }
                        //console.log("Loading wdt done");
                        t.loaded=true;
                        succ();
/*                    }
                };
                oReq.send(null);
            } catch(e) {fail(e);}*/
        });
        }
    };
    Mezonet.init=function () {
        return Mezonet.WDT.load();
    };
    return Mezonet;
});
