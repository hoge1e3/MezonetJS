define(["Grammar","Visitor"],function (Grammar,Visitor) {
//--- Also in SEnv
    var Ses = 10,
        Chs = 10,
        Regs = Chs * 3,
        WvElC = 32,
        WvC = 96,
        wdataSize = 65536,
        //   99=r 100=vol 101=ps (x*128)  255=end
        MRest = 99,
        MVol = 100,
        Mps = 101,
        MSelWav = 102,
        MTempo = 103,
        MJmp = 104,
        MSlur = 105,
        MPor = 106,
        MSelEnv = 107,
        MWait = 108,
        MCom = 109,
        MDet = 110,
        MWOut = 111,
        MWEnd = 112,
        MWrtWav = 113,
        MWrtEnv = 114,
        MLfo = 115,
        MSync = 116,
        MPCMReg = 117,
        MLfoD = 118,
        MBaseVol = 119,

        Mend = 255,

        //sync=0:非同期、1:同期、2:ワンショット 3:鋸波形
        LASync = 0,
        LSync = 1,
        LOneShot = 2,
        LSaw = 3,

        Envs = 16,
        PCMWavs = 16, // 96-111
        FadeMax = 256,

        div = function(x, y) {
            return Math.trunc(chkn(x,"x") / chkn(y,"y") );
        },
        chkn = function (x,mesg) {
            if (x!==x) throw new Error(mesg+": Not a number!");
            if (typeof x!=="number") {console.error(x);throw new Error(mesg+": Not a not a number but not a number!");}
            return x;
        },
        abs = Math.abs.bind(Math),
        ShortInt = function(b) {
            return b >= 128 ? b - 256 : b;
        },
        StrPas=function (ary,idx) {
            var a=[];
            for (var i=idx;ary[i];i++) {
                a.push(ary[i]);
            }
            return a;
        },
        array2Int= function (ary,idx) {
            var r=ary[idx];
            r+=ary[idx+1]*0x100;
            r+=ary[idx+2]*0x10000;
            r+=ary[idx+3]*0x1000000;
            if (r>=0x80000000) r-=0x100000000;
            return r;
        },
        Integer = Number,
        sinMax_s = 5,
        sinMax = 65536 >> sinMax_s, //2048,
        //SPS = 44100,
        SPS96 = 22050,
        /*SPS_60 = div(44100, 60),*/
        DivClock = 111860.78125,
        Loops = 163840,
//---------End include
        AtoG = [9,11,0,2,4,5,7],
        VDefault=65535,
        header=[100, 120, 101, 5, 110, 0, 102, 0, 107, 0, 115, 0, 0, 0, 118, 0, 116, 0],
        trailer=[255, 255, 255],
        Version=1200
        ;
    var tokenizer=new Grammar({
        space:/^\s*/,
    });
    var or=tokenizer.or;
    var rep0=tokenizer.rep0;
    //var singleTokens="[](){},_z";
    tokenizer.def({
        tokens: [rep0(or("-","&",";","[","]","(",")","{","}","z",",",
        "LWait","SoundEl","Num","Periods","@por","@pcm","StrOption",
        "SingleOption","LengthOption","OctShift","Value","String"
        )),/^\s*/,
        Grammar.P.StringParser.eof],
        "LWait": "''",
        "SoundEl": /^[a-gA-GrR^][\+\#\-]*/,
        "Num": /^[0-9]+/,
        "Periods": /^\.+/,
        "StrOption":or("'@com","'@wavout"),
        "SingleOption":or("'@endwav","'@dt-","'@si","'@so",
        "'@dt","'@label","'@jump","'@lfo","'@sync","'@v"
        ,"'o","'v=+","'v=-","'v","'n","'pm","'@","'t","'q","'ps","'pa"),
        "LengthOption": "'l",
        //or("'","'","'","'","'","'","'","'","'","'","'","'"),
        "OctShift": /^[<>]/,
        "Value": /^\$[a-zA-Z0-9]\$/,
        "String": /^"[^"]*"/,
        //---*Stop
        "@por":1,
        "@pcm":1,
        ",":1,
        "-":1,
        "&":1,
        ";":1,
        "[":1,
        "]":1,
        "(":1,
        ")":1,
        "{":1,
        "}":1,
        "z":1
    });
    var parser=new Grammar();
    var tk=Grammar.P.TokensParser.token;
    rep0=parser.rep0;
    or=parser.or;
    var opt=parser.opt;
    var sep1=parser.sep1;
    parser.def({
        mml: [rep0("Block"),Grammar.P.TokensParser.eof],
        Block: ["BlockHdr",tk("["),"Exs",tk("]")],
        BlockHdr: or("ChSel"),//"ValOnly"),
        ChSel: sep1("ChRange",tk(",")),
        ChRange: [tk("Num"),opt([tk("-"),tk("Num")])],
        Exs: rep0(or("replace","realsound","renpu","portament",
        "singleequ","stringequ","pcmreg",
        "tieslur","wait","reloct","setlen","toneshift","repts")),
        replace: tk("Value"),
        singleequ: [tk("SingleOption"),sep1(tk(","),"DefaultNum")],
        renpu: [tk("{"),rep0("SoundEl","relocts"),tk("}")],
        portament: [tk("@por"),"SoundEl","relocts","SoundEl","Length"],
        stringequ: [tk("StrOption"),tk("String")],
        pcmreg: [tk("@pcm"),tk("String"),tk(","),"DefaultNum"],
        tieslur: tk("&"),
        wait: tk("LWait"),
        setlen: [tk("LengthOption"),"Length"],
        toneshift: [tk("_"),rep0(tk("OctShift")),tk("SoundEl")],
        repts: [tk("("),"Exs",tk(")"),tk("Num")],
        reloct: tk("OctShift"),
        relocts: rep0("reloct"),
        realsound: [tk("SoundEl"),"Length"],
        Length: ["DefaultNum",opt(tk("Periods"))],
        "DefaultNum": [opt(tk("Num"))]
    });
    function int16toA(num,a) {
        a=a||[];
        if (num<0) num+=0x10000;
        a.push(num & 255);
        num=Math.floor(num/256);
        a.push(num & 255);
        return a;
    }
    function int32toA(num,a) {
        a=a||[];
        if (num<0) num+=0x100000000;
        a.push(num & 255);
        num=Math.floor(num/256);
        a.push(num & 255);
        num=Math.floor(num/256);
        a.push(num & 255);
        num=Math.floor(num/256);
        a.push(num & 255);
        return a;
    }
    function genCode(node) {
        var channels=[];
        var ChInfo;
        function selCh(ch) {
            console.log("Select ch #",ch);
            ChInfo=channels[ch-1];
            if (ChInfo) return ChInfo;
            ChInfo=channels[ch-1]={
                no:ch,
                buf:header.concat([]),
                Oct:4,
                Len:4
            };
            return ChInfo;
        }
        for(var i=0;i<10;i++) selCh(i+1);
        function wrt(d) {
            ChInfo.buf.push(d);
        }
        var v=Visitor({
            mml: function (node) {
                node[0].forEach(function (n) {
                    v.visit(n);
                });
            },
            DefaultNum: function (node) {
                if (!node[0])return VDefault;
                return node[0]+""-0;
            },
            Length: function (node) {
                var num=v.visit(node[0]);
                if (num===VDefault) num=ChInfo.Len;
                var periods=(node[1]+"").length;
                var a=div(SPS96,num);
                a=a*2-div(a, (1<<periods));
                return a;
            },
            realsound: function (node){
                var SoundEl=node[0]+"";
                var saval=SoundEl.toLowerCase();
                switch(saval) {
                case "r":
                    wrt(MRest);
                    break;
                case "^":
                    wrt(MSlur);
                    wrt(ChInfo.PrevRealSnd);
                    break;
                default:
                    ChInfo.PrevRealSnd=
                    AtoG[saval.charCodeAt(0)-
                    "a".charCodeAt(0)]+
                    ChInfo.Oct*12-12;
                    wrt(ChInfo.PrevRealSnd);
                }
                var li=v.visit(node[1]);
                console.log("Len",li);
                wrt(li & 255);
                wrt(div(li , 256));
            },
            ChSel: function (node) {
                var range=[];
                node.forEach(function (n) {
                    var f=n[0]+""-0;
                    var t=(n[1] ? n[1][1]+""-0  :f);
                    if (f>t) {
                        var c=f;f=t;t=c;
                    }
                    while(f<=t) {
                        range[f]=1;
                        f++;
                    }
                });
                return range;
            },
            Block: function (node) {
                //;
                var chsel=node[0];
                var chs=v.visit(chsel);
                console.log("chs",chs);
                chs.forEach(function (ch,i) {
                    if (!ch) return;
                    selCh(i);
                    node[2].forEach(function (n) {
                        v.visit(n);
                    });
                });
            },
        });
        v.def=function (node) {
            console.log(node && node.type, node);
        };
        v.visit(node);
        channels.forEach(function (channel) {
            channel.buf=channel.buf.concat(trailer);
        });
        console.log("channels",channels);
        var MPoint=channels.map(function (c) {return c.buf;});
        console.log("MPoint",MPoint);
        var mzo=[];
        int32toA(Version, mzo);
        mzo.push(channels.length);
        channels.forEach(function (channel) {
            int32toA(channel.buf.length,mzo);
            mzo=mzo.concat(channel.buf);
        });
        console.log("mzo",mzo);
        return mzo;
    }
    //     var r=tokenizer.get("tokens").parseStr("1[ @com\"hoge\" c2def fg<fedc ]");
    function parseMML(mml) {
        console.log("Input mml",mml);
        var r=tokenizer.get("tokens").parseStr(mml);
        if (!r.success) throw new Error("Syntax error(token) at "+r.src.maxPos);
        var tokens=r.result[0][0];
        console.log("tokenr",tokens.map((e)=>e+""));
        var r=parser.get("mml").parseTokens(tokens);
        console.log("parser",r);
        return genCode(r.result[0]);

    }
    //parseMML("1-3,5[ c2 def8 ]");
    return {
        parseMML:parseMML
    };
});
