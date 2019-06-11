var reqConf={
    revpaths: {
        js: {
            klass:{
                "Klass":1,
                "assert":1,
                "FuncUtil":1
            },
            lang: {
                CodeGen:1,Grammar:1,Parser:1,Pos2RC:1,
                "source-map":1,
                Visitor:1
            },
            mzo: {

            },
            lib: {
                FS:1,
                WorkerServiceB: 1,
                WorkerServiceW: 1,
                WorkerFactory:1,
                root:1,
                promise:1
            },
            main: 1,
            test:1,
            dragMZO: 1,
            SEnv: "SEnv-old",
            "SEnv-arrayOpt": "SEnv",
            SEnvWorker:1,
            SEnvClient:1,
            //SEnv: 1,
            //"SEnv-arrayOpt": 1,
            M2Parser:1,
            wavWriter:1,
            almond: 1,
            "Tones.wdt":1,
        }
    }
};
(function () {
    reqConf.paths={}
    function genPaths(tree, path) {
        for (var k in tree) {
            var v=tree[k];
            if (typeof v==="object") {
                genPaths(v,path+"/"+k);
            } else {
                var modName=v===1?k:v;
                reqConf.paths[modName]=(path+"/"+k).replace(/^\//,"");
            }
        }
    }
    if (typeof location!=="undefined" && location.href.match(/localhost/)) {
        if (typeof importScripts!=="undefiend") {
            reqConf.urlArgs="WWWWW"+Math.random();

        } else {
            reqConf.urlArgs="BBBBBB"+Math.random();

        }
    }
    genPaths(reqConf.revpaths,"");
    delete reqConf.revpaths;
    console.log(reqConf);
    if (typeof exports!=="undefined") exports.conf=reqConf;
})();
