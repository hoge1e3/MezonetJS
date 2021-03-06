/* global nodeRequire, process */
({
    name: 'almond',
    include: ['Mezonet'],
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
    out: 'gen/Mezonet.js',
    /*shim: (function () {
        var conf=nodeRequire(process.cwd()+"/reqConf.js");
        return conf.conf.shim;
    })()*/
})
/*newVer=function () {var da=new Date();
var fn=""+da.getFullYear()+dec(da.getMonth()+1)+dec(da.getDate())+
dec(da.getHours())+dec(da.getMinutes())+dec(da.getSeconds());return fn;
function dec(v,n) {v="0"+v;return v.substring(v.length-2)}*/
