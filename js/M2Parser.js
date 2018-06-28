define(["Grammar","Visitor"],function (Grammar,Visitor) {
    var VDefault=65535;
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
        )),
        Grammar.P.StringParser.eof],
        "LWait": "''",
        "SoundEl": /^[a-gA-G][\+\#\-]*/,
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
    //     var r=tokenizer.get("tokens").parseStr("1[ @com\"hoge\" c2def fg<fedc ]");
    var r=tokenizer.get("tokens").parseStr("1-3,5[ c2 def8 ]");
    var tokens=r.result[0][0];
    console.log("tokenr",tokens.map((e)=>e+""));
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
        "DefaultNum": opt(tk("Num"))/*.ret(function (r) {
            if (r==null) return VDefault;
            return r+""-0;
        })*/
    });
    var r=parser.get("mml").parseTokens(tokens);
    console.log("parser",r);
    (function (node) {
        var channels=[];
        var curch;
        function selCh(ch) {
            console.log("Select ch #",ch);
            var r=channels[ch];
            if (r) return r;
            r=channels[ch]={
                no:ch,
                buf:[]
            };
            return r;
        }
        var v=Visitor({
            mml: function (node) {
                node[0].forEach(function (n) {
                    v.visit(n);
                });
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
    })(r.result[0]);
});
