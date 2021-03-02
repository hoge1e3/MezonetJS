define(["Grammar","Visitor","zfmExpr"],function (Grammar,Visitor,zfmExpr) {
//--- Also in SEnv
    var Ses = 10,
        Chs = 10,
        Regs = Chs * 3,
        WvElC = 32,
        WvC = 96,
        wdataSize = 44100,
        //   99=r 100=vol 101=ps (x*128)  255=end
        MRest = 99,
        MVol = 100,
        MPs = 101,
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
        MLabel = 120,
        MWrtWav2 =121,

        Mend = 255,

        //sync=0:非同期、1:同期、2:ワンショット 3:鋸波形
        LASync = 0,
        LSync = 1,
        LOneShot = 2,
        LSaw = 3,

        Envs = 16,
        PCMWavs = 16, // 96-111
        FadeMax = 256,
        ValDef=0x7fffffff,

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
        SPS96 = 22050*2,//    64*9*5*7==20160
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
    var space=(/^(\s*(\/\*\/?([^\/]|[^*]\/|\r|\n)*\*\/)*(((\/\/)|;).*\r?\n)*)*/);

    var tokenizer=new Grammar({
        space:space,
    });
    var or=tokenizer.or;
    var rep0=tokenizer.rep0;
    //var singleTokens="[](){},_z";
    tokenizer.def({
        tokens: [rep0(or("-","&",/*";",*/"[","]","(",")","{","}","_","zfm","z",",",
        "LWait","SoundEl","Num","Periods","@por","@pcm","StrOption",
        "SingleOption","LengthOption","OctShift","Value","String"
        )),/^\s*/,
        Grammar.P.StringParser.eof],
        "LWait": "''",
        "SoundEl": /^[a-gA-GrR\^][\+\#\-]*/,
        "Num": /^[0-9]+/,
        "Periods": /^\.+/,
        "StrOption":or("'@com","'@wavout"),
        "SingleOption":or("'@endwav","'@dt-","'@si","'@so",
        "'@dt","'@label","'@jump","'@lfo","'@sync","'@v",
        "'o","'v=+","'v=-","'v","'n","'pm","'@","'t","'q","'ps","'pa"),
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
        "_":1,
        "z":/^[zZ]/,
        "zfm":/^zfm/,
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
        BlockHdr: or("ChSel","ValOnly"),
        ValOnly: [tk("Value")],
        ChSel: sep1("ChRange",tk(",")),
        ChRange: [tk("Num"),opt([tk("-"),tk("Num")])],
        Exs: rep0(or("replace","realsound","renpu","portament",
        "singleequ","stringequ","pcmreg",
        "tieslur","wait","reloct","setlen","toneshift","repts","zfm","z")),
        replace: [tk("Value")],
        singleequ: [tk("SingleOption"),sep1("DefaultNum",tk(","))],
        renpu: [tk("{"),rep0(tk("SoundEl"),"relocts"),tk("}")],
        portament: [tk("@por"),tk("SoundEl"),"relocts",tk("SoundEl"),"Length"],
        stringequ: [tk("StrOption"),tk("String")],
        pcmreg: [tk("@pcm"),tk("String"),tk(","),"DefaultNum"],
        tieslur: [tk("&")],
        wait: [tk("LWait")],
        setlen: [tk("LengthOption"),"Length"],
        toneshift: [tk("_"),rep0(tk("OctShift")),tk("SoundEl")],
        repts: [tk("("),"Exs",tk(")"),tk("Num")],
        reloct: tk("OctShift"),
        relocts: rep0("reloct"),
        realsound: [tk("SoundEl"),"Length"],
        Length: ["DefaultNum",opt(tk("Periods"))],
        "DefaultNum": [opt(tk("Num"))],
        z: [tk("z"),tk("SingleOption"),tk("Num"), rep0([tk(","), tk("Num")])],
        zfm: [tk("zfm"),tk("SingleOption"),tk("Num"), tk(","), tk("Num"), tk(","), tk("String")],
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
            //console.log("Select ch #",ch);
            ChInfo=channels[ch-1];
            if (ChInfo) return ChInfo;
            ChInfo=channels[ch-1]={
                no:ch,
                buf:header.concat([]),
                Oct:4,
                Len:div(SPS96,4),
                Lbf:[],
                Lbl:[],
                VolShift:0,
                toneShift:0,
            };
            return ChInfo;
        }
        function fillLabels() {
            for (let i=0;i<Chs;i++) {
                var ChInfo=channels[i];
                for (let LbElem of ChInfo.Lbf) {
                    var ofs=ChInfo.Lbl[LbElem.LbNum]-LbElem.Pos;
                    var repl=int32toA(ofs);
                    var WmBuffer=ChInfo.buf;
                    WmBuffer.splice.apply(WmBuffer,
                        [LbElem.Pos+1,4].concat(repl));
                }
            }
        }
        function saveChInfo() {
            var s={};
            for (var k in ChInfo) {
                s[k]=ChInfo[k];
            }
            return s;
        }
        function restoreChInfo(s) {
            for (var k in s) {
                ChInfo[k]=s[k];
            }
            return ChInfo;
        }
        for(var i=0;i<10;i++) selCh(i+1);
        function wrt(d) {
            ChInfo.buf.push(d);
        }
        function wrt16(d) {
            int16toA(d,ChInfo.buf);
        }
        function wrt32(d) {
            int32toA(d,ChInfo.buf);
        }
        function chkRange(val,min,max,mesg) {
            if (val>=min && val<=max) return val;
            throw new Error("Out of range for "+mesg+": "+val);
        }
        function parseRealsound(saval,ChInfo) {
            let res=AtoG[saval.charCodeAt(0)-
            "a".charCodeAt(0)]+
            ChInfo.Oct*12-12+ChInfo.toneShift;
            for (var i=0;i<saval.length;i++) {
                switch (saval[i]) {
                case "+":case "#": res++;break;
                case "-":res--;break;
                }
            }
            chkRange(res, 0, 95, "tone");
            return res;
        }
        var LastValue,ValueList={},ValDepth=0;
        var v=Visitor({
            toneshift: function (node) {
                const oct=node[1].map(e=>e[0]);
                const real=node[2][0];
                let r=parseRealsound(real, ChInfo);
                for (let o of oct) {
                    if (o===">") r+=12;
                    if (o==="<") r-=12;
                }
                ChInfo.toneShift=r-(ChInfo.Oct-1)*12;
                //console.log(ChInfo.toneShift);
            },
            mml: function (node) {
                node[0].forEach(function (n) {
                    v.visit(n);
                });
                fillLabels();
            },
            OctShift: function (node) {
                if (node+""===">") ChInfo.Oct++;
                if (node+""==="<") ChInfo.Oct--;
                chkRange(ChInfo.Oct,1,8,"o");
            },
            relocts: function (node) {
                node.forEach(function (e) {v.visit(e);});
            },
            setlen: function (node) {
                ChInfo.Len=v.visit(node[1]);
                //console.log("setlen",node,ChInfo.Len);
            },
            DefaultNum: function (node) {
                if (!node[0])return VDefault;
                return node[0]+""-0;
            },
            Length: function (node) {
                var num=v.visit(node[0]),a;
                if (num===VDefault) a=ChInfo.Len;
                else a=div(SPS96,num);
                var periods=node[1] ? (node[1]+"").length : 0;
                a=a*2-div(a, (1<<periods));

                return a;
            },
            singleequ: function (node) {
                var sa=(node[0]+"").toLowerCase();
                var b=v.visit(node[1][0]);
                //console.log("singleequ",node, sa,b);
                if (b!=VDefault) {
                    switch(sa) {
                        case "o":
                        ChInfo.Oct=chkRange(b,1,8,sa);
                        break;
                        case "t":
                        wrt(MTempo);
                        wrt16(chkRange(b,32,1023,sa));
                        break;
                        case "v":
                        case "@v":
                        if (sa==="v") b*=8;
                        b+=ChInfo.VolShift;
                        chkRange(b,0,127,sa);
                        wrt(MVol);
                        wrt(b);
                        break;
                        case "v=+":
                        case "v=-":
                        break;
                        case "@":
                        // zCmd
                        wrt(MSelWav);
                        wrt(chkRange(b,0,95,sa));
                        break;
                        case "@label":
                        ChInfo.Lbl[b]=ChInfo.buf.length;
                        wrt(MLabel);
                        wrt(b);
                        break;
                        case "@jump":
                        ChInfo.Lbf.push({
                            LbNum:b,
                            Pos:ChInfo.buf.length
                        });
                        wrt(MJmp);
                        wrt32(5);
                        break;
                        case 'pa':
                        chkRange(b,0,15,sa);
                        // ZCmd
                        wrt(MSelEnv);
                        wrt(b);
                        break;
                        case 'ps':
                        chkRange(b,0,100,sa);
                        wrt(MPs);
                        wrt(b);
                        break;
                        case '@lfo':
                        var lfoSync=node[1][0]?v.visit(node[1][0]):0;
                        var lfov=node[1][1]?v.visit(node[1][1]):0;
                        var lfoa=node[1][2]?v.visit(node[1][2]):0;
                        var lfod=node[1][3]?v.visit(node[1][3]):0;
                        chkRange(lfov,0,127,"lfo-velocity");
                        chkRange(lfoa,0,127,"lfo-amplitude");
                        chkRange(lfod,0,255,"lfo-delay");
                        //console.log("@lfo",lfov,lfoa,lfod);
                        wrt(MLfo);wrt(lfoSync);wrt(lfov);wrt(lfoa);
                        wrt(MLfoD);wrt(lfod);
                        break;
                        case '@dt':
                        wrt(MDet);chkRange(b,0,127,sa);
                        wrt(b);
                        break;
                        case '@dt-':
                        wrt(MDet);chkRange(b,0,127,sa);
                        wrt(-b);
                        break;

                    }
                } else {
                    //endwav
                    //lfo
                }
            },
            tieslur: function (node) {
                wrt(MSlur);
            },
            realsound: function (node){
                var SoundEl=node[0]+"";
                var saval=SoundEl.toLowerCase();
                switch(saval[0]) {
                    case "r":
                        wrt(MRest);
                        break;
                    case "^":
                        wrt(MSlur);
                        wrt(ChInfo.PrevRealSnd);
                        break;
                    default:
                        ChInfo.PrevRealSnd=parseRealsound(saval, ChInfo);
                        /*AtoG[saval.charCodeAt(0)-
                        "a".charCodeAt(0)]+
                        ChInfo.Oct*12-12+ChInfo.toneShift;
                        for (var i=0;i<saval.length;i++) {
                            switch (saval[i]) {
                            case "+":case "#": ChInfo.PrevRealSnd++;break;
                            case "-":ChInfo.PrevRealSnd--;break;
                            }
                        }
                        chkRange(ChInfo.PrevRealSnd,0,95,"tone");*/
                        wrt(ChInfo.PrevRealSnd);
                }
                var li=v.visit(node[1]) ;
                //console.log("Len",li);
                wrt(li & 255);
                wrt(div(li , 256));
            },
            zfm: function (node) {
                //console.log("z",node);
                const idx=node[2][0]-0;
                chkRange(idx, 0,95, "z@n");
                const len=node[4][0]-0;
                const expr=node[6][0].replace(/\"/g,"");
                //console.log("zfm",idx,len, expr);
                const f=zfmExpr(expr);
                wrt(MWrtWav2);
                wrt(idx);
                wrt(len & 255);
                wrt(len>>8);
                wrt(1); // l=1, reserved.  lamda=len/l
                for (let i=0; i<len;i++) {
                    wrt(f(i/len)*128+128);
                }
            },
            z: function (node) {
                //console.log("z",node);
                const idx=node[2][0]-0;
                chkRange(idx, 0,95, "z@n");
                const wave=node[3];
                wrt(MWrtWav);
                wrt(idx);
                //console.log("z@",idx);
                for (let i=0; i<32;i++) {
                    if (!wave[i]) wrt(128);
                    else wrt(wave[i][1]-0);
                }
            },
            portament: function (node) {
                //console.log("POR", node);
                var from=node[1]+"";// token cdefgab
                var relOcts=node[2];//array of token ">" or "<"
                var to=node[3]+"";// token cdefgab
                var li=v.visit(node[4]) ; // length
                var fromN=parseRealsound(from,ChInfo);// AtoG[from.charCodeAt(0)-"a".charCodeAt(0)]+ChInfo.Oct*12-12+ChInfo.toneShift;
                //chkRange(fromN,0,95,"@por from");
                v.visit(relOcts);
                var toN=parseRealsound(to,ChInfo);//AtoG[to.charCodeAt(0)-"a".charCodeAt(0)]+ChInfo.Oct*12-12+ChInfo.toneShift;
                //chkRange(toN,0,95,"@por to");

                wrt(MPor);
                wrt(fromN);wrt(toN);
                wrt(li & 255);
                wrt(div(li , 256));

                /*
                console.log(fromN,  relOcts, toN , li);
                sa:=PLexType(r.LItems[1]);  // SoundEl
                tmpt:=sa^.val+ChInfo.Oct*12-12+ChInfo.ToneShift;
                if tmpt<0 then tmpt:=0;
                if tmpt>95 then tmpt:=95;
                WmBuffer.Add (tmpt);

                ChkLeak:=GramOnEnd (r.Items[2]);
                if (ChkLeak<>nil) then ShowMessage ('Memory Leaked7');

                sa:=PLexType(r.LItems[3]);  // SoundEl
                tmpt:=sa^.val+ChInfo.Oct*12-12+ChInfo.ToneShift;
                if tmpt<0 then tmpt:=0;
                if tmpt>95 then tmpt:=95;
                WmBuffer.Add (tmpt);
                {if sa^.val<0 then WmBuffer.Add (MRest)
                else WmBuffer.Add (sa^.val+ChInfo.Oct*12-12);}


                var li=v.visit(node[4]) ; // length
                wrt(li & 255);
                wrt(div(li , 256));

                */
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
            Exs: function (node) {
                node.forEach(function (n) {
                    v.visit(n);
                });
            },
            Block: function (node) {
                //;
                var chsel=node[0];
                var chs=v.visit(chsel);
                if (chs===ValDef) {
                    ValueList[LastValue]=node[2];
                    return;
                }
                //console.log("chs",chs);

                chs.forEach(function (ch,i) {
                    if (!ch) return;
                    selCh(i);
                    v.visit(node[2]);
                });
            },
            ValOnly: function(node) {
                LastValue=node[0]+"";
                return ValDef;
            },
            replace: function (node) {
                var n=node[0]+"";
                ValDepth++;
                if (ValDepth>16)
                   throw new Error('マクロ参照が複雑すぎます');
                var vn=ValueList[n];
                if (!vn) {
                    throw new Error('マクロ'+n+'は定義されていません');
                }
                v.visit(vn);
                ValDepth--;
            },
            repts: function (node) {
                var times=node[3]+""-0;
                var expr=node[1];
                //console.log("repts",times,expr);
                var sv=saveChInfo();
                for (var i=0;i<times;i++) {
                    restoreChInfo(sv);
                    v.visit(expr);
                }
            },
            wait: function (node) {
                wrt(MWait);
            }
        });
        v.def=function (node) {
            console.log("Undef node:",node && node.type, node);
        };
        v.visit(node);
        channels.forEach(function (channel) {
            channel.buf=channel.buf.concat(trailer);
        });
        //console.log("channels",channels);
        var MPoint=channels.map(function (c) {return c.buf;});
        //console.log("MPoint",MPoint);
        var mzo=[];
        int32toA(Version, mzo);
        mzo.push(channels.length);
        channels.forEach(function (channel) {
            int32toA(channel.buf.length,mzo);
            mzo=mzo.concat(channel.buf);
        });
        //console.log("mzo",mzo);
        return mzo;
    }
    //     var r=tokenizer.get("tokens").parseStr("1[ @com\"hoge\" c2def fg<fedc ]");
    function parseMML(mml) {
        mml+="\n";
        //console.log("Input mml",mml);
        let r;
        r=tokenizer.get("tokens").parseStr(mml);
        if (!r.success) throw new Error("Syntax error(token) at "+r.src.maxRow+":"+r.src.maxCol);
        const tokens=r.result[0][0];
        //console.log("tokenr",tokens.map((e)=>e+""));
        r=parser.get("mml").parseTokens(tokens);
        if (!r.success) {
            const maxt=tokens[r.src.maxPos];
            //console.log(maxt);
            throw new Error("Syntax error at "+(maxt && maxt.row+":"+maxt.col));
        }
        //console.log("parser",r);
        return genCode(r.result[0]);

    }

    //parseMML("1-3,5[ c2 def8 ]");
    return {
        parseMML:parseMML
    };
});
