/*global requirejs*/
define(["SEnv","WorkerServiceW","Tones.wdt"],function (SEnv, WS,wdt) {
    var e;
    WS.serv("MezonetJS/wavOut",function (params) {
        if (!e) {
            var ctx={sampleRate:params.sampleRate};
            e=new SEnv(ctx,{wavOutSpeed:10000});
            e.loadWDT(wdt);
        }
        e.load(params.mzo);
        return e.wavOut().then(function (arysrc) {
            return {arysrc:arysrc, loopStartFrac:e.loopStartFrac};
        });
    });
    WS.serv("test", function () {
        console.log("TEST!!");
        return "OK";
    });
    WS.ready();
});
