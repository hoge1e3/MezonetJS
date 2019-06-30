/*global requirejs*/
define(["SEnv","WorkerServiceW","Tones.wdt","promise"],function (SEnv, WS,wdt,_) {
    var e;
    function load(params) {
        var p=Promise.resolve();
        if (!e) {
            var ctx={sampleRate:params.sampleRate};
            e=new SEnv(ctx,{wavOutSpeed:10000});
            p=e.loadWDT(wdt);
        }
        return p.then(function () {
            e.load(params.mzo);
        });
    }
    WS.serv("MezonetJS/load",load);
    WS.serv("MezonetJS/wavOut",function (params) {
        var p=Promise.resolve();
        if (params.mzo) {
            p=load(params);
        }
        return p.then(function () {
            return e.wavOut({maxSamples:params.maxSamples});
        }).then(function (wctx) {
            delete wctx.PC2Time;
            return wctx;
        });
    });
    WS.serv("test", function () {
        console.log("TEST!!");
        return "OK";
    });
    WS.ready();
});
