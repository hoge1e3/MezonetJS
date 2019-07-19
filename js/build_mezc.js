/* global nodeRequire, process */
({
    name: 'almond',
    include: ['MezonetClient'],
    //insertRequire: ['SEnvClient'],
    //optimize:"none",//"uglify", "none",
    optimize:"uglify",//"uglify", "none",
    baseUrl: "..",
    wrap: {
        startFile: "func_head.txt",
        endFile: "func_tail.txt"
    },
    paths: (function () {
        var conf=nodeRequire(process.cwd()+"/reqConf.js");
        return conf.conf.paths;
     })(),
     //out: 'gen/Mezonet.js',
     out: function (text, sourceMapText) {
        var fs=nodeRequire("fs");
        var wsrc=fs.readFileSync("gen/MezonetWorker.js","utf8");

        var repl=".urlFromString("+JSON.stringify(wsrc)+")";
        text=text.replace(/\.requireUrl\("SEnvWorker"\)/,repl);

        fs.writeFileSync("gen/Mezonet.js",text);
        //console.log(text,"/*hoge*/");
    },
    /*shim: (function () {
        var conf=nodeRequire(process.cwd()+"/reqConf.js");
        return conf.conf.shim;
    })()*/
})
