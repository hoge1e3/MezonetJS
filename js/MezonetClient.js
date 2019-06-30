/*global requirejs*/
define(["WorkerFactory","WorkerServiceB","Klass"],function (WorkerFactory,WS,Klass) {
    var workerURL=WorkerFactory.requireUrl("SEnvWorker");
    function arrayToAudioBuffer(context,arysrc,sampleRate) {
        var buffer = context.createBuffer(1, arysrc.length, sampleRate);
        var ary = buffer.getChannelData(0);
        for (var i = 0; i < ary.length; i++) {
             ary[i] = arysrc[i];
        }
        return buffer;
    }
    function timeout(t) {
        return new Promise(function (s) {
            setTimeout(s,t);
        });
    }
    var Playback=Klass.define({
        $this:true,
        $: function (t,src,options) {
            // src:MezonetClient
            //  ws:WS.Wrapper
            var pm=src.playbackMode;
            t.playbackMode=pm;
            switch (pm.type) {
                case "Mezonet":
                    if (pm.buffer && pm.worker) {
                        t.buffer=pm.buffer;
                        t.w=pm.worker;
                        delete pm.buffer;
                        delete pm.worker;
                    } else {
                        t.w=new WS.Wrapper(new Worker(workerURL));
                    }
                    break;
                case "AudioBuffer":
                    t.buffer=pm.buffer;
                    break;
            }
            t.context=src.context;
            t.mzo=src.mzo;
            t.src=src;
            t.sampleRate=t.context.sampleRate;
            t.wdataSize=t.src.maxSamples||t.sampleRate*4;
        },
        playNode: function (t) {
            if (this.isSrcPlaying) return;
            var source = this.context.createBufferSource();
            source.buffer = t.buffer;
            source.connect(this.context.destination);
            // 音源の再生を始める
            //source.start();
            source.loop = t.playbackMode.type==="Mezonet";
            console.log("source.loop",source.loop);
            source.playStartTime = this.playStartTime = this.context.currentTime;
            this.bufSrc=source;
            source.start = source.start || source.noteOn;
            source.start(0);
            this.isSrcPlaying = true;
            source.onended=function () {
                t.isSrcPlaying=false;
                //console.log("END!");
            };
            //console.log("Node start",t.buffer);
            //window.buff=t.buffer;
        },
        start:function (t) {
            return t.prepareBuffer().then(function () {
                t.playNode();
                return t.startRefreshLoop();
            });
        },
        getPlayPos: function (t) {
            var ti=this.context.currentTime- this. playStartTime;
            var tiSamples=Math.floor(ti*this.sampleRate);
            return tiSamples % t.wdataSize;
        },
        prepareBuffer: function(t) {
            //console.log("maxsamples",t.wdataSize);
            if (t.buffer) return Promise.resolve(t.buffer);
            return t.w.run("MezonetJS/wavOut",{
                mzo:t.mzo,
                sampleRate:t.sampleRate,
                maxSamples:t.wdataSize
            }).then(function (res) {
                t.buffer=arrayToAudioBuffer(t.context,res.arysrc,t.sampleRate);
                return t.buffer;
            });
        },
        startRefreshLoop: function (t) {
            //console.log("t.playbackMode.type",t.playbackMode.type);
            if (t.playbackMode.type==="AudioBuffer") return "loop not used";
            var data=t.buffer.getChannelData(0),cur=0,end,writtenEmpty=0;
            return refresh();
            function refresh() {
                return timeout(10).then(function () {
                    if (!t.isSrcPlaying) {
                        if (t.w) t.w.terminate();
                        return "stopped";
                    }
                    var cnt=0;
                    var playPos=t.getPlayPos();
                    var diff=playPos-cur;
                    var reqLen=(diff>=0 ? diff : t.wdataSize+diff );
                    //console.log("A",cur,reqLen,end);
                    if (end) {
                        for (var i=0;i<reqLen;i++) {
                            data[cur]=0;
                            cur=(cur+1)%t.wdataSize;
                        }
                        writtenEmpty+=reqLen;
                        if (writtenEmpty>=t.wdataSize) return t.stop();
                        else return refresh();
                    }
                    if (reqLen==0) return timeout(10).then(refresh);
                    return t.w.run("MezonetJS/wavOut",{
                        maxSamples:reqLen
                    }).then(function (res) {
                        var i,s=res.arysrc;
                        //console.log(reqLen,res);
                        for (i=0;i<s.length;i++) {
                            data[cur]=s[i];
                            cur=(cur+1)%t.wdataSize;
                        }
                        if (!res.hasNext) {
                            end=true;
                        }
                        return refresh();
                    });
                });
            }
        },
        setRate: function (t,rate) {

        },
        setVolume: function (t,volume) {

        },
        pause: function (t) {

        },
        resume: function (t) {

        },
        stop: function (t) {
            if (t.bufSrc) t.bufSrc.stop();
            t.isSrcPlaying=false;
            return "stopped";
        }
    });
    return Klass.define({
        $this:true,
        $:function (t,context,mzo) {
            t.w=new WS.Wrapper(new Worker(workerURL));
            t.context=context;
            t.sampleRate=t.context.sampleRate;
            t.mzo=mzo;

        },
        playAsMezonet: function (options) {
            return new Playback(this,options);
        },
        init: function (t,options) {
            options=options||{};
            return t.w.run("MezonetJS/wavOut",{
                mzo:t.mzo,
                sampleRate:t.sampleRate,
                maxSamples:options.maxSamples||t.context.sampleRate*4
            }).then(function (res) {
                if (res.loopStartFrac) {
                    res.loopStart=res.loopStartFrac[0]/res.loopStartFrac[1];
                }
                var buffer=arrayToAudioBuffer(t.context, res.arysrc, t.sampleRate);
                res.mezonet=t;
                res.decodedData=buffer;
                if (res.hasNext) {
                    t.playbackMode={
                        // 従来のMezonetスタイルでプレイ（wavにしてループ再生じゃない/ Mosimomo.mus とかもちゃんと演奏される）
                        type:"Mezonet",
                        //buffer: buffer,//先着1名
                        //worker:t.w // 先着1名
                    };
                } else {
                    t.playbackMode={
                        // 普通のWebAudioで再生してもらう
                        type:"AudioBuffer",
                        buffer:buffer//コピーしないで使い回す
                    };
                    t.terminate();
                }
                res.playbackMode=t.playbackMode;
                console.log(res);
                return res;
            });
        },
        terminate: function (t) {
            t.w.terminate();
        }
    });
});
