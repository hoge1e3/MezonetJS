/* global nodeRequire, process */
({
    name: 'almond',
    include: ['SEnvClient'],
    //insertRequire: ['SEnvClient'],
    optimize:"none",
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
        wsrc=wsrc.replace(/\r/g,"").replace(/\n\s*/g,"\n").replace(/[ \t]+/g," "); // IS that OK? replace "  hoge   "  to " hoge "
        //var repl="WorkerFactory.createFromString("+JSON.stringify(wsrc)+")";
        //text=text.replace(/WorkerFactory.require\("SEnvWorker"\)/,repl);

        var repl="WorkerFactory.urlFromString("+JSON.stringify(wsrc)+")";
        text=text.replace(/WorkerFactory.requireUrl\("SEnvWorker"\)/,repl);

        fs.writeFileSync("gen/Mezonet.js",text);
        //console.log(text,"/*hoge*/");
    },
    /*shim: (function () {
        var conf=nodeRequire(process.cwd()+"/reqConf.js");
        return conf.conf.shim;
    })()*/
})
/*newVer=function () {var da=new Date();
var fn=""+da.getFullYear()+dec(da.getMonth()+1)+dec(da.getDate())+
dec(da.getHours())+dec(da.getMinutes())+dec(da.getSeconds());return fn;
function dec(v,n) {v="0"+v;return v.substring(v.length-2)}*/
