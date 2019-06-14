/*global requirejs*/
define(["WorkerFactory","WorkerServiceB","Klass"],function (WorkerFactory,WS,Klass) {
    var w;
    return Klass.define({
        $this:"t",
        $:function (t,context) {
            w=w||new WS.Wrapper(WorkerFactory.require("SEnvWorker"));
            t.context=context;
            t.sampleRate=t.context.sampleRate;
        },
        toAudioBuffer: function (t,mzo) {
            return w.run("MezonetJS/wavOut",{mzo:mzo,sampleRate:t.sampleRate}).then(function (res) {
                console.log(res);
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
        }
    });
});
