/*global requirejs*/
define(["SEnv","WorkerServiceW"],function (SEnv, WS) {
    var e;
    WS.serv("MezonetJS/setup",function (params) {
        var ctx={sampleRate:params.sampleRate};
        e=new SEnv(ctx,{wavOutSpeed:10000});
    });
    WS.serv("MezonetJS/wavOut",function (params) {
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
