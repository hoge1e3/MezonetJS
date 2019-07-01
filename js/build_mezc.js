/* global nodeRequire, process */
({
    name: 'almond',
    include: ['MezonetClient'],
    //insertRequire: ['SEnvClient'],
    optimize:"uglify",
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
        //wsrc=wsrc.replace(/\r/g,"").replace(/\n\s*/g,"\n").replace(/[ \t]+/g," "); // IS that OK? replace "  hoge   "  to " hoge "
        //var repl="WorkerFactory.createFromString("+JSON.stringify(wsrc)+")";
        //text=text.replace(/WorkerFactory.require\("SEnvWorker"\)/,repl);

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
