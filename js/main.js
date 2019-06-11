/* global webkitAudioContext, AudioContext */
define(["M2Parser",/*"SEnv",*/"wavWriter","FS","dragMZO","SEnvClient"],
function (P,/*SEnv,*/ww,FS,dm,SEnvC) {
    /*var w=WF.create("SEnvWorker");//var w=new Worker("js/SEnvWorker.js");
    var ws=new WS.Wrapper(w);
    ws.run("test").then(function (r) {
        console.log("WS",r);
    });*/
    FS.mount("/ram/",FS.LSFS.ramDisk());
    var context;
    if (typeof (webkitAudioContext) !== "undefined") {
        context = new webkitAudioContext();
    } else if (typeof (AudioContext) !== "undefined") {
        context = new AudioContext();
    }
    var senvc=new SEnvC(context);
    //window.senv=new SEnv(context,{resolution:600});
    /*window.play=function () {
        window.stopBufSrc();
        var mzo=P.parseMML(document.querySelector("#mml").value);
        window.senv.load(mzo);
        window.senv.Start();
    };*/
    window.stopBufSrc=function () {
        if (window.bufSrc) window.bufSrc.stop();
        delete window.bufSrc;
    };
    window.playAsBuffer=function () {
        try {
            var mzo=P.parseMML(document.querySelector("#mml").value);
            senvc.toAudioBuffer(mzo).then(window.playBuffer);
            /*var t=window.senv;
            t.load(mzo);
            t.toAudioBuffer().then(window.playBuffer);*/
        } catch(e) {
            console.log(e);
            alert(e);
        }
    };
    window.playBuffer=function (data) {
        window.stopBufSrc();
        //var t=window.senv;
        console.log("AudioData",data);
        var source = context.createBufferSource();
        source.buffer = data.decodedData;
        source.connect(context.destination);
        if (data.loopStart!=null) {
            source.loop=true;
            source.loopStart=data.loopStart;
            source.loopEnd=data.decodedData.duration;
        }
        console.log("AudioData src",source.loopStart, source.loopEnd);
        source.start = source.start || source.noteOn;
        source.start(0);
        window.bufSrc=source;
    };
    window.stop=function () {
        window.stopBufSrc();
        //window.senv.Stop();
    };
    window.wav=function wav() {
        window.stopBufSrc();
        var mzo=P.parseMML(document.querySelector("#mml").value);
        senvc.toAudioBuffer(mzo).then(function (data) {
            //console.log(data.decodedData.getChannelData(0));
            var wavf=ww(data.decodedData.getChannelData(0), context.sampleRate).write();
            var fn=document.querySelector("#samples").value || "test";
            var dst=FS.get("/ram/"+fn+".wav");
            //console.log(wavf);
            dst.bytes(new Uint8Array(wavf).buffer);
            dst.download();
        });
        /*senv.load(mzo);
        senv.wavOut().then(function (raw) {
            //console.log(raw);
            var wavf=ww(raw, senv.sampleRate).write();
            var fn=document.querySelector("#samples").value || "test";
            var dst=FS.get("/ram/"+fn+".wav");
            //console.log(wavf);
            dst.bytes(new Uint8Array(wavf).buffer);
            dst.download();
        });*/
    };
    window.mzo=function () {
        var mzo=P.parseMML(document.querySelector("#mml").value);
        var fn=document.querySelector("#samples").value || "test";
        var dst=FS.get("/ram/"+fn+".mzo");
        dst.bytes(new Uint8Array(mzo).buffer);
        dst.download();

    };
    /*setInterval(function () {
        document.querySelector("#perf").innerText=Math.floor(senv.performance.writeRate*10)/10;
    },1000);*/


});
window.onload=function () {
    var s=document.querySelectorAll(".mml");
    var sel=document.querySelector("#samples");
    s.forEach(function (e) {
        var opt=document.createElement("option");
        opt.innerHTML=e.getAttribute("data-name");
        sel.appendChild(opt);
    });
    sel.addEventListener("change", function () {
        selectSample(sel.value);
    });
    selectSample("Fanfare");
};
function selectSample(name) {
    var s=document.querySelectorAll(".mml");
    s.forEach(function (e) {
        var opt=document.createElement("option");
        if (e.getAttribute("data-name")===name) {
            document.querySelector("#mml").value=e.innerHTML;
        }
    });

}
