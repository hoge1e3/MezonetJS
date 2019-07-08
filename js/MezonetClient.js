/*global requirejs*/
define(["WorkerFactory","WorkerServiceB","Klass"],function (WorkerFactory,WS,Klass) {
    Promise.prototype.finally = Promise.prototype.finally || function (fn) {
        function onFinally(cb){
            return Promise.resolve(fn()).then(cb);
        }
        return this.then(
            function (result) {
                return onFinally(function(){
                    return result;
                });
            },
            function (reason) {
                return onFinally(function(){
                    return Promise.reject(reason);
                });
            }
        );
    };
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
    function now(){return new Date().getTime();}

    var Playback=Klass.define({
        $this:true,
        $: function (t,src,options) {
            // src:MezonetClient
            //  ws:WS.Wrapper
            t.w=new WS.Wrapper(new Worker(workerURL));
            t.context=src.context;
            t.mzo=src.mzo;
            t.src=src;
            t.sampleRate=t.context.sampleRate;
            t.curRate=1;
            t.plusTime=0;
            t.writtenSamples=0;
            t.scriptProcessorSize=options.scriptProcessorSize||0;
            t.wdataSize=Math.floor(t.sampleRate/2);
            t.processDuration=[];
            t.lastProcessed=now();
        },
        playNode: function (t,options) {
            if (t.isStopped) return ;
            if (this.isSrcPlaying) return;
            options=options||{};
            var source = t.context.createBufferSource();
            var a=[];for (var i=0;i<t.sampleRate;i++) a[i]=0;//i%500?0.2:-0.2;
            var buffer= arrayToAudioBuffer(t.context,a,t.sampleRate);
            source.buffer=buffer;

            var scriptProcessor = this.context.createScriptProcessor(t.scriptProcessorSize,1,1);
            scriptProcessor.onaudioprocess=t.refresh.bind(t);
            this.context.createGain = this.context.createGain || this.context.createGainNode;
            var gainNode = this.context.createGain();
            scriptProcessor.connect(gainNode);
            gainNode.connect(this.context.destination);
            t.gainNode=gainNode;
            this.bufSrc=source;
            source.loop=true;
            source.connect(gainNode);
            source.start = source.start || source.noteOn;
            source.start();
            t.lastProcessed=now();
            this.isSrcPlaying = true;
            t.bufSrc=source;
            t.scriptProcessor=scriptProcessor;
            var volume=options.volume||1;
            gainNode.gain.value=volume;
            t.rate=1;
            t.trackTime=0;
        },
        start:function (t,options) {
            if (t.isStopped) return Promise.resolve();
            return t.prepareBuffer().then(function () {
                t.playNode(options);
                t.startRefreshLoop();
            });
        },
        getCurrentTime: function (t) {
            return t.trackTime;
        },
        setRate: function (t,rate) {
            if (rate <= 0 || isNaN(rate)) rate = 1;
            t.rate=rate;
        },
        refresh: function (t,e) {
            /*var n=now();
            t.processDuration.push(n-t.lastProcessed);
            t.lastProcessed=n;*/
            var data = e.outputBuffer.getChannelData(0);
            var i;
            if (t.isPaused) {
                for (i=0;i<data.length;i++) {
                    data[i]=0;
                }
                return;
            }
            var len=Math.min(data.length,t.buffer.length);
            for (i=0;i<len;i++) {
                data[i]=t.buffer[i];
            }
            t.buffer.splice(0,len);
            if (t.hitToLast && t.buffer.length===0) t.stop();
        },
        prepareBuffer: function(t) {
            //console.log("maxsamples",t.wdataSize);
            if (t.buffer) return Promise.resolve(t.buffer);
            return t.w.run("MezonetJS/wavOut",{
                mzo:t.mzo,
                sampleRate:t.sampleRate,
                maxSamples:t.wdataSize
            }).then(function (res) {
                t.buffer=res.arysrc;
                t.writtenSamples+=res.arysrc.length;
                return t.buffer;
            });
        },
        startRefreshLoop: function (t) {
            //if (t.playbackMode.type==="AudioBuffer") return "loop not used";
            return refresh();
            function refresh() {
                return timeout(0).then(function () {
                    if (!t.isSrcPlaying) {
                        if (t.w) t.w.terminate();
                        return "stopped";
                    }
                    var reqLen=t.wdataSize-t.buffer.length;
                    if (reqLen<=0) return timeout(10).then(refresh);
                    return t.w.run("MezonetJS/wavOut",{
                        maxSamples:reqLen,
                        rate: t.rate
                    }).then(function (res) {
                        var s=res.arysrc;
                        t.buffer=t.buffer.concat(s);
                        t.trackTime=res.trackTime;
                        if (res.hasNext) {
                            return refresh();
                        } else {
                            t.hitToLast=true;
                        }
                    });
                });
            }
        },
        setVolume: function (t,volume) {
            volume=typeof volume==="number" ? volume:1;
            if (t.gainNode) t.gainNode.gain.value=volume;
        },
        pause: function (t) {
            if (t.isStopped) return;
            if (!t.isSrcPlaying) return;
            if (t.isPaused) return;
            t.isPaused=true;
        },
        resume: function (t) {
            if (t.isStopped) return;
            if (!t.isSrcPlaying) return;
            if (!t.isPaused) return;
            t.isPaused=false;
        },
        stop: function (t) {
            if (t.bufSrc) t.bufSrc.stop();
            if (t.scriptProcessor) t.scriptProcessor.disconnect();
            if (t.gainNode) t.gainNode.disconnect();
            t.isSrcPlaying=false;
            t.isStopped=true;
            return "stopped";
        }
    });
    var Mezonet=Klass.define({
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
            t.maxSamples=options.maxSamples||t.context.sampleRate*4;
            return t.w.run("MezonetJS/wavOut",{
                mzo:t.mzo,
                sampleRate:t.sampleRate,
                maxSamples:t.maxSamples
            }).then(function (res) {
                //console.log("WAVoUT done",res);
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
                //console.log(res);
                return res;
            });
        },
        terminate: function (t) {
            t.w.terminate();
        }
    });
    Mezonet.Playback=Playback;
    return Mezonet;
});
