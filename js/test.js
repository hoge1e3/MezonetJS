requirejs(["SEnv"],function (SEnv) {
    var data=`
          b0 04 00 00 0a 1b 00 00 00 64 78 65 05 6e 00 66
          00 6b 00 73 00 00 00 76 00 74 00 67 78 00 24 22
          56 ff ff ff 15 00 00 00 64 78 65 05 6e 00 66 00
          6b 00 73 00 00 00 76 00 74 00 ff ff ff 15 00 00
          00 64 78 65 05 6e 00 66 00 6b 00 73 00 00 00 76
          00 74 00 ff ff ff 15 00 00 00 64 78 65 05 6e 00
          66 00 6b 00 73 00 00 00 76 00 74 00 ff ff ff 15
          00 00 00 64 78 65 05 6e 00 66 00 6b 00 73 00 00
          00 76 00 74 00 ff ff ff 15 00 00 00 64 78 65 05
          6e 00 66 00 6b 00 73 00 00 00 76 00 74 00 ff ff
          ff 15 00 00 00 64 78 65 05 6e 00 66 00 6b 00 73
          00 00 00 76 00 74 00 ff ff ff 15 00 00 00 64 78
          65 05 6e 00 66 00 6b 00 73 00 00 00 76 00 74 00
          ff ff ff 15 00 00 00 64 78 65 05 6e 00 66 00 6b
          00 73 00 00 00 76 00 74 00 ff ff ff 15 00 00 00
          64 78 65 05 6e 00 66 00 6b 00 73 00 00 00 76 00
          74 00 ff ff ff
    `;
    var d=[];
    data.replace(/[0-9a-f]+/g,function (data) {
        d.push("0x"+data-0);
    });
    window.senv=SEnv();
    window.senv.load(d);
    window.senv.Start();
    var ctx=document.querySelector("#c").getContext("2d");
    /*setInterval(function () {
        window.senv.RefreshPSG(4096);
        //console.log(window.senv.wdata2);
        ctx.clearRect(0,0,1024,256);
        for (var i=0;i<4096;i++) {
            ctx.fillRect(i/4,128+window.senv.wdata2[i]/128,1,256);
        }
    },500);*/
});
