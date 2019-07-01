/* global webkitAudioContext, AudioContext */
define(["M2Parser","wavWriter","FS","dragMZO","MezonetClient"],
function (P,ww,FS,dm,MezonetClient) {
    FS.mount("/ram/",FS.LSFS.ramDisk());
    var context;
    if (typeof (webkitAudioContext) !== "undefined") {
        context = new webkitAudioContext();
    } else if (typeof (AudioContext) !== "undefined") {
        context = new AudioContext();
    }
    var m;
    var playback;
    window.playAsBuffer=function () {
        try {
            window.stop();
            var mzo=P.parseMML(document.querySelector("#mml").value);
            if (m) m.terminate();
            m=new MezonetClient(context,mzo);
            window.m=m;
            m.init().then(function () {
                playback=m.playAsMezonet();
                window.playback=playback;
                return playback.start();
            }).then(function (res) {
                console.log(res);
            },function (e) {
                console.error(e);
            });
        } catch(e) {
            console.log(e);
            alert(e);
        }
    };
    window.stop=function () {
        if (playback) playback.stop();
        //window.stopBufSrc();
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
