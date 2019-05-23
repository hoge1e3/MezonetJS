/*global requirejs*/
define(["WorkerFactory","WorkerServiceB","Klass"],function (WorkerFactory,WS,Klass) {
    var w=new WS.Wrapper(WorkerFactory.require("SEnvWorker"));
    return Klass.define({
        $this:"t",
        $:function (t,context) {
            t.context=context;
            t.sampleRate=t.context.sampleRate;
            w.run("MezonetJS/setup",{sampleRate:t.sampleRate}).then(function () {
                console.log("MezonetJS worker setup complete");
            });
        },
        toAudioBuffer: function (t,mzo) {
            return w.run("MezonetJS/wavOut",{mzo:mzo}).then(function (res) {
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
