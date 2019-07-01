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
            t.curTempo=1;
            t.plusTime=0;
        },
        playNode: function (t) {
            if (this.isSrcPlaying) return;
            var source = this.context.createBufferSource();
            source.buffer = t.buffer;

            this.context.createGain = this.context.createGain || this.context.createGainNode;
            var gainNode = this.context.createGain();
            source.connect(gainNode);
            gainNode.connect(this.context.destination);
            t.gainNode=gainNode;
            // 音源の再生を始める
            //source.start();
            source.loop = t.playbackMode.type==="Mezonet";
            //console.log("source.loop",source.loop);
            this.playStartTime = this.context.currentTime;
            this.bufSrc=source;
            source.start = source.start || source.noteOn;
            source.start(0);
            this.isSrcPlaying = true;
            t.curTempo=1;
            t.plusTime=0;
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
            if (t.isPaused) return t.isPaused.resumeAt;
            var ti=this.context.currentTime- this. playStartTime;
            ti*=t.curTempo;
            ti+=t.plusTime;
            var tiSamples=Math.floor(ti*this.sampleRate);
            return tiSamples % t.wdataSize;
        },
        setRate: function (t,tempo) {
            if (tempo <= 0 || isNaN(tempo)) tempo = 1;
            t.plusTime -= (t.context.currentTime - t.playStartTime) * (tempo - t.curTempo);
            t.curTempo = tempo;
            t.bufSrc.playbackRate.value = tempo;
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
                if (t.visualize) t.visualize(0,res.arysrc,0,res.arysrc.length);
                return t.buffer;
            });
        },
        startRefreshLoop: function (t) {
            //console.log("t.playbackMode.type",t.playbackMode.type);
            if (t.playbackMode.type==="AudioBuffer") return "loop not used";
            var data=t.buffer.getChannelData(0),cur=0,end,writtenEmpty=0;
            return refresh();
            function refresh() {
                return timeout(500).then(function () {
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
                        if (t.visualize) t.visualize(playPos,data,cur,reqLen);
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
                        if (t.visualize) t.visualize(playPos,data,cur,s.length);
                        for (i=0;i<s.length;i++) {
                            data[cur]=s[i];
                            cur=(cur+1)%t.wdataSize;
                        }
                        if (!res.hasNext) {
                            end=true;
                            t.w.terminate();
                        }
                        return refresh();
                    });
                });
            }
        },
        setVolume: function (t,volume) {
            volume=typeof volume==="number" ? volume:1;
            t.gainNode.gain.value=volume;
        },
        pause: function (t) {
            if (!t.isSrcPlaying) return;
            if (t.isPaused) return;
            t.isPaused={
                resumeAt: t.getPlayPos(),
                pausedTime: t.context.currentTime
            };
            t.bufSrc.stop();
            t.bufSrc.disconnect();
        },
        resume: function (t) {
            if (!t.isSrcPlaying) return;
            if (!t.isPaused) return;
            var source = this.context.createBufferSource();
            source.buffer = t.buffer;
            source.connect(t.gainNode);

            source.loop = t.playbackMode.type==="Mezonet";
            this.bufSrc=source;
            t.plusTime -= (t.context.currentTime-t.isPaused.pausedTime)*t.curTempo;
            source.start = source.start || source.noteOn;
            source.start(0, t.isPaused.resumeAt/ t.sampleRate );
            source.onended=function () {
                t.isSrcPlaying=false;
            };
            source.playbackRate.value=t.curTempo;
            delete t.isPaused;
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
                }
                t.w.terminate();
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
