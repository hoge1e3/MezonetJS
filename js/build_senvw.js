/* global nodeRequire, process */
({
    name: 'almond',
    include: ['SEnvWorker'],
    insertRequire: ['SEnvWorker'],
    optimize:"none",//"uglify",// uglify changes function(t) ->function (e) this is not this
    baseUrl: "..",
    /*wrap: {
        startFile: "func_head.txt",
        endFile: "func_tailw.txt"
    },*/
    paths: (function () {
        var conf=nodeRequire(process.cwd()+"/reqConf.js");
        return conf.conf.paths;
     })(),
     //out: 'gen/Mezonet.js',
     out: "gen/MezonetWorker.js",
    /*shim: (function () {
        var conf=nodeRequire(process.cwd()+"/reqConf.js");
        return conf.conf.shim;
    })()*/
})
/*newVer=function () {var da=new Date();
var fn=""+da.getFullYear()+dec(da.getMonth()+1)+dec(da.getDate())+
dec(da.getHours())+dec(da.getMinutes())+dec(da.getSeconds());return fn;
function dec(v,n) {v="0"+v;return v.substring(v.length-2)}*/
