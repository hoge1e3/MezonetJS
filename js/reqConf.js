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
            test:1,
            SEnv: 1,
            M2Parser:1,
            "Tones.wdt":1
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
    genPaths(reqConf.revpaths,"");
    delete reqConf.revpaths;
    console.log(reqConf);
    if (typeof exports!=="undefined") exports.conf=reqConf;
})();
