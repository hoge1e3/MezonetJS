define([], function () {
    var FuncUtil={};
    FuncUtil.getParams=FuncUtil.getArgs=function getParams(f) {
        var fpat=/function[^\(]*\(([^\)]*)\)/;
        var r=fpat.exec(f+"");
        if (r) {
            return r[1].replace(/\s/g,"").split(",");
        }
        return [];
    };
    FuncUtil.wrap=function (f, wrapper,opt) {
        if (typeof of==="string") opt={name:opt};
        opt=opt||{};
        opt.name=opt.name||"FuncUtil.wrap";
        var res=wrapper;//(f,opt);
        var str=f.toString();
        str=str.replace(/\}\s*$/,"/*Wrapped by "+opt.name+"*/\n}");
        res.toString=function () {
            return str;
        };
        return res;
    };
    FuncUtil.withBindings=function (src,bindings) {
        var n=[],v=[];
        for (var k in bindings) {
            n.push(k);v.push(bindings[k]);
        }
        n.push("return "+src+";");
        try {
            var f=Function.apply(null,n);
            return f.apply(this, v);
        } catch(e) {
            console.log("FuncUtil.withBindings ERR",src);
            throw e;
        }
    };
    FuncUtil.multiArg=function (f) {
        var len=FuncUtil.getParams(f).length;
        var lastidx=len-1;
        return (function () {
            var a=Array.prototype.slice.call(arguments);
            if (a.length>lastidx) {
                // a=[1,3,5,7]   f=(a,b,rest)
                // lastidx=2
                // a=[1,3,[5,7]]
                var va=a.splice(lastidx);
                a.push(va);
            } else {
                a[lastidx]=[];
            }
            return f.apply(this,a);
        });//,"FuncUtil::multiArg");
    };
    FuncUtil.macro=function (f,options) {
        options=options||{};
        options.stripfunc=false;
        var s=FuncUtil.heredoc(f,options);
        return FuncUtil.withBindings(s,options.bindings);
    };
    FuncUtil.heredoc=function (f,options) {
        options=options||{};
        var body=(f+"");
        if (options.stripfunc!==false) {
            body=body.replace(/^\s*function[^\{]*\{/,"").replace(/\}\s*$/,"");
        }
        if (options.stripcomment) {
            body=body.replace(/^\s*\/\*/,"");
            body=body.replace(/^\*\/\s*$/,"");
        }
        if (options.replace) {
            for (var k in options.replace) {
                body=body.replace(new RegExp(k,"g"),options.replace[k]);
            }
        }
        return body;
    };

    return FuncUtil;
});
