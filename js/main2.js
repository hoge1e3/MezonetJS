/* global webkitAudioContext, AudioContext */
define(["M2Parser","wavWriter","FS","dragMZO","Mezonet"],
function (P,ww,FS,dm,Mezonet) {
    FS.mount("/ram/",FS.LSFS.ramDisk());
    var context;
    if (typeof (webkitAudioContext) !== "undefined") {
        context = new webkitAudioContext();
    } else if (typeof (AudioContext) !== "undefined") {
        context = new AudioContext();
    }
    var senv;
    Mezonet.init();
    window.Mezonet=Mezonet;
    var playback;
    setInterval(function () {
        if (playback) document.querySelector("#time").innerHTML=Math.floor(playback.getTrackTime()*10)/10;
    },100);
    window.playAsBuffer=function () {
        try {
            window.stop();
            var mzo=P.parseMML(document.querySelector("#mml").value);
            //if (m) m.terminate();
            if (playback) playback.Stop();
            var src=new Mezonet.Source(mzo);
            playback=src.playback(context);
            window.playback=playback;
            playback.Start();
        } catch(e) {
            console.log(e);
            alert(e);
        }
    };
    window.stop=function () {
        if (playback) playback.Stop();
        //window.stopBufSrc();
        //window.senv.Stop();
    };
    window.wav=function wav() {
        //window.stopBufSrc();
        var mzo=P.parseMML(document.querySelector("#mml").value);
        if (m) m.terminate();
        m=new MezonetClient(context,mzo);
        window.m=m;
        m.init({maxSamples:0}).then(function (data) {
            //console.log(data);
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

    listSamples();
});
function listSamples() {
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
}
function selectSample(name) {
    var s=document.querySelectorAll(".mml");
    s.forEach(function (e) {
        var opt=document.createElement("option");
        if (e.getAttribute("data-name")===name) {
            document.querySelector("#mml").value=e.innerHTML;
        }
    });

}
function visualize(playPos, data, writePos, writeLength) {
    window.data=data;
    var cv=document.querySelector("#canvas");
    var w=cv.getAttribute("width")-0;
    var h=cv.getAttribute("height")-0;
    var ctx=cv.getContext("2d");
    var pitch=Math.floor(data.length/w)||1;
    //console.log(playPos,writePos,data.length);
    for (var i=0;i<writeLength;i++) {
        if (i%pitch==0) {
            ctx.fillStyle="hsl("+(Math.floor((window.playback.writtenSamples+i)/1000)%360)+",100%,80%)";
            //console.log("hsl("+(Math.floor(window.playback.writtenSamples/1000)%360)+",100%,50%)");
            var x=Math.floor(writePos/pitch);
            ctx.fillRect( x, 0, 1, h);
            ctx.fillStyle="hsl("+(Math.floor((window.playback.writtenSamples+i)/1000)%360)+",100%,30%)";
            ctx.fillRect( x, 0, 1, data[writePos]*h/2+h/2);
        }
        writePos=(writePos+1)%data.length;
    }
    /*ctx.clearRect(0,0,w,10);
    ctx.fillStyle="red";
    ctx.fillRect(playPos/data.length*w,0,2,10);
    ctx.fillStyle="blue";
    ctx.fillRect(writePos/data.length*w,0,2,10);*/
}
function refreshPos() {
    var data=window.data;
    var playback=window.playback;
    if(!data) return;
    if (!playback) return;
    /*for (var i=0;i<100;i++) {
        data[i]=-1;
        data[data.length-1-i]=1;
    }*/
    var cv=document.querySelector("#canvas");
    var w=cv.getAttribute("width")-0;
    var h=cv.getAttribute("height")-0;
    var ctx=cv.getContext("2d");
    var playPos=playback.getCurrentSampleInBuffer();
    var ti=playback.getTrackTime();

    ctx.clearRect(0,0,w,10);
    ctx.fillStyle="red";
    ctx.fillRect(playPos/data.length*w,0,2,10);
    ctx.fillStyle="black";
    ctx.fillText(Math.floor(ti*100)/100,300,10);

}
setInterval(refreshPos,16);
function arrayToAudioBuffer(context,arysrc,sampleRate) {
    var buffer = context.createBuffer(1, arysrc.length, sampleRate);
    var ary = buffer.getChannelData(0);
    for (var i = 0; i < ary.length; i++) {
         ary[i] = arysrc[i];
    }
    return buffer;
}
