/* global requirejs,OfflineAudioContext */
define("SEnv", ["Klass", "assert","promise","Tones.wdt"], function(Klass, assert,_,WDT) {
    function now(){return new Date().getTime();}
    function WDT2Float(w) {return w/128-1;}
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
        MWrtWav2 =121,

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
            return Math.floor(x/y);
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
        log2=function (len) {
            let c=0;
            // 1->1   2->2    4->3
            while(len>0) {
                len>>=1;
                c++;
            }
            return c-1;
        },
        Integer = Number,
        sinMax_s = 5,
        sinMax = 65536 >> sinMax_s, //2048,
        SPS = 44100,
        SPS96 = 22080,
        SPS_60 = div(44100, 60),
        DU_SEQ="DU_SEQ", DU_TRK="DU_TRK", DU_CTX="DU_CTX",// time delta units
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
        //Trunc = Math.trunc.bind(),
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
        cnt=0; //:Integer;// debug
    function defaultBufferTime() {
        if (window.navigator.userAgent.match(/Android/)) {
            return 1/2;
        }
        return 1/30;
    }
    var defs;
    var TEnveloper = Klass.define(defs={ //class (TSoundGenerator)
        $this: true,
        $fields: {
            //BSize: Integer,
            Pos: Integer,
            PrevPos: Integer,
            RPos: Integer,
            WaveDat: Array, // [0..WvC-1,0..WvElC-1] of Byte;
            wdata2: Array,//array[0..wdataSize-1] of SmallInt;

            BeginPlay: Boolean,
            SeqTime: Integer,
            SeqTime120: Integer,

            wavoutContext: Boolean,
            //LFOsync=0:非同期、1:同期、2:ワンショット 3:鋸波形
            Fading: Integer,

            //L2WL: log 2 WaveLength
            PCMW: Array, // [0..PCMWavs-1] of TWavLoader,

            //Delay: Integer,

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
                t.WaveDat[WvC-1][j]=WDT2Float( Math.floor(Math.random() * 78 + 90) );
            }
            t.WaveDat[WvC-1].lambda=32;
        },
        loadWDT: function (t,url) {
            return new Promise(function (succ,fail) {
            try{
                //console.log("LOading wdt...?");
                if (!url) {
                    /*requirejs(["Tones.wdt"],function (u) {
                        t.loadWDT(u).then(succ,fail);
                    });*/
                    url=WDT;
                }
                var oReq = new XMLHttpRequest();
                oReq.open("GET", url, true);
                oReq.responseType = "arraybuffer";
                oReq.onload = function (oEvent) {
                    var arrayBuffer = oReq.response,i,j;
                    if (arrayBuffer) {
                        var b = new Uint8Array(arrayBuffer);
                        //console.log("Loading wdt",b.length);
                        //WaveDat
                        var idx=0;
                        for (i = 0; i < WvC; i++) {
                            for (j=0;j<32;j++) {
                                t.WaveDat[i][j]=WDT2Float( b[idx++] );
                            }
                        }
                        t.setNoiseWDT();
                        //EnvDat
                        for (i=0 ;i<16;i++) {//Envs
                            for (j=0;j<32;j++) {
                                t.EnvDat[i][j]=b[idx++];
                            }
                        }
                        //console.log("Loading wdt done");
                        succ();
                    }
                };
                oReq.send(null);
            } catch(e) {fail(e);}
            });
        },
        /*getPlayPos: function (t) {
            var ti=this.context.currentTime- this. playStartTime;
            var tiSamples=Math.floor(ti*this.sampleRate);
            return tiSamples % wdataSize;
        },*/
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
                sinT[i] = Math.floor(Math.sin(3.1415926 * 2 * i / sinMax) * 127);
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
                m2tInt[i] = Math.floor(DivClock * 65536 / m2t[i] * 65536 / t.sampleRate);
            }
        },
        InitWave: function(t) {
            var i, j;
            t.WaveDat=[];
            for (i = 0; i < WvC; i++) {
                t.WaveDat[i]=[];
                for (j = 0; j < WvElC / 2; j++) {
                    t.WaveDat[i][j] = WDT2Float(103);
                    t.WaveDat[i][j + div(WvElC, 2)] = WDT2Float(153);
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
            t.sampleRate = chkn(t.context.sampleRate,"t.context.sampleRate");
            //t.initNode({});
            //t.WavPlaying=false;
            // inherited Create (Handle);
            //t.Delay = 2000;
            t.Pos = t.PrevPos = t.RPos = /*t.WriteAd =*/ t.SeqTime =
            t.SeqTime120 = 0;
            t.BeginPlay=false;
            t.InitWave();
            t.waveBuffers={};
            t.InitEnv();
            t.InitSin();
            t.ConvM2T();
            t.wdata2=[];
            t.PCMW=[];
            for (i = 0; i < PCMWavs; i++) {
                t.PCMW[i] = nil;
            }
            t.channels=[];
            for (i = 0; i < Chs; i++) {
                t.channels.push({});
            }
            t.resetChannelStates();
            t.Fading = FadeMax;
            //t.timeLag = 2000;

            t.WriteMaxLen = 20000;
            t.wavoutContext = False;
            t.WFilename = '';
            /* {$ifdef ForM2}
            t.WavOutObj=nil;
             {$endif}*/
            t.ComStr = '';
            t.bufferTime=options.bufferTime || defaultBufferTime();
            t.performance={timeForChProc:0, timeForWrtSmpl:0};
            if (options.source) {
                for (i=0;i<Chs;i++) {
                    t.channels[i].MPoint=options.source.chdata[i];
                }
            }
            if (options.WaveDat) t.WaveDat=options.WaveDat;
            if (options.EnvDat) t.EnvDat=options.EnvDat;

            //t.loadWDT();
        },
        resetChannelStates: function (t) {
            for (var i = 0; i < Chs; i++) {
                var chn=t.channels[i];
                chn.LfoV=0;chn.LfoA=0;chn.LfoC=0;chn.LfoD=0;chn.LfoDC=0;chn.LfoSync=0;
                chn.Slur=chn.Sync=0;
                chn.PorStart=chn.PorEnd=chn.PorLen=0;
                chn.ECount=0;
                chn.MCount=0;
                chn.Resting=0;
                chn.Steps = 0;
                chn.CurWav=0;
                chn.SccWave = t.WaveDat[chn.CurWav];
                chn.SccCount = 0;
                chn.CurEnv=0;
                chn.EShape = t.EnvDat[chn.CurEnv];
                chn.EVol = 0;
                chn.EBaseVol = 128;
                chn.MPointC = 0;
                chn.ESpeed = 5;
                chn.PlayState = psStop;
                chn.Detune = 0;
                chn.LfoV = 0;
                t.SelWav(i, 0);
                chn.LfoD = 0;
                chn.LfoDC = 0;
                chn.Oct = 4;
                chn.soundMode = False;
            }
            t.Tempo = 120;// changed by MML t***
            t.rate = 1; // changed by setRate
        },
        setRate:function(t,r) {
            t.rate=r;
        },
        setVolume: function (t,v) {
            if (t.masterGain) t.masterGain.gain.value=v;
        },
        /*
        getBuffer: function (t) {
            var channel=1;
            if (this.buf) return this.buf;
            this.buf = this.context.createBuffer(channel, wdataSize, this.sampleRate);
            return this.buf;
        },*/
        playNode: function (t, options) {
            if (this.isSrcPlaying) return;
            options=options||{};
            t.masterGain=t.context.createGain();
            t.masterGain.connect(t.context.destination);
            for (var i=0;i<Chs;i++) {
                var chn=t.channels[i];
                chn.gainNode=t.context.createGain();
                chn.gainNode.connect(t.masterGain);
            }
            if (typeof options.volume==="number") t.setVolume(options.volume);
            this.isSrcPlaying = true;
        },
        startRefreshLoop: function (t) {
            if (t.refreshTimer!=null) return;
            t.refreshPSG();
            t.refreshTimer=t.Mezonet.setInterval(t.refreshPSG.bind(t),5);
            /*var grid=t.resolution;
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
            t.refreshTimer=setInterval(refresh,16);*/
        },
        stopRefreshLoop: function (t) {
            if (t.refreshTimer==null) return;
            t.Mezonet.clearInterval(t.refreshTimer);
            delete t.refreshTimer;
        },
        stopNode : function (t) {
            if (!this.isSrcPlaying) return;
            //this.bufSrc.stop();
            for (var i=0;i<Chs;i++) {
                var chn=t.channels[i];
                if (chn.gainNode) chn.gainNode.disconnect();
            }
            t.masterGain.disconnect();
            this.isSrcPlaying = false;
        },
        getWaveBuffer: function (t,n) {
            if (t.waveBuffers[n]) return t.waveBuffers[n];
            var dat=t.WaveDat[n];
            if (!dat) return;
            var mult=3;
            var buflen=dat.length << mult ;
            var res=t.context.createBuffer(1,buflen, t.sampleRate);
            var chd=res.getChannelData(0);
            for (var i=0;i<buflen;i++) {
                chd[i]=dat[i >> mult];
            }
            t.waveBuffers[n]=res;
            if (dat.lambda) res.lambda=dat.lambda << mult;
            return res;
        },
        Play1Sound: function(t, c, n, iss, noteOnInCtx,noteOffInCtx,por) {
            // ESpeed == psX
            // ESpeed / 65536*SPS
            if (t.wavoutContext) return;
            var TP; //:Integer;
            var chn=t.channels[c];
            //if (chn.soundMode) return; // ) return;
            if (n == MRest) {
                chn.Resting = True;
                return;
            }
            if ((c < 0) || (c >= Chs) || (n < 0) || (n > 95)) return; // ) return;
            chn.Resting = False;
            var buf=t.getWaveBuffer(chn.CurWav);
            if (!buf) return;
            var buflen=buf.getChannelData(0).length;
            var lambda=buf.lambda||buflen;
            var steps=m2tInt[n] + chn.Detune * div(m2tInt[n], 2048);
            var SccCount_MAX=0x100000000;
            var source=chn.sourceNode;
            if (!iss|| !source) {
                source=t.context.createBufferSource();
                source.buffer=buf;
                source.loop=true;
                source.start = source.start || source.noteOn;
                source.stop = source.stop || source.noteOff;
                source.playbackRate.value=(steps/SccCount_MAX)*lambda;
                source.connect(chn.gainNode);
                source.start(noteOnInCtx);
                source.stop(noteOffInCtx);
                chn.sourceNode=source;
            }
            //console.log(source.playbackRate.value, noteOnInCtx, noteOffInCtx);
            //source.playbackRate.value=freq*lambda/sampleRate;  in test.html
            //                         =freq/sampleRate*lambda
            //                         =steps/SccCount_MAX*lambda
            //  steps*sampleRate= SccCount_MAX*freq
            //  steps/SccCount_MAX= freq/sampleRate
            //   ^v^v^v^.....v^
            //    x100          in sampleRate
            if (!iss || !chn.envelopeState) {
                chn.envelopeState={
                    lengthInCtx:1/ (chn.ESpeed / 65536*SPS/2) ,
                    Shape:t.EnvDat[chn.CurEnv],
                    //console.log(env.length);
                    setTimeInCtx:noteOnInCtx,
                    idx:0
                };
            }
            var es=chn.envelopeState;
            for (;es.idx<es.Shape.length;es.idx++) {
                var i=es.idx;
                //if (i==0) console.log(env[i]/128, noteOnInCtx+i/env.length*envLenInCtx);
                if (es.setTimeInCtx>=noteOffInCtx) break;
                var value=es.Shape[i]/16*chn.EVol/128*chn.EBaseVol/128;
                if (value>=0 && value<=1 ) {
                    chn.gainNode.gain.setValueAtTime(value, es.setTimeInCtx);
                } else {
                    console.error(es, value, chn.EVol, chn.EBaseVol);//chn.EVol/128*chn.EBaseVol/128);
                }
                es.setTimeInCtx+=es.lengthInCtx/es.Shape.length;
            }
            var pitch=1/60;
            if (por) {
                var PorEnd=m2tInt[por]+chn.Detune*div(m2tInt[por] , 2048);
                var rateEnd=(PorEnd/SccCount_MAX)*lambda;
                var rateStart=source.playbackRate.value;
                for (var porTime=noteOnInCtx+pitch;porTime<noteOffInCtx;porTime+=pitch) {
                    var tt=(porTime-noteOnInCtx)/(noteOffInCtx-noteOnInCtx);
                    //console.log(rateStart,rateEnd, tt, rateStart*(1-tt)+rateEnd*tt, porTime);
                    source.playbackRate.setValueAtTime(
                        rateStart*(1-tt)+rateEnd*tt ,porTime);
                }
            } else if (!iss && chn.LfoV != 0) {
                var lfoTime=noteOnInCtx+chn.LfoD/t.Tempo;
                //console.log(lfoTime, chn.LfoA, chn.LfoV);
                var LfoC=0;
                var base=source.playbackRate.value;
                for (;lfoTime<noteOffInCtx;lfoTime+=pitch) {
                    /*console.log(LfoC,chn.LfoV,chn.LfoA,
                    1 + sinT[LfoC >>> (16 + sinMax_s)]/512*chn.LfoA/256);*/
                    source.playbackRate.setValueAtTime(
                        base*(1 + sinT[LfoC >>> (16 + sinMax_s)]/512*chn.LfoA/256),
                        lfoTime);
                    /*Steps += (sinT[chn.LfoC >>> (16 + sinMax_s)] *
                            (Steps >> 9 ) * chn.LfoA)  >> 8;*/
                    LfoC += chn.LfoV/2*pitch*SPS;
                }
            }

            /*
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
            chn.PorLen = -1;*/
        },
        //    procedure TEnveloper.Play1Por (c,f,t:Word;iss:Boolean);
        Play1Por: function (t,c,from,to,iss) {
            if (t.wavoutContext) return;
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
            var allWait=true,allStop=true,i,endCtxTime=0;
            for(i=0;i<Chs;i++) {
                var c=t.channels[i];
                switch (c.PlayState) {
                case psPlay:
                    allWait=false;
                    allStop=false;
                    break;
                case psWait:
                    allStop=false;
                    break;
                case psStop:
                    if (typeof c.endCtxTime==="number") {
                        if (c.endCtxTime>endCtxTime) {
                            endCtxTime=c.endCtxTime;
                        }
                    }
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
            return allStop ? {endCtxTime} : false;
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
        Start: function(t, options) {
            t.Stop();
            t.Rewind();
            t.BeginPlay = True;
            t.playNode(options);
            t.playStartTime=t.context.currentTime;
            t.contextTime=t.playStartTime;
            t.startRefreshLoop();
        },
        start: function (t) {return t.Start();},
        Rewind: function (t) {
            var ch; //:Integer;
            t.resetChannelStates();
            t.SeqTime=0;
            t.trackTime=0;
            for (ch = 0; ch < Chs; ch++) {
                var chn=t.channels[ch];
                //chn.soundMode = False;
                //chn.MPointC = 0;
                chn.PlayState = psPlay;
                //chn.MCount = t.SeqTime;
            }
        },
        Stop: function (t) {
            if (!t.BeginPlay) return;
            t.stopNode();
            t.stopRefreshLoop();
            t.BeginPlay=false;
            //console.log("STOP");
        },
        stop: function (t) {return t.Stop();},
        resetWavOut: function (t) {
            t.wavoutContext=false;
        },
        measureLength: function (t) {
            var wctx={channels:[]};
            t.wavoutContext=wctx;
            for (var i=0;i<Chs;i++) {
                wctx.channels.push({PC2CtxTime:[], endCtxTime:-1, loopLengthInCtx:0} );
            }
            t.Rewind();
            t.contextTime=0;
            while(true) {
                t.procChannels(1/60);
                if (t.allStopped()) {
                    break;
                }
            }
            var endTime=0,loopLength=0;
            for (i=0;i<Chs;i++) {
                var wc=wctx.channels[i];
                if (wc.endCtxTime>endTime) endTime=wc.endCtxTime;
                if (wc.loopLengthInCtx>loopLength) loopLength=wc.loopLengthInCtx;
            }
            delete t.wavoutContext;
            //console.log(wctx);
            return {endTime:endTime, loopLength:loopLength};
        },
        wavOut: function (t,options) {
            var l=t.measureLength();
            console.log(l);
            var onLine=t.context;
            t.context=new OfflineAudioContext(1,Math.floor(SPS*l.endTime),SPS);
            t.Rewind();
            t.playNode(options);
            t.contextTime=0;
            while(true) {
                t.procChannels(1/60);
                if (t.contextTime>=l.endTime) {
                    break;
                }
            }
            console.log(t.context);
            return t.context.startRendering().then(function(renderedBuffer) {
                return {decodedData:renderedBuffer, endTime:l.endTime,  loopLength: l.loopLength};
            });
        },
        convertDeltaTime: function(t,delta, inputUnit, outputUnit) {
            // SeqTime     楽譜上の位置． 1/2小節 = SPS
            // trackTime   rate=1 で演奏したときの演奏開始からの経過時間
            //                      SeqTime*(120/t)/SPS
            //              t=60 のとき，SeqTime*2/SPS
            //              t=120 のとき，SeqTime/SPS
            //              t=240 のとき，SeqTime/2/SPS
            // contextTime     演奏開始時刻+trackTime/rate (rateが一定の場合)
            //              rate=1 のとき ， 演奏開始時刻+trackTime
            //              rate=2 のとき ， 演奏開始時刻+trackTime/2
            //dSeq    = dTrack*SPS*(Tempo/120)
            //dTrack  = dSeq*(120/Tempo)/SPS
            //dCtx    = dTrack/rate = dSeq*(120/Tempo)/SPS/rate
            if (inputUnit===outputUnit) return delta;
            switch(inputUnit+2+outputUnit) {
                case DU_SEQ+2+DU_TRK:
                return delta*(120/t.Tempo)/SPS;
                case DU_SEQ+2+DU_CTX:
                return delta*(120/t.Tempo)/SPS/t.rate;
                case DU_TRK+2+DU_CTX:
                return delta/t.rate;
                case DU_TRK+2+DU_SEQ:
                return delta*SPS*(t.Tempo/120);
                case DU_CTX+2+DU_SEQ:
                return delta*(t.Tempo/120)*SPS*t.rate;
                case DU_CTX+2+DU_TRK:
                return delta*t.rate;
                default:
                new Error("Invalid unit conversion:"+(inputUnit+2+outputUnit));
            }
        },
        /*toAudioBuffer: function (t) {
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
        },*/
        SelWav: function(t, ch, n) {
            var chn=t.channels[ch];
            chn.CurWav = n;
            if (n < WvC) {
                chn.SccWave = t.WaveDat[n];
                chn.L2WL = log2(chn.SccWave.length);// 5;
                // Noise
                //if (n===WvC-1) chn.L2WL=10;
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
        refreshPSG: function(t) {
            var lengthInCtx= t.context.currentTime+t.bufferTime-t.contextTime;
            //console.log(lengthInCtx);
            if (lengthInCtx>0) t.procChannels(lengthInCtx);
            //t.writeSamples(data,WriteAd,length);
        },
        pause: function (t) {
            if (t.isPaused) return;
            t.isPaused=true;
            t.stopRefreshLoop();
        },
        resume: function (t) {
            if (!t.isPaused) return;
            t.isPaused=false;
            t.contextTime=t.context.currentTime;
            t.startRefreshLoop();
        },
        procChannels: function(t,lengthInCtx) {
            var i, ch, wdtmp,LParam, HParam, WParam, JmpSafe;
            cnt++;
            //var tempoK=SPS / t.sampleRate ;
            var startTime=new Date().getTime();
            /*if (t.allStopped()) {
                return;
            }*/
            var SeqTime=t.SeqTime,lpchk=0,chn;
            var nextSeqTime=SeqTime+t.convertDeltaTime(lengthInCtx, DU_CTX, DU_SEQ);
            var chPT=now();
            var wctx=t.wavoutContext;
            for (ch = 0; ch < Chs; ch++) {
                chn=t.channels[ch];
                if (chn.MPoint[chn.MPointC] == nil) t.StopMML(ch);
                if (chn.PlayState != psPlay) continue;


                JmpSafe = 0;
                while (chn.MCount <= nextSeqTime) {
                    if (chn.PlayState != psPlay) break;
                    var pc = chn.MPointC;
                    var curCtxTime=t.contextTime+
                        t.convertDeltaTime(chn.MCount-SeqTime, DU_SEQ, DU_CTX);
                    if (wctx) wctx.channels[ch].PC2CtxTime[pc]=curCtxTime;
                    LParam = chn.MPoint[pc + 1];
                    HParam = chn.MPoint[pc + 2];
                    var code = chn.MPoint[pc], lenInSeq,noteOnInCtx,noteOffInCtx;
                    if (code >= 0 && code < 96 || code === MRest) {
                        noteOnInCtx=curCtxTime;
                        lenInSeq=(LParam + HParam * 256) * 2;
                        var slen=t.foresightSlurs(chn);
                        noteOffInCtx=noteOnInCtx+
                            t.convertDeltaTime(lenInSeq+slen, DU_SEQ,DU_CTX) ;
                        //if (slen>0) console.log("SL",slen);
                        t.Play1Sound(ch, code, chn.Slur, noteOnInCtx, noteOffInCtx);
                        if (!chn.Slur) chn.LfoDC = chn.LfoD;
                        chn.Slur = False;
                        chn.MCount +=lenInSeq ;
                        // SPS=22050の場合 *2 を *1 に。
                        // SPS=x の場合   * (x/22050)
                        chn.MPointC += 3;
                    } else switch (code) {
                        case MPor:
                            noteOnInCtx=curCtxTime;
                            lenInSeq=(chn.MPoint[pc + 3]+chn.MPoint[pc + 4]*256) * 2;
                            noteOffInCtx=noteOnInCtx+
                                t.convertDeltaTime(lenInSeq, DU_SEQ,DU_CTX) ;
                            //if (slen>0) console.log("SL",slen);
                            //console.log(ch, LParam, chn.Slur, noteOnInCtx, noteOffInCtx,HParam);
                            t.Play1Sound(ch, LParam, chn.Slur, noteOnInCtx, noteOffInCtx,HParam);
                            chn.MCount +=lenInSeq ;
                            /* t.Play1Por (ch,
                               LParam,
                               HParam,
                               chn.Slur
                            );*/
                            chn.Slur=False;
                            /* chn.MCount+=
                            ( chn.MPoint[pc + 3]+chn.MPoint[pc + 4]*256 )*2;
                            // SPS=22050の場合 *2 を *1 に。
                            chn.PorLen=chn.MCount-SeqTime;*/
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
                                t.WaveDat[LParam][i] = WDT2Float( chn.MPoint[pc + 2 + i] );
                            }
                            break;
                        case MWrtWav2:
                            const len=HParam;
                            const l=chn.MPoint[pc + 3];// reserved, 1
                            const wd=[];
                            for (i = 0; i < len; i++) {
                                wd.push(WDT2Float(chn.MPoint[pc+4+i]));
                            }
                            t.WaveDat[LParam]=wd;
                            chn.MPointC += len+4; // MWrtWav2 wavno len l data*len
                            break;
                        case MSelEnv:
                            chn.EShape = t.EnvDat[LParam];
                            chn.CurEnv=LParam;
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
                            if (wctx) {
                                var wc=wctx.channels[ch];
                                var dstLabelPos=chn.MPointC + array2Int(chn.MPoint, pc+1);
                                var dstCtxTime=wc.PC2CtxTime[dstLabelPos];
                                //console.log("@jump", "ofs=",dstCtxTime,curCtxTime );
                                if (typeof dstCtxTime=="number" && dstCtxTime<curCtxTime) {
                                    wc.endCtxTime=curCtxTime;
                                    wc.loopLengthInCtx=(curCtxTime-dstCtxTime);
                                    t.StopMML(ch);
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
                            /*if (wctx && ch==0) {
                                wctx.label2Time[LParam]=[wctx.writtenSamples,t.sampleRate];
                                console.log("@label", LParam , chn.MPointC , wctx.writtenSamples+"/"+t.sampleRate );
                            }*/
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
                            chn.LfoD = LParam;// * t.sampleRate;
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
                            if (wctx) {
                                wctx.channels[ch].endCtxTime=curCtxTime;
                            }
                            chn.endCtxTime=curCtxTime;
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
            const stopTiming=t.handleAllState();
            if (stopTiming) {
                if (t.context.currentTime>stopTiming.endCtxTime) t.Stop();
                //else console.log(t.context.currentTime,stopTiming);
            }
            t.SeqTime= nextSeqTime;// Math.floor( t.Tempo * (length/120) * tempoK*t.rate );
            t.trackTime += t.convertDeltaTime(lengthInCtx  , DU_CTX, DU_TRK);// length/t.sampleRate*t.rate;
            t.contextTime+= lengthInCtx;
            /*if (wctx) {
                wctx.writtenSamples+=length;
                wctx.trackTime=t.trackTime;
            }*/
            t.performance.timeForChProc+=now()-chPT;
        },
        foresightSlurs:function (t,chn) {
            // 0-95 l l  MSlur  0-95 l l  MSlur  ...
            //           ^pc
            var pc=chn.MPointC+3;
            var res=0; // sum of l l
            var LParam,HParam,lenInSeq;
            while(true) {
                if (chn.MPoint[pc]!==MSlur) break;
                pc++;
                var code = chn.MPoint[pc];
                if (!(code >= 0 && code < 96)) break;
                LParam = chn.MPoint[pc + 1];
                HParam = chn.MPoint[pc + 2];
                lenInSeq=(LParam + HParam * 256) * 2;
                res+=lenInSeq;
                pc+=3;
            }
            return res;
        },
        getTrackTime: function (t) {return t.trackTime;},
        writeSamples: function (t,data,WriteAd,length) {
            var i, ch, v=0, Tmporc=0,chn,ad;
            var WrtEnd=WriteAd+length;
            for (ad=WriteAd; ad<WrtEnd; ad++) {
                data[ad]=0;
            }
            if (t.allStopped()) {
                return;
            }
            var wrtsT=now();
            for (ch = 0; ch < Chs; ch++) {
                chn=t.channels[ch];
                if (chn.PlayState != psPlay) continue;

                if (chn.PorLen > 0) {
                    Tmporc = chn.MCount - t.SeqTime;
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
                //vv[ch]=v;
                if (chn.ECount + chn.ESpeed*(length/2) < 65536 ) chn.ECount += chn.ESpeed*(length/2);

                //v=vv[ch]/ 0x80000;
                v/=0x80000;
                if (v<=0) continue;
                var SccCount=chn.SccCount,Steps=chn.Steps,SccWave=chn.SccWave,sh=(32-chn.L2WL);
                // Proc LFO here!
                if (chn.LfoV != 0) {
                    if (chn.LfoDC > 0) {
                        chn.LfoDC -= t.Tempo*length;
                    } else {
                        Steps += (sinT[chn.LfoC >>> (16 + sinMax_s)] *
                                (Steps >> 9 ) * chn.LfoA)  >> 8;
                        chn.LfoC += chn.LfoV/2*length;
                    }
                }
                // Sync(for PCM playback) is separeted?
                for (ad=WriteAd; ad<WrtEnd; ad++) {
                    data[ad] += v*SccWave[SccCount >>> sh];
                    SccCount += Steps;
                }
                chn.SccCount=SccCount >>> 0;
            }// of ch loop
            t.setNoiseWDT();// Longer?
            t.performance.timeForWrtSmpl+=now()-wrtsT;
            //t.performance.elapsedTime+=new Date().getTime()-startTime;
            //t.performance.writtenSamples+=length;
            //t.performance.writeRate=t.performance.writtenSamples/(t.performance.elapsedTime/1000*t.sampleRate);
            //--------------|---------------------------
            //             playpos  LS            LE
            //                       +-------------+

        }// of writeToArray
    }); // of Klass.define
    /*var undefs={};
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
    console.log(undefs);*/
    return TEnveloper;
}); // of requirejs.define
