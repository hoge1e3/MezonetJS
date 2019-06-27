/*global requirejs*/
define(["SEnv","WorkerServiceW","Tones.wdt","promise"],function (SEnv, WS,wdt,_) {
    var e;
    WS.serv("MezonetJS/wavOut",function (params) {
        var p=Promise.resolve();
        if (!e) {
            var ctx={sampleRate:params.sampleRate};
            e=new SEnv(ctx,{wavOutSpeed:10000});
            p=e.loadWDT(wdt);
        }
        return p.then(function () {
            return e.load(params.mzo);
        }).then(function () {
            return e.wavOut();
        })/*.then(function (arysrc) {
            return {arysrc:arysrc, loopStartFrac:e.loopStartFrac};
        })*/;
    });
    WS.serv("test", function () {
        console.log("TEST!!");
        return "OK";
    });
    WS.ready();
});
