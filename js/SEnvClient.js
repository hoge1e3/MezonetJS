/*global requirejs*/
define(["WorkerFactory","WorkerServiceB","Klass"],function (WorkerFactory,WS,Klass) {
    var workerURL=WorkerFactory.requireUrl("SEnvWorker");
    return Klass.define({
        $this:true,
        $:function (t,context) {
            t.w=new WS.Wrapper(new Worker(workerURL));
            t.context=context;
            t.sampleRate=t.context.sampleRate;
        },
        toAudioBuffer: function (t,mzo) {
            return t.w.run("MezonetJS/wavOut",{mzo:mzo,sampleRate:t.sampleRate}).then(function (res) {
                //console.log(res);
                return t.wavToAudioBuffer(res.arysrc, res.loopStartFrac);
            });
        },
        wavToAudioBuffer: function (t,arysrc, loopStartFrac) {
            var buffer = t.context.createBuffer(1, arysrc.length, t.sampleRate);
            var ary = buffer.getChannelData(0);
            for (var i = 0; i < ary.length; i++) {
                 ary[i] = arysrc[i];
            }
            var res={decodedData: buffer};
            if (loopStartFrac) {
                res.loopStart=loopStartFrac[0]/loopStartFrac[1];
            }
            return res;
        },
        terminate: function (t) {
            t.w.terminate();
        }
    });
});
