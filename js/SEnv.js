/* global requirejs */
define("SEnv", ["Klass", "assert","promise"], function(Klass, assert,_) {
    function now(){return new Date().getTime();}
    //--- Also in M2Parser
    var Ses = 10,
        Chs = 10,
        Regs = Chs * 3,
        WvElC = 32,
        EnvElC = 32,
        WvC = 96,
        wdataSize = 48000,  // should be dividable by 120
        //   99=r 100=vol 101=ps (x*128)  255=end
        MRest = 99,
        MVol = 100,
        Mps = 101,
        MSelWav = 102,
        MTempo = 103,
        MJmp = 104,
        MSlur = 105,
        MPor = 106,
        MSelEnv = 107,
        MWait = 108,
        MCom = 109,
        MDet = 110,
        MWOut = 111,
        MWEnd = 112,
        MWrtWav = 113,
        MWrtEnv = 114,
        MLfo = 115,
        MSync = 116,
        MPCMReg = 117,
        MLfoD = 118,
        MBaseVol = 119,
        MLabel = 120,

        Mend = 255,

        //sync=0:非同期、1:同期、2:ワンショット 3:鋸波形
        LASync = 0,
        LSync = 1,
        LOneShot = 2,
        LSaw = 3,

        Envs = 16,
        PCMWavs = 16, // 96-111
        FadeMax = 256,

        div = function(x, y) {
            return Math.trunc(x/y);
            //return Math.trunc(chkn(x,"x") / chkn(y,"y") );
        },
        chkn = function (x,mesg) {
            if (x!==x) throw new Error(mesg+": Not a number!");
            if (typeof x!=="number") {console.error(x);throw new Error(mesg+": Not a not a number but not a number!");}
            return x;
        },
        abs = Math.abs.bind(Math),
        ShortInt = function(b) {
            return b >= 128 ? b - 256 : b;
        },
        StrPas=function (ary,idx) {
            var a=[];
            for (var i=idx;ary[i];i++) {
                a.push(ary[i]);
            }
            return a;
        },
        array2Int= function (ary,idx) {
            var r=ary[idx];
            r+=ary[idx+1]*0x100;
            r+=ary[idx+2]*0x10000;
            r+=ary[idx+3]*0x1000000;
            if (r>=0x80000000) r-=0x100000000;
            return r;
        },
        Integer = Number,
        sinMax_s = 5,
        sinMax = 65536 >> sinMax_s, //2048,
        /*SPS = 44100,
        SPS96 = 22080,
        SPS_60 = div(44100, 60),*/
        DivClock = 111860.78125,// See [1]
        Loops = 163840,
//---------End include
        m2t = [0xd5d, 0xc9c, 0xbe7, 0xb3c, 0xa9b, 0xa02, 0x973, 0x8eb, 0x86b, 0x7f2, 0x780, 0x714,
            0x6af, 0x64e, 0x5f4, 0x59e, 0x54e, 0x501, 0x4ba, 0x476, 0x436, 0x3f9, 0x3c0, 0x38a,
            0x357, 0x327, 0x2fa, 0x2cf, 0x2a7, 0x281, 0x25d, 0x23b, 0x21b, 0x1fd, 0x1e0, 0x1c5,
            0x1ac, 0x194, 0x17d, 0x168, 0x153, 0x140, 0x12e, 0x11d, 0x10d, 0xfe, 0xf0, 0xe3,
            0xd6, 0xca, 0xbe, 0xb4, 0xaa, 0xa0, 0x97, 0x8f, 0x87, 0x7f, 0x78, 0x71,
            0x6b, 0x65, 0x5f, 0x5a, 0x55, 0x50, 0x4c, 0x47, 0x43, 0x40, 0x3c, 0x39,
            0x35, 0x32, 0x30, 0x2d, 0x2a, 0x28, 0x26, 0x24, 0x22, 0x20, 0x1e, 0x1c,
            0x1b, 0x19, 0x18, 0x16, 0x15, 0x14, 0x13, 0x12, 0x11, 0x10, 0xf, 0xe
        ],//  From: Tbl5-1 of [1]
        //[1]  http://ngs.no.coocan.jp/doc/wiki.cgi/TechHan?page=1%BE%CF+PSG%A4%C8%B2%BB%C0%BC%BD%D0%CE%CF
        Trunc = Math.trunc.bind(),
        stEmpty = -1,
        stFreq = 1,
        stVol = 2,
        stWave = 3,
        sndElemCount = 64,
        //type
        /*TSoundElem = Klass.define({
            $fields: {
                time: Integer,
                typ: Integer,
                val: Integer
            }
        }),*/
        nil = null,
        False = false,
        True = true,
        //TPlayState = (psPlay,psStop,psWait,psPause);
        psPlay = "psPlay",
        psStop = "psStop",
        psWait = "psWait",
        psPause = "psPause",
        m2tInt=[], //:array[0..95] of Integer;
        sinT = [], //:array [0..sinMAX-1] of ShortInt;
        TTL, //:Integer;
        cnt; //:Integer;// debug
    var defs;
    var TEnveloper = Klass.define(defs={ //class (TSoundGenerator)
        $this: "t",
        $fields: {
            //BSize: Integer,
            Pos: Integer,
            PrevPos: Integer,
            RPos: Integer,
            //WriteAd: Integer,
            //SccCount: Array, // [0..Chs-1] of Integer;
            //Steps: Array, // [0..Chs-1] of integer;
            //SccWave: Array, // [0..Chs-1] of PChar;
            WaveDat: Array, // [0..WvC-1,0..WvElC-1] of Byte;
            //RefreshRate: Number, //longint,//;
            //RRPlus: Integer,
            //PosPlus: Integer, //;
            wdata2: Array,//array[0..wdataSize-1] of SmallInt;

            BeginPlay: Boolean,
            SeqTime: Integer,
            SeqTime120: Integer,

            WavOutMode: Boolean,
            //WavPlaying: Boolean,
            /*{$ifdef ForM2}
            WavOutObj:TWaveSaver,
            {$endif}*/
            //EShape: Array, // [0..Chs-1] of PChar,
            //EVol: Array,
            //EBaseVol: Array,
            //ESpeed: Array,
            //ECount: Array, // [0..Chs-1] of Word,
            //Oct: Array, // [0..Chs-1] of Byte,
            //MCount: Array, // [0..Chs-1] of Integer,
            //MPoint: Array, // [0..Chs-1] of PChar,
            //MPointC: Array, // [0..Chs-1] of Integer,
            //Resting: Array, // [0..Chs-1] of Boolean,
            //PlayState: Array, // [0..Chs-1] of TPlayState,
            //Slur: Array,
            //Sync: Array, // [0..Chs-1] of Boolean,
            //Detune: Array, // [0..Chs-1] of Integer,
            //PorStart: Array,
            //PorEnd: Array,
            //PorLen: Array, // [0..Chs-1] of Integer,
            //LfoV: Array,
            //LfoA: Array,
            //LfoC: Array,
            //LfoD: Array,
            //LfoDC: Array,
            //LfoSync: Array, // [0..Chs-1] of Integer,
            //sync=0:非同期、1:同期、2:ワンショット 3:鋸波形
            Fading: Integer,

            //CurWav: Array, // [0..Chs-1] of Integer,
            //L2WL: Array, // [0..Chs-1] of Integer,
            // log 2 WaveLength
            PCMW: Array, // [0..PCMWavs-1] of TWavLoader,

            Delay: Integer,

            Tempo: Integer,
            ComStr: String,
            WFilename: String,

            EnvDat: Array, // [0..Envs-1,0..EnvElC-1] of Byte,

            WriteMaxLen: Integer,
            //soundMode: Array // [0..chs-1] of Boolean,
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
                t.channels[i].MPoint=chdata;
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
        },
        setNoiseWDT: function (t) {
            // Noise
            for (var j=0;j<1024;j++) {
                t.WaveDat[WvC-1][j]=Math.floor(Math.random() * 78 + 90);
            }
        },
        loadWDT: function (t,url) {
            return new Promise(function (succ,fail) {
            try{
                console.log("LOading wdt...?");
                if (!url) {
                    requirejs(["Tones.wdt"],function (u) {
                        t.loadWDT(u).then(succ,fail);
                    });
                }
                var oReq = new XMLHttpRequest();
                oReq.open("GET", url, true);
                oReq.responseType = "arraybuffer";
                oReq.onload = function (oEvent) {
                    var arrayBuffer = oReq.response,i,j;
                    if (arrayBuffer) {
                        var b = new Uint8Array(arrayBuffer);
                        console.log("Loading wdt",b.length);
                        //WaveDat
                        var idx=0;
                        for (i = 0; i < WvC; i++) {
                            for (j=0;j<32;j++) {
                                t.WaveDat[i][j]=b[idx++];
                            }
                        }
                        t.setNoiseWDT();
                        //EnvDat
                        for (i=0 ;i<16;i++) {//Envs
                            for (j=0;j<32;j++) {
                                t.EnvDat[i][j]=b[idx++];
                            }
                        }
                        console.log("Loading wdt done");
                        succ();
                    }
                };
                oReq.send(null);
            } catch(e) {fail(e);}
            });
        },
        getPlayPos: function () {
            var ti=this.context.currentTime- this. playStartTime;
            var tiSamples=Math.floor(ti*this.sampleRate);
            return tiSamples % wdataSize;
        },
        setSound: function(t, ch /*:Integer;*/ , typ /*:Integer;*/ , val /*:Integer*/ ) {
            var chn=t.channels[ch];
            chn.soundMode = True;
            switch (typ) {
                case stFreq:
                    chn.Steps = val;
                    break;
                case stVol:
                    chn.EVol = val;
                    break;
            }
        },
        InitSin: function(t) {
            var i; //:Integer;
            for (i = 0; i < sinMax; i++) {
                sinT[i] = Math.trunc(Math.sin(3.1415926 * 2 * i / sinMax) * 127);
            }
        },
        InitEnv: function(t) {
            var i, j; //:Integer;
            t.EnvDat=[];
            for (i = 0; i < Envs; i++) {
                t.EnvDat[i]=[];
                for (j = 0; j < EnvElC; j++) {
                    t.EnvDat[i][j] = Math.floor((EnvElC - 1 - j) / 2);
                }
            }
        },
        ConvM2T: function(t) {
            var i; //:Integer;
            m2tInt=[];
            for (i = 0; i < 96; i++) {
                m2tInt[i] = Math.trunc(DivClock * 65536 / m2t[i] * 65536 / t.sampleRate);
            }
        },
        InitWave: function(t) {
            var i, j;
            t.WaveDat=[];
            for (i = 0; i < WvC; i++) {
                t.WaveDat[i]=[];
                for (j = 0; j < WvElC / 2; j++) {
                    t.WaveDat[i][j] = 103;
                    t.WaveDat[i][j + div(WvElC, 2)] = 153;
                }
            }
        },

        $: function(t,context,options) {
            var i, j; //:Integer;
            options=options||{};
            t.useScriptProcessor=options.useScriptProcessor;
            t.useFast=options.useFast;
            t.resolution=options.resolution||120;
            t.wavOutSpeed=options.wavOutSpeed||10;
            t.context=context;
            t.sampleRate = t.context.sampleRate;
            //t.initNode({});
            //t.WavPlaying=false;
            // inherited Create (Handle);
            t.Delay = 2000;
            t.Pos = t.PrevPos = t.RPos = /*t.WriteAd =*/ t.SeqTime =
            t.SeqTime120 = 0;
            t.BeginPlay=false;
            t.InitWave();
            t.InitEnv();
            t.InitSin();
            t.ConvM2T();
            t.wdata2=[];
            t.PCMW=[];
            //t.L2WL=[];
            //t.Sync=[];
            //t.ECount=[];
            //t.MCount=[];
            for (i = 0; i < PCMWavs; i++) {
                t.PCMW[i] = nil;
            }
            //t.Steps = [];
            //t.SccWave = [];
            //t.SccCount = [];
            //t.EShape = []; //=t.EnvDat[0];
            //t.EVol = [];
            //t.EBaseVol = [];
            //t.MPoint = [];
            //t.MPointC = [];
            //t.ESpeed = [];
            //t.PlayState = [];
            //t.Detune = [];
            //t.LfoV = [];
            //t.LfoD = [];
            //t.LfoDC = [];
            //t.PorStart=[];
            //t.PorEnd=[];
            //t.PorLen=[];
            //t.soundMode = [];
            //t.CurWav=[];
            //t.Oct=[];
            //t.Resting=[];
            //t.Slur=[];
            //t.Sync=[];
            //t.LfoV=[];t.LfoA=[];t.LfoC=[];t.LfoD=[];t.LfoDC=[];t.LfoSync=[];
            t.channels=[];
            for (i = 0; i < Chs; i++) {
                t.channels.push({});
                t.channels[i].LfoV=0;t.channels[i].LfoA=0;t.channels[i].LfoC=0;t.channels[i].LfoD=0;t.channels[i].LfoDC=0;t.channels[i].LfoSync=0;
                t.channels[i].Slur=t.channels[i].Sync=0;
                t.channels[i].PorStart=t.channels[i].PorEnd=t.channels[i].PorLen=0;
                t.channels[i].ECount=0;
                t.channels[i].MCount=0;
                t.channels[i].Resting=0;
                t.channels[i].Steps = 0;
                t.channels[i].SccWave = t.WaveDat[0];
                t.channels[i].SccCount = 0;
                t.channels[i].EShape = t.EnvDat[0];
                t.channels[i].EVol = 0;
                t.channels[i].EBaseVol = 128;
                t.channels[i].MPoint = nil;
                t.channels[i].MPointC = 0;
                t.channels[i].ESpeed = 5;
                t.channels[i].PlayState = psStop;
                t.channels[i].Detune = 0;
                t.channels[i].LfoV = 0;
                t.SelWav(i, 0);
                t.channels[i].LfoD = 0;
                t.channels[i].LfoDC = 0;
                t.channels[i].Oct = 4;
                t.channels[i].soundMode = False;
            }
            t.Fading = FadeMax;
            t.timeLag = 2000;

            t.WriteMaxLen = 20000;
            t.WavOutMode = False;
            t.label2Time=[];
            t.PC2Time=[];// only ch:0
            t.WFilename = '';
            /* {$ifdef ForM2}
            t.WavOutObj=nil;
             {$endif}*/
            t.Tempo = 120;
            t.ComStr = '';
            t.performance={writtenSamples:0, elapsedTime:0, timeForChProc:0, timeForWrtSmpl:0};
            //t.loadWDT();
        },
        getBuffer: function (t) {
            var channel=1;
            if (this.buf) return this.buf;
            this.buf = this.context.createBuffer(channel, wdataSize, this.sampleRate);
            return this.buf;
        },
        playNode: function (t) {
            if (this.isSrcPlaying) return;
            var source = this.context.createBufferSource();
            // AudioBufferSourceNodeにバッファを設定する
            source.buffer = this.getBuffer();
            // AudioBufferSourceNodeを出力先に接続すると音声が聞こえるようになる
            if (typeof source.noteOn=="function") {
                source.noteOn(0);
                //source.connect(this.node);
            }
            source.connect(this.context.destination);
            // 音源の再生を始める
            source.start();
            source.loop = true;
            source.playStartTime = this.playStartTime = this.context.currentTime;
            this.bufSrc=source;
            this.isSrcPlaying = true;
        },
        startRefreshLoop: function (t) {
            if (t.refreshTimer!=null) return;
            var grid=t.resolution;
            var data=t.getBuffer().getChannelData(0);
            var WriteAd=0;
            for (var i=0;i<wdataSize;i+=grid) {
                t.refreshPSG(data,i,grid);
            }
            function refresh() {
                if (!t.isSrcPlaying) return;
                var cnt=0;
                var playPosZone=Math.floor(t.getPlayPos()/grid);
                while (true) {
                    if (cnt++>wdataSize/grid) throw new Error("Mugen "+playPosZone);
                    var writeAdZone=Math.floor(WriteAd/grid);
                    if (playPosZone===writeAdZone) break;
                    t.refreshPSG(data,WriteAd,grid);
                    WriteAd=(WriteAd+grid)%wdataSize;
                }
            }
            t.refreshTimer=setInterval(refresh,16);
        },
        stopRefreshLoop: function (t) {
            if (t.refreshTimer==null) return;
            clearInterval(t.refreshTimer);
            delete t.refreshTimer;
        },
        stopNode : function (t) {
            if (!this.isSrcPlaying) return;
            this.bufSrc.stop();
            this.isSrcPlaying = false;
        },
        Play1Sound: function(t, c, n, iss) {
            var TP; //:Integer;
            var chn=t.channels[c];
            if (chn.soundMode) return; // ) return;
            if (n == MRest) {
                chn.Resting = True;
                return;
            }
            if ((c < 0) || (c >= Chs) || (n < 0) || (n > 95)) return; // ) return;
            chn.Resting = False;
            if (!iss) {
                chn.ECount = 0;
                if (chn.Sync) chn.SccCount = 0;
                if (chn.LfoSync != LASync) chn.LfoC = 0;
            }
            if (chn.CurWav < WvC) {
                chn.Steps = m2tInt[n] + chn.Detune * div(m2tInt[n], 2048);
                if (chn.CurWav===WvC-1) {// Noise
                    chn.Steps >>>= 5;//  32->1024
                }
                // m2tInt*(1+Detune/xx)    (1+256/xx )^12 =2  1+256/xx=1.05946
                //    256/xx=0.05946   xx=256/0.05946  = 4096?
            } else {
                if (chn.L2WL >= 2) {
                    //Steps[c]:=($40000000 shr (L2WL[c]-2)) div (m2tInt[36] div 65536) * (m2tInt[n] div 65536);
                    chn.Steps = div(0x40000000 >>> (chn.L2WL - 2), div(m2tInt[36], 65536)) * div(m2tInt[n], 65536);
                }
            }
            chn.PorLen = -1;
        },
        //    procedure TEnveloper.Play1Por (c,f,t:Word;iss:Boolean);
        Play1Por: function (t,c,from,to,iss) {
             var TP=0;
             var chn=t.channels[c];
             if ((c<0)  ||  (c>=Chs)  ||  (to<0)  ||  (to>95) ||
                (from<0)  ||  (from>95) ) return;
             chn.Resting=False;

             //TP=m2t[f];
             chn.PorStart=m2tInt[from]+chn.Detune*div(m2tInt[from] , 2048);//Trunc (DivClock/TP*65536/t.sampleRate)+Detune[c];
             //TP=m2t[to];
             chn.PorEnd=m2tInt[to]+chn.Detune*div(m2tInt[to] , 2048);//Trunc (DivClock/TP*65536/t.sampleRate)+Detune[c];
             // Noise
             if (chn.CurWav===WvC-1) {
                 chn.PorStart >>>= 5;//  32->1024
                 chn.PorEnd >>>= 5;//  32->1024
             }
             if  (!iss) chn.ECount=0;

        },
        StopMML: function(t, c) {
            if ((c < 0) || (c >= Chs)) return; // ) return;
            //MPoint[c]=nil;
            t.WaitMML(c);
            t.channels[c].PlayState = psStop;
            t.channels[c].MCount = t.SeqTime + 1;
        },
        allWaiting: function (t) {
            for(var i=0;i<Chs;i++) {
                if (t.channels[i].PlayState == psPlay) {
                    return false;
                }
            }
            return true;
        },
        handleAllState: function (t) {
            var allWait=true,allStop=true,i;
            for(i=0;i<Chs;i++) {
                switch (t.channels[i].PlayState) {
                case psPlay:
                    allWait=false;
                    allStop=false;
                    break;
                case psWait:
                    allStop=false;
                    break;
                }
            }
            //          alw     als
            // P        F       F
            // W        T       F
            // S        T       T
            // P,W      F       F
            // W,S      T       F
            // S,P      F       F
            // P,W,S    F       F
            if (allWait && !allStop) {
                for(i=0;i<Chs;i++) {
                    t.RestartMML(i);
                }
            }
            return allStop;
        },
        allStopped: function (t) {
            for(var i=0;i<Chs;i++) {
                if (t.channels[i].PlayState != psStop) {
                    return false;
                }
            }
            return true;
        },
        RestartMML: function(t, c) {
            if ((c < 0) || (c >= Chs)) return;
            var chn=t.channels[c];
            if (chn.PlayState == psWait) {
                chn.PlayState = psPlay;
                chn.MCount = t.SeqTime + 1;
            }
        },
        restartIfAllWaiting: function (t) {
            if (t.allWaiting()) {
                for(var i=0;i<Chs;i++) {
                    t.RestartMML(i);
                }
            }
        },
        //procedure TEnveloper.WaitMML (c:Integer);
        WaitMML: function(t, c) {
            var i; //:Integer;
            if ((c < 0) || (c >= Chs)) return;
            //MPoint[c]=nil;
            var chn=t.channels[c];
            chn.PlayState = psWait;
            chn.MCount = t.SeqTime + 1;
        },
        //procedure TEnveloper.Start;
        Start: function(t) {
            t.Stop();
            t.Rewind();
            t.BeginPlay = True;
            t.startRefreshLoop();
            t.playNode();
        },
        Rewind: function (t) {
            var ch; //:Integer;
            t.SeqTime=0;
            for (ch = 0; ch < Chs; ch++) {
                var chn=t.channels[ch];
                chn.soundMode = False;
                chn.MPointC = 0;
                chn.PlayState = psPlay;
                chn.MCount = t.SeqTime;
            }
        },
        Stop: function (t) {
            if (!t.BeginPlay) return;
            t.stopNode();
            t.stopRefreshLoop();
        },
        wavOut: function (t) {
            t.Stop();
            t.Rewind();
            var buf=[];
            var grid=t.resolution;
            for (var i=0;i<grid;i++) buf.push(0);
            var allbuf=[];
            t.writtenSamples=0;
            t.WavOutMode=true;
            t.label2Time=[];
            t.loopStart=null;
            t.loopStartFrac=null;
            t.PC2Time=[];// only ch:0
            var sec=-1;
            var efficiency=t.wavOutSpeed||10;
            var setT=0;
            return new Promise(function (succ) {
                    while (true) {
                        for (var i=0;i<grid;i++) allbuf.push(0);
                        t.refreshPSG(allbuf,allbuf.length-grid,grid);
                        t.writtenSamples+=grid;
                        var ss=Math.floor(t.writtenSamples/t.sampleRate);
                        if (ss>sec) {
                            //console.log("Written ",ss,"sec");
                            sec=ss;
                        }
                        //allbuf=allbuf.concat(buf.slice());
                        if (t.allStopped()) {
                            t.WavOutMode=false;
                            succ(allbuf);
                            //console.log("setT",setT);
                            console.log(t.performance);
                            return;
                        }
                    }
            });
        },
        toAudioBuffer: function (t) {
            return t.wavOut().then(function (arysrc) {
                var buffer = t.context.createBuffer(1, arysrc.length, t.sampleRate);
                var ary = buffer.getChannelData(0);
                for (var i = 0; i < ary.length; i++) {
                     ary[i] = arysrc[i];
                }
                var res={decodedData: buffer};
                if (t.loopStartFrac) res.loopStart=t.loopStartFrac[0]/t.loopStartFrac[1];
                return res;
            });
        },
        //procedure TEnveloper.SelWav (ch,n:Integer);
        SelWav: function(t, ch, n) {
            var chn=t.channels[ch];
            chn.CurWav = n;
            if (n < WvC) {
                chn.SccWave = t.WaveDat[n];
                chn.L2WL = 5;
                // Noise
                if (n===WvC-1) chn.L2WL=10;
                chn.Sync = False;
            } else {
                if (t.PCMW[n - WvC] != nil) {
                    chn.SccWave = t.PCMW[n - WvC].Start;
                    chn.L2WL = t.PCMW[n - WvC].Log2Len;
                    chn.Sync = True;
                }
            }
        },
        RegPCM: function (t,fn, n) {
            console.log("[STUB]regpcm",fn.map(function (e) {return String.fromCharCode(e);}),n);
        },
        /*
        procedure TEnveloper.RegPCM (fn:string;n:Integer);
        var i:Integer;
            wl,wl2:TWavLoader;
        {
             if ( ! FileExists(fn) ) {
                fn=ExtractFilePath (ParamStr(0))+'\\'+fn;
                if ( ! FileExists(fn) ) return;
             }
             for ( i=0 to Chs-1 )
                 if ( CurWav[i]==n ) SelWav(i,0);
             wl=TWavLoader.Create (fn);IncGar;
             if ( ! wl.isError ) {
                if ( PCMW[n-WvC]!=nil ) {
                   PCMW[n-WvC].Free; DecGar;
                }
                wl2=TWavLoader.Clone (TObject(wl));  IncGar;
                PCMW[n-WvC]=wl2;
             }
             wl.Free;   DecGar;

        }
        */
        refreshPSG: function(t,data,WriteAd,length) {
            var i, ch, WaveMod, WriteBytes, wdtmp, inext, mid, w1, w2, //:integer;
                TP = [],
                vCenter = [], //:array [0..Chs-1] of Integer;
                //Steps:array [0..Chs-1] of Integer;
                Lambda, NewLambda, //:Real;
                res, //:MMRESULT;
                WriteTwice, //:Boolean;
                WriteMax, //:integer;
                nowt, //:longint;
                // AllVCenter:Integer;
                Wf=0, Wt=0, WMid=0, WRes=0, WSum=0, v=0, NoiseP=0, Tmporc=0, //:Integer;
                LParam, HParam, WParam, //:Byte;
                JmpSafe, //:Integer;
                se; //:^TSoundElem;

            cnt++;

            var mcountK=t.sampleRate / 22050;
            var tempoK=44100 / t.sampleRate ;
            var startTime=new Date().getTime();
            if (t.allStopped()) {
                for (i=WriteAd; i<=WriteAd+length; i++) {
                    data[i]=0;
                }
                return;
            }
            var vv=[],SeqTime=t.SeqTime,lpchk=0,chn;
            var chPT=now();
            for (ch = 0; ch < Chs; ch++) {
                chn=t.channels[ch];
                if (chn.MPoint[chn.MPointC] == nil) t.StopMML(ch);
                if (chn.PlayState != psPlay) continue;
                if (chn.PorLen > 0) {
                    Tmporc = chn.MCount - SeqTime;
                    chn.Steps = (
                        div(chn.PorStart, chn.PorLen) * Tmporc +
                        div(chn.PorEnd, chn.PorLen * (chn.PorLen - Tmporc))
                    );
                }
                if ((chn.soundMode))
                    v = chn.EVol;
                else if ((chn.Resting))
                    v = 0;
                else
                    v = chn.EShape[chn.ECount >>> 11] * chn.EVol * chn.EBaseVol; // 16bit
                if (t.Fading < FadeMax) {
                    v = v * div(t.Fading, FadeMax); // 16bit
                }
                vv[ch]=v;
                if (chn.ECount + chn.ESpeed*(length/2) < 65536 ) chn.ECount += chn.ESpeed*(length/2);

                JmpSafe = 0;

                while (chn.MCount <= SeqTime) {
                    var pc = chn.MPointC;
                    if (ch==0) t.PC2Time[pc]=t.writtenSamples;
                    LParam = chn.MPoint[pc + 1];
                    HParam = chn.MPoint[pc + 2];
                    var code = chn.MPoint[pc];
                    if (code >= 0 && code < 96 || code === MRest) {
                        t.Play1Sound(ch, code, chn.Slur);
                        if (!chn.Slur) chn.LfoDC = chn.LfoD;
                        chn.Slur = False;
                        chn.MCount +=
                            (LParam + HParam * 256) * 2;
                        // SPS=22050の場合 *2 を *1 に。
                        // SPS=x の場合   * (x/22050)
                        chn.MPointC += 3;
                    } else switch (code) {
                        case MPor:
                             t.Play1Por (ch,
                               LParam,
                               HParam,
                               chn.Slur
                             );
                             chn.Slur=False;
                             chn.MCount+=
                             ( chn.MPoint[pc + 3]+chn.MPoint[pc + 4]*256 )*2;
                            // SPS=22050の場合 *2 を *1 に。
                             chn.PorLen=chn.MCount-SeqTime;
                             chn.MPointC+=5;
                        break;
                        case MTempo:
                            t.Tempo = LParam + HParam * 256;
                            chn.MPointC += 3;
                            break;
                        case MVol:
                            chn.EVol = LParam;
                            chn.MPointC += 2;
                            break;
                        case MBaseVol:
                            chn.EBaseVol = LParam;
                            chn.MPointC += 2;
                            break;
                        case Mps:
                            chn.ESpeed = LParam;
                            chn.MPointC += 2;
                            break;
                        case MSelWav:
                            t.SelWav(ch, LParam);
                            chn.MPointC += 2;
                            break;
                        case MWrtWav:
                            chn.MPointC += 34; // MWrtWav wavno data*32
                            for (i = 0; i < 32; i++) {
                                t.WaveDat[LParam][i] = chn.MPoint[pc + 2 + i];
                            }
                            break;
                        case MSelEnv:
                            chn.EShape = t.EnvDat[LParam];
                            chn.MPointC += 2;
                            break;
                        case MWrtEnv:
                            // MWrtEnv envno data*32
                            chn.MPointC += 34;
                            for (i = 0; i < 32; i++) {
                                wdtmp = chn.MPoint[pc + 2 + i];
                                if (wdtmp > 15) wdtmp = 15;
                                t.EnvDat[LParam][i] = wdtmp;
                            }
                            break;
                        case MJmp:
                            if (t.WavOutMode) {
                                if (ch==0) {
                                    var dstLabelPos=chn.MPointC + array2Int(chn.MPoint, pc+1);
                                    //var dstLabelNum=chn.MPoint[dstLabelPos+1];
                                    var dstTime=t.PC2Time[dstLabelPos];// t.label2Time[dstLabelNum-0];
                                    if (typeof dstTime=="number" && dstTime<t.writtenSamples) {
                                        t.loopStartFrac=[dstTime, t.sampleRate];
                                        console.log("@jump", "ofs=",t.loopStartFrac );
                                    }
                                }
                                chn.MPointC += 5;
                            } else {
                                chn.MPointC += array2Int(chn.MPoint, pc+1);
                            }
                            JmpSafe++;
                            if (JmpSafe > 1) {
                                console.log("Jumpsafe!");
                                t.StopMML(ch);
                                chn.MCount = SeqTime + 1;
                            }
                            break;
                        case MLabel:
                            if (t.WavOutMode && ch==0) {
                                t.label2Time[LParam]=[t.writtenSamples,t.sampleRate];
                                console.log("@label", LParam , chn.MPointC , t.writtenSamples+"/"+t.sampleRate );
                            }
                            chn.MPointC+=2;
                            break;
                        case MSlur:
                            chn.Slur = True;
                            chn.MPointC += 1;
                            break;
                        case MWait:
                            t.WaitMML(ch);
                            chn.MPointC += 1;
                            break;
                        case MCom:
                            t.ComStr = StrPas(chn.MPoint, pc + 1);
                            chn.MPointC += t.ComStr.length + 2; // opcode str \0
                            break;
                        case MWOut:
                            t.WFilename = StrPas(chn.MPoint, pc + 1);
                            chn.MPointC += t.WFilename.length + 2; // opcode str \0
                            break;
                        case MWEnd:
                            chn.MPointC += 1;
                            break;
                        case MDet:
                            chn.Detune = ShortInt(LParam);
                            chn.MPointC += 2;
                            break;
                        case MLfo:
                            chn.LfoSync = (LParam);
                            chn.LfoV = (HParam) * 65536;
                            chn.LfoA = (chn.MPoint[pc + 3]);
                            chn.LfoD = 0;
                            chn.MPointC += 4;
                            break;
                        case MLfoD:
                            chn.LfoD = LParam * t.sampleRate;
                            chn.MPointC += 2;
                            break;
                        case MSync:
                            chn.Sync = (LParam == 1);
                            chn.MPointC += 2;
                            break;
                        case MPCMReg:
                            var fn=StrPas(chn.MPoint, pc+1);
                            t.RegPCM (fn,chn.MPoint[pc+1+fn.length+1]);
                            chn.MPointC+=fn.length +3;
                            break;
                        case Mend:
                            t.StopMML(ch); //MPoint[ch]=nil;
                            break;
                        default:
                            t.StopMML(ch);
                            throw new Error("Invalid opcode" + code);
                            //chn.MPointC += 1;
                    }
                }
                // End Of MMLProc
            }
            t.handleAllState();
            t.SeqTime+= Math.floor( t.Tempo * (length/120) * tempoK );
            for (var ad=WriteAd; ad<WriteAd+length; ad++) {
                data[ad]=0;
            }
            var wrtsT=now();
            t.performance.timeForChProc+=wrtsT-chPT;
            var noiseWritten=false;
            for (ch = 0; ch < Chs; ch++) {
                chn=t.channels[ch];
                if (chn.PlayState != psPlay) continue;
                v=vv[ch];
                if (v<=0) continue;
                var SccCount=chn.SccCount,Steps=chn.Steps,SccWave=chn.SccWave,sh=(32-chn.L2WL);
                // Proc LFO here!
                // Sync(for PCM playback) is separeted?
                for (ad=WriteAd; ad<WriteAd+length; ad++) {
                    WSum = data[ad];
                    w1 = SccWave[SccCount >>> sh];
                    WSum += (
                        (w1 * v)/ 0x4000000
                    ) - (v / 0x80000);
                    SccCount += Steps;
                    data[ad]=WSum;
                    /*if (!noiseWritten) {
                        t.WaveDat[95][NoiseP & 31] = Math.floor(Math.random() * 78 + 90);
                    }
                    NoiseP++;*/
                }
                chn.SccCount=SccCount >>> 0;
                //noiseWritten=true;
                //bufferState.writtenSamples+=length;


            }// of ch loop
            t.setNoiseWDT();// Longer?
            t.performance.timeForWrtSmpl+=now()-wrtsT;
            t.performance.elapsedTime+=new Date().getTime()-startTime;
            t.performance.writtenSamples+=length;
            t.performance.writeRate=t.performance.writtenSamples/(t.performance.elapsedTime/1000*t.sampleRate);
            //--------------|---------------------------
            //             playpos  LS            LE
            //                       +-------------+

        }// of refreshPSG
    }); // of Klass.define
    var undefs={};
    function replf(_,name) {
        //console.log(name);
        if (!defs.$fields[name]) {
            if (undefs[name]==null) undefs[name]=1;
            //console.error("Undefined ",name);
        }
    }
    for(var k in defs) {
        var fldreg=/\bt\s*\.\s*([a-zA-Z0-9]+)\b/g;
        if (typeof defs[k]==="function") {
            var src=defs[k]+"";
            var r=src.replace(fldreg, replf);
            undefs[k]=0;
        }
    }
    console.log(undefs);
    return TEnveloper;
}); // of requirejs.define
