var requirejs,require,define;(function(undef){var main,req,makeMap,handlers,defined={},waiting={},config={},defining={},hasOwn=Object.prototype.hasOwnProperty,aps=[].slice,jsSuffixRegExp=/\.js$/;function hasProp(obj,prop){return hasOwn.call(obj,prop)}function normalize(name,baseName){var nameParts,nameSegment,mapValue,foundMap,lastIndex,foundI,foundStarMap,starI,i,j,part,normalizedBaseParts,baseParts=baseName&&baseName.split("/"),map=config.map,starMap=map&&map["*"]||{};if(name){name=name.split("/");lastIndex=name.length-1;if(config.nodeIdCompat&&jsSuffixRegExp.test(name[lastIndex])){name[lastIndex]=name[lastIndex].replace(jsSuffixRegExp,"")}if(name[0].charAt(0)==="."&&baseParts){normalizedBaseParts=baseParts.slice(0,baseParts.length-1);name=normalizedBaseParts.concat(name)}for(i=0;i<name.length;i++){part=name[i];if(part==="."){name.splice(i,1);i-=1}else if(part===".."){if(i===0||i===1&&name[2]===".."||name[i-1]===".."){continue}else if(i>0){name.splice(i-1,2);i-=2}}}name=name.join("/")}if((baseParts||starMap)&&map){nameParts=name.split("/");for(i=nameParts.length;i>0;i-=1){nameSegment=nameParts.slice(0,i).join("/");if(baseParts){for(j=baseParts.length;j>0;j-=1){mapValue=map[baseParts.slice(0,j).join("/")];if(mapValue){mapValue=mapValue[nameSegment];if(mapValue){foundMap=mapValue;foundI=i;break}}}}if(foundMap){break}if(!foundStarMap&&starMap&&starMap[nameSegment]){foundStarMap=starMap[nameSegment];starI=i}}if(!foundMap&&foundStarMap){foundMap=foundStarMap;foundI=starI}if(foundMap){nameParts.splice(0,foundI,foundMap);name=nameParts.join("/")}}return name}function makeRequire(relName,forceSync){return function(){var args=aps.call(arguments,0);if(typeof args[0]!=="string"&&args.length===1){args.push(null)}return req.apply(undef,args.concat([relName,forceSync]))}}function makeNormalize(relName){return function(name){return normalize(name,relName)}}function makeLoad(depName){return function(value){defined[depName]=value}}function callDep(name){if(hasProp(waiting,name)){var args=waiting[name];delete waiting[name];defining[name]=true;main.apply(undef,args)}if(!hasProp(defined,name)&&!hasProp(defining,name)){throw new Error("No "+name)}return defined[name]}function splitPrefix(name){var prefix,index=name?name.indexOf("!"):-1;if(index>-1){prefix=name.substring(0,index);name=name.substring(index+1,name.length)}return[prefix,name]}function makeRelParts(relName){return relName?splitPrefix(relName):[]}makeMap=function(name,relParts){var plugin,parts=splitPrefix(name),prefix=parts[0],relResourceName=relParts[1];name=parts[1];if(prefix){prefix=normalize(prefix,relResourceName);plugin=callDep(prefix)}if(prefix){if(plugin&&plugin.normalize){name=plugin.normalize(name,makeNormalize(relResourceName))}else{name=normalize(name,relResourceName)}}else{name=normalize(name,relResourceName);parts=splitPrefix(name);prefix=parts[0];name=parts[1];if(prefix){plugin=callDep(prefix)}}return{f:prefix?prefix+"!"+name:name,n:name,pr:prefix,p:plugin}};function makeConfig(name){return function(){return config&&config.config&&config.config[name]||{}}}handlers={require:function(name){return makeRequire(name)},exports:function(name){var e=defined[name];if(typeof e!=="undefined"){return e}else{return defined[name]={}}},module:function(name){return{id:name,uri:"",exports:defined[name],config:makeConfig(name)}}};main=function(name,deps,callback,relName){var cjsModule,depName,ret,map,i,relParts,args=[],callbackType=typeof callback,usingExports;relName=relName||name;relParts=makeRelParts(relName);if(callbackType==="undefined"||callbackType==="function"){deps=!deps.length&&callback.length?["require","exports","module"]:deps;for(i=0;i<deps.length;i+=1){map=makeMap(deps[i],relParts);depName=map.f;if(depName==="require"){args[i]=handlers.require(name)}else if(depName==="exports"){args[i]=handlers.exports(name);usingExports=true}else if(depName==="module"){cjsModule=args[i]=handlers.module(name)}else if(hasProp(defined,depName)||hasProp(waiting,depName)||hasProp(defining,depName)){args[i]=callDep(depName)}else if(map.p){map.p.load(map.n,makeRequire(relName,true),makeLoad(depName),{});args[i]=defined[depName]}else{throw new Error(name+" missing "+depName)}}ret=callback?callback.apply(defined[name],args):undefined;if(name){if(cjsModule&&cjsModule.exports!==undef&&cjsModule.exports!==defined[name]){defined[name]=cjsModule.exports}else if(ret!==undef||!usingExports){defined[name]=ret}}}else if(name){defined[name]=callback}};requirejs=require=req=function(deps,callback,relName,forceSync,alt){if(typeof deps==="string"){if(handlers[deps]){return handlers[deps](callback)}return callDep(makeMap(deps,makeRelParts(callback)).f)}else if(!deps.splice){config=deps;if(config.deps){req(config.deps,config.callback)}if(!callback){return}if(callback.splice){deps=callback;callback=relName;relName=null}else{deps=undef}}callback=callback||function(){};if(typeof relName==="function"){relName=forceSync;forceSync=alt}if(forceSync){main(undef,deps,callback,relName)}else{setTimeout(function(){main(undef,deps,callback,relName)},4)}return req};req.config=function(cfg){return req(cfg)};requirejs._defined=defined;define=function(name,deps,callback){if(typeof name!=="string"){throw new Error("See almond README: incorrect module build, no module name")}if(!deps.splice){callback=deps;deps=[]}if(!hasProp(defined,name)&&!hasProp(waiting,name)){waiting[name]=[name,deps,callback]}};define.amd={jQuery:true}})();

define("almond", function(){});

define('assert',[],function () {
    var Assertion=function(failMesg) {
        this.failMesg=flatten(failMesg || "Assertion failed: ");
    };
    var $a;
    Assertion.prototype={
        _regedType:{},
        registerType: function (name,t) {
            this._regedType[name]=t;
        },
        MODE_STRICT:"strict",
        MODE_DEFENSIVE:"defensive",
        MODE_BOOL:"bool",
        fail:function () {
            var a=$a(arguments);
            var value=a.shift();
            a=flatten(a);
            a=this.failMesg.concat(value).concat(a);//.concat(["(mode:",this._mode,")"]);
            console.log.apply(console,a);
            if (this.isDefensive()) return value;
            if (this.isBool()) return false;
            throw new Error(a.join(" "));
        },
        subAssertion: function () {
            var a=$a(arguments);
            a=flatten(a);
            return new Assertion(this.failMesg.concat(a));
        },
        assert: function (t,failMesg) {
            if (!t) return this.fail(t,failMesg);
            return t;
        },
        eq: function (a,b) {
            if (a!==b) return this.fail(a,"!==",b);
            return this.isBool()?true:a;
        },
        ne: function (a,b) {
            if (a===b) return this.fail(a,"===",b);
            return this.isBool()?true:a;
        },
        isset: function (a, n) {
            if (a==null) return this.fail(a, (n||"")+" is null/undef");
            return this.isBool()?true:a;
        },
        is: function (value,type) {
            var t=type,v=value;
            if (t==null) {
                return this.fail(value, "assert.is: type must be set");
                // return t; Why!!!!???? because is(args,[String,Number])
            }
            if (t._assert_func) {
                t._assert_func.apply(this,[v]);
                return this.isBool()?true:value;
            }
            this.assert(value!=null,[value, "should be ",t]);
            if (t instanceof Array || (typeof global=="object" && typeof global.Array=="function" && t instanceof global.Array) ) {
                if (!value || typeof value.length!="number") {
                    return this.fail(value, "should be array:");
                }
                var self=this;
                for (var i=0 ;i<t.length; i++) {
                    var na=self.subAssertion("failed at ",value,"[",i,"]: ");
                    if (t[i]==null) {
                        console.log("WOW!7", v[i],t[i]);
                    }
                    na.is(v[i],t[i]);
                }
                return this.isBool()?true:value;
            }
            if (t===String || t=="string") {
                this.assert(typeof(v)=="string",[v,"should be a string "]);
                return this.isBool()?true:value;
            }
            if (t===Number || t=="number") {
                this.assert(typeof(v)=="number",[v,"should be a number"]);
                return this.isBool()?true:value;
            }
            if (t===Boolean || t=="boolean") {
                this.assert(typeof(v)=="boolean",[v,"should be a boolean"]);
                return this.isBool()?true:value;
            }
            if (t instanceof RegExp || (typeof global=="object" && typeof global.RegExp=="function" && t instanceof global.RegExp)) {
                this.is(v,String);
                this.assert(t.exec(v),[v,"does not match to",t]);
                return this.isBool()?true:value;
            }
            if (t===Function) {
                this.assert(typeof v=="function",[v,"should be a function"]);
                return this.isBool()?true:value;
            }
            if (typeof t=="function") {
                this.assert((v instanceof t),[v, "should be ",t]);
                return this.isBool()?true:value;
            }
            if (t && typeof t=="object") {
                for (var k in t) {
                    var na=this.subAssertion("failed at ",value,".",k,":");
                    na.is(value[k],t[k]);
                }
                return this.isBool()?true:value;
            }
            if (typeof t=="string") {
                var ty=this._regedType[t];
                if (ty) return this.is(value,ty);
                //console.log("assertion Warning:","unregistered type:", t, "value:",value);
                return this.isBool()?true:value;
            }
            return this.fail(value, "Invaild type: ",t);
        },
        ensureError: function (action, err) {
            try {
                action();
            } catch(e) {
                if(typeof err=="string") {
                    assert(e+""===err,action+" thrown an error "+e+" but expected:"+err);
                }
                console.log("Error thrown successfully: ",e.message);
                return;
            }
            this.fail(action,"should throw an error",err);
        },
        setMode:function (mode) {
            this._mode=mode;
        },
        isDefensive:function () {
            return this._mode===this.MODE_DEFENSIVE;
        },
        isBool:function () {
            return this._mode===this.MODE_BOOL;
        },
        isStrict:function () {
            return !this.isDefensive() && !this.isBool();
        }
    };
    $a=function (args) {
        var a=[];
        for (var i=0; i<args.length ;i++) a.push(args[i]);
        return a;
    };
    var top=new Assertion();
    var assert=function () {
        try {
            return top.assert.apply(top,arguments);
        } catch(e) {
            throw new Error(e.stack);
        }
    };
    ["setMode","isDefensive","is","isset","ne","eq","ensureError"].forEach(function (m) {
        assert[m]=function () {
            try {
                return top[m].apply(top,arguments);
            } catch(e) {
                console.log(e.stack);
                //if (top.isDefensive()) return arguments[0];
                //if (top.isBool()) return false;
                throw new Error(e.message);
            }
        };
    });
    assert.fail=top.fail.bind(top);
    assert.MODE_STRICT=top.MODE_STRICT;
    assert.MODE_DEFENSIVE=top.MODE_DEFENSIVE;
    assert.MODE_BOOL=top.MODE_BOOL;
    assert.f=function (f) {
        return {
            _assert_func: f
        };
    };
    assert.opt=function (t) {
        return assert.f(function (v) {
            return v==null || v instanceof t;
        });
    };
    assert.and=function () {
        var types=$a(arguments);
        assert(types instanceof Array);
        return assert.f(function (value) {
            var t=this;
            for (var i=0; i<types.length; i++) {
                t.is(value,types[i]);
            }
        });
    };
    function flatten(a) {
        if (a instanceof Array) {
            var res=[];
            a.forEach(function (e) {
                res=res.concat(flatten(e));
            });
            return res;
        }
        return [a];
    }
    function isArg(a) {
        return "length" in a && "caller" in a && "callee" in a;
    };
    return assert;
});

define('FuncUtil',[], function () {
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

define('Klass',["assert","FuncUtil"],function (A,FuncUtil) {
    var Klass={};
    var F=FuncUtil;
    Klass.define=function (pd) {
        var p,parent;
        var SYM_GETP="_"+Math.random(),presult,className="AnonClass";
        if (pd.$parent) {
            parent=pd.$parent;
            p=Object.create(parent.prototype);
            /*p.super=F.multiArg(function (a) {
                var n=a.shift();
                return parent.prototype[n].apply(this,a);
            });*/
        } else {
            p={};
        }
        var specialParams={"super":"$super","rest":"$rest"};
        if (pd.$super) {
            specialParams.super=pd.$super;
        }
        if (pd.$this) {
            specialParams.self=pd.$this;
        }
        if (pd.$singleton) {
            specialParams.singleton=pd.$singleton;
        }
        if (pd.$privates) {
            specialParams.privates=pd.$privates;
        }
        if (pd.$rest) {
            specialParams.rest=pd.$rest;
        }
        if (pd.$name) className=pd.$name;
        var klass=(function () {
            if (! (this instanceof klass)) {
                return klass.apply(Object.create(klass.prototype),arguments);
            }
            addGetPrivates(this);
            //A.eq(typeof this[SYM_GETP],"function");
            init.apply(this,arguments);
            checkSchema(this);
            return this;
        });
        var init=wrap("$") || (parent?  parent : function (e) {
            if (e && typeof e=="object") {
                for (var k in e) {
                    this[k]=e[k];
                }
            }
        });
        var fldinit;
        var check;
        if (init instanceof Array) {
            fldinit=init;
            init=(function () {
                var a=Array.prototype.slice.call(arguments);
                for (var i=0;i<fldinit.length;i++) {
                    if (a.length>0) this[fldinit[i]]=a.shift();
                }
            });
        }
        function getPrivates(o) {
            //console.log(name,o,SYM_GETP,o[SYM_GETP]);
            o[SYM_GETP]();
            return presult;
        }
        function addGetPrivates(o) {
            var _p={};
            Object.defineProperty(o,SYM_GETP,{
                value: function () {return presult=_p;},
                enumerable: false
            });
        }
        function checkSchema(self) {
            if (pd.$fields) {
                //console.log("Checking schema",self,pd.$fields);
                A.is(self,pd.$fields);
            }
        }
        if (parent) {
            klass.super=FuncUtil.multiArg(function (t,n,a) {
                return parent.prototype[n].apply(t,a);
            });
        }
        klass.inherit=function (pd) {
            pd.$parent=klass;
            return Klass.define(pd);
        };
        klass.prototype=p;
        if (parent) klass.superClass=parent;
        var staticPrefix="static$";
        var staticPrefixLen=staticPrefix.length;
        for (var name in pd) {
            if (name[0]=="$") continue;
            if (name.substring(0,staticPrefixLen)==staticPrefix) {
                klass[name.substring(staticPrefixLen)]=wrap(name);
            } else {
                if (isPropDesc(pd[name])) {
                    Object.defineProperty(p,name,wrap(name));
                } else {
                    p[name]=wrap(name);
                }
            }
        }
        function wrap(name,obj) {
            obj=obj||pd;
            //if (!thisName) return m;
            var m=obj[name];
            if (isPropDesc(m)) {
                for (var k in m) {
                    m[k]=wrap(k,m);
                }
                return m;
            }
            if (typeof m!=="function") return m;
            var params=FuncUtil.getParams(m);
            if (params[params.length-1]===specialParams.rest) {
                m=FuncUtil.multiArg(m);
            }
            var argparse=[];
            while (params.length) {
                var n=params.shift();
                if (n===specialParams.super) {
                    argparse.unshift(function () {
                        return superMethod.bind(this);
                    });
                } else if (n===specialParams.self) {
                    argparse.unshift(function () {
                        return this;
                    });
                } else if (n===specialParams.singleton) {
                    argparse.unshift(function () {
                        return (klass);
                    });
                } else if (n===specialParams.privates) {
                    argparse.unshift(function () {
                        return getPrivates(this);
                    });
                } else {
                    params.unshift(n);
                    break;
                }
            }
            if (argparse.length===0) return m;
            var superMethod=parent ? (
                name==="$" ? parent: (
                    parent.prototype[name] ||
                    function (){
                        throw new Error("method (Super class of "+className+")::"+name+" not found.");
                    }
                )
            ):function (){
                 throw new Error("Class "+className+" does not have superclass");
            };

            return (function () {
                var a=Array.prototype.slice.call(arguments);
                var self=this;
                argparse.forEach(function (f) {
                    a.unshift(f.call(self));
                });
                return m.apply(this,a);
            });

            //console.log("PARAMS",className,name,params);
            var code="";
            while (params.length) {
                var n=params.shift();
                if (n===specialParams.super) {
                    code=F.heredoc(function () {
                        var self=this;
                        args.unshift(function () {
                            return superMethod.apply(self,arguments);
                        });
                    })+code;
                } else if (n===specialParams.self) {
                    code=F.heredoc(function () {
                        args.unshift(this);
                    })+code;
                } else if (n===specialParams.singleton) {
                    code=F.heredoc(function () {
                        args.unshift(klass);
                    })+code;
                } else if (n===specialParams.privates) {
                    code=F.heredoc(function () {
                        /*console.log("klass",name,klass);
                        A.is(this,klass);
                        A.eq(typeof this[SYM_GETP],"function");*/
                        args.unshift(getPrivates(this));
                    })+code;
                } else {
                    params.unshift(n);
                    break;
                }
            }
            return F.macro(function NAME(P) {
                var args=Array.prototype.slice.call(arguments);
                //CODE
                return m.apply(this,args);
            },{
                replace:{P: params.join(","),"//CODE":code,NAME:name},
                bindings:{
                    m: m,
                    name: name,
                    klass:klass,
                    superMethod: parent ? (
                        name==="$" ? parent: (
                            parent.prototype[name] ||
                            function (){ throw new Error("method (Super class of "+className+")::"+name+" not found.");  }
                        )
                    ):function (){ throw new Error("Class "+className+" does not have superclass");  },
                    getPrivates: getPrivates,
                    A: A,
                    SYM_GETP: SYM_GETP,
                    console: console
                }
            });
        }
        p.$=init;
        Object.defineProperty(p,"$bind",{
            get: function () {
                if (!this.__bounded) {
                    this.__bounded=new Klass.Binder(this);
                }
                return this.__bounded;
            }
        });
        return klass;
    };
    function isPropDesc(o) {
        if (typeof o!=="object") return false;
        if (!o) return false;
        var pk={configurable:1,enumerable:1,value:1,writable:1,get:1,set:1};
        var c=0;
        for (var k in o) {
            if (!pk[k]) return false;
            c+=pk[k];
        }
        return c;
    }
    Klass.Function=function () {throw new Exception("Abstract");}
    Klass.opt=A.opt;
    Klass.Binder=Klass.define({
        $this:"t",
        $:function (t,target) {
            for (var k in target) (function (k){
                if (typeof target[k]!=="function") return;
                t[k]=function () {
                    var a=Array.prototype.slice.call(arguments);
                    //console.log(this, this.__target);
                    //A(this.__target,"target is not set");
                    return target[k].apply(target,a);
                };
            })(k);
        }
    });
    Klass.assert=A;
    Klass.FuncUtil=FuncUtil;
    return Klass;
});
/*
requirejs(["Klass"],function (k) {
  P=k.define ({
     $:["x","y"]
  });
  p=P(2,3);
  console.log(p.x,p.y);
});
*/
;
(function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = typeof require == "function" && require;
        if (!u && a) return a(o, !0);
        if (i) return i(o, !0);
        var f = new Error("Cannot find module '" + o + "'");
        throw f.code = "MODULE_NOT_FOUND", f;
      }
      var l = n[o] = {
        exports: {}
      };
      t[o][0].call(l.exports, function(e) {
        var n = t[o][1][e];
        return s(n ? n : e);
      }, l, l.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = typeof require == "function" && require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
})({
  1: [ function(require, module, exports) {
    var process = module.exports = {};
    process.nextTick = function() {
      var canSetImmediate = typeof window !== "undefined" && window.setImmediate;
      var canPost = typeof window !== "undefined" && window.postMessage && window.addEventListener;
      if (canSetImmediate) {
        return function(f) {
          return window.setImmediate(f);
        };
      }
      if (canPost) {
        var queue = [];
        window.addEventListener("message", function(ev) {
          var source = ev.source;
          if ((source === window || source === null) && ev.data === "process-tick") {
            ev.stopPropagation();
            if (queue.length > 0) {
              var fn = queue.shift();
              fn();
            }
          }
        }, true);
        return function nextTick(fn) {
          queue.push(fn);
          window.postMessage("process-tick", "*");
        };
      }
      return function nextTick(fn) {
        setTimeout(fn, 0);
      };
    }();
    process.title = "browser";
    process.browser = true;
    process.env = {};
    process.argv = [];
    function noop() {}
    process.on = noop;
    process.addListener = noop;
    process.once = noop;
    process.off = noop;
    process.removeListener = noop;
    process.removeAllListeners = noop;
    process.emit = noop;
    process.binding = function(name) {
      throw new Error("process.binding is not supported");
    };
    process.cwd = function() {
      return "/";
    };
    process.chdir = function(dir) {
      throw new Error("process.chdir is not supported");
    };
  }, {} ],
  2: [ function(require, module, exports) {
    "use strict";
    var asap = require("asap");
    module.exports = Promise;
    function Promise(fn) {
      if (typeof this !== "object") throw new TypeError("Promises must be constructed via new");
      if (typeof fn !== "function") throw new TypeError("not a function");
      var state = null;
      var value = null;
      var deferreds = [];
      var self = this;
      this.then = function(onFulfilled, onRejected) {
        return new self.constructor(function(resolve, reject) {
          handle(new Handler(onFulfilled, onRejected, resolve, reject));
        });
      };
      function handle(deferred) {
        if (state === null) {
          deferreds.push(deferred);
          return;
        }
        asap(function() {
          var cb = state ? deferred.onFulfilled : deferred.onRejected;
          if (cb === null) {
            (state ? deferred.resolve : deferred.reject)(value);
            return;
          }
          var ret;
          try {
            ret = cb(value);
          } catch (e) {
            deferred.reject(e);
            return;
          }
          deferred.resolve(ret);
        });
      }
      function resolve(newValue) {
        try {
          if (newValue === self) throw new TypeError("A promise cannot be resolved with itself.");
          if (newValue && (typeof newValue === "object" || typeof newValue === "function")) {
            var then = newValue.then;
            if (typeof then === "function") {
              doResolve(then.bind(newValue), resolve, reject);
              return;
            }
          }
          state = true;
          value = newValue;
          finale();
        } catch (e) {
          reject(e);
        }
      }
      function reject(newValue) {
        state = false;
        value = newValue;
        finale();
      }
      function finale() {
        for (var i = 0, len = deferreds.length; i < len; i++) handle(deferreds[i]);
        deferreds = null;
      }
      doResolve(fn, resolve, reject);
    }
    function Handler(onFulfilled, onRejected, resolve, reject) {
      this.onFulfilled = typeof onFulfilled === "function" ? onFulfilled : null;
      this.onRejected = typeof onRejected === "function" ? onRejected : null;
      this.resolve = resolve;
      this.reject = reject;
    }
    function doResolve(fn, onFulfilled, onRejected) {
      var done = false;
      try {
        fn(function(value) {
          if (done) return;
          done = true;
          onFulfilled(value);
        }, function(reason) {
          if (done) return;
          done = true;
          onRejected(reason);
        });
      } catch (ex) {
        if (done) return;
        done = true;
        onRejected(ex);
      }
    }
  }, {
    asap: 4
  } ],
  3: [ function(require, module, exports) {
    "use strict";
    var Promise = require("./core.js");
    var asap = require("asap");
    module.exports = Promise;
    function ValuePromise(value) {
      this.then = function(onFulfilled) {
        if (typeof onFulfilled !== "function") return this;
        return new Promise(function(resolve, reject) {
          asap(function() {
            try {
              resolve(onFulfilled(value));
            } catch (ex) {
              reject(ex);
            }
          });
        });
      };
    }
    ValuePromise.prototype = Promise.prototype;
    var TRUE = new ValuePromise(true);
    var FALSE = new ValuePromise(false);
    var NULL = new ValuePromise(null);
    var UNDEFINED = new ValuePromise(undefined);
    var ZERO = new ValuePromise(0);
    var EMPTYSTRING = new ValuePromise("");
    Promise.resolve = function(value) {
      if (value instanceof Promise) return value;
      if (value === null) return NULL;
      if (value === undefined) return UNDEFINED;
      if (value === true) return TRUE;
      if (value === false) return FALSE;
      if (value === 0) return ZERO;
      if (value === "") return EMPTYSTRING;
      if (typeof value === "object" || typeof value === "function") {
        try {
          var then = value.then;
          if (typeof then === "function") {
            return new Promise(then.bind(value));
          }
        } catch (ex) {
          return new Promise(function(resolve, reject) {
            reject(ex);
          });
        }
      }
      return new ValuePromise(value);
    };
    Promise.all = function(arr) {
      var args = Array.prototype.slice.call(arr);
      return new Promise(function(resolve, reject) {
        if (args.length === 0) return resolve([]);
        var remaining = args.length;
        function res(i, val) {
          try {
            if (val && (typeof val === "object" || typeof val === "function")) {
              var then = val.then;
              if (typeof then === "function") {
                then.call(val, function(val) {
                  res(i, val);
                }, reject);
                return;
              }
            }
            args[i] = val;
            if (--remaining === 0) {
              resolve(args);
            }
          } catch (ex) {
            reject(ex);
          }
        }
        for (var i = 0; i < args.length; i++) {
          res(i, args[i]);
        }
      });
    };
    Promise.reject = function(value) {
      return new Promise(function(resolve, reject) {
        reject(value);
      });
    };
    Promise.race = function(values) {
      return new Promise(function(resolve, reject) {
        values.forEach(function(value) {
          Promise.resolve(value).then(resolve, reject);
        });
      });
    };
    Promise.prototype["catch"] = function(onRejected) {
      return this.then(null, onRejected);
    };
  }, {
    "./core.js": 2,
    asap: 4
  } ],
  4: [ function(require, module, exports) {
    (function(process) {
      var head = {
        task: void 0,
        next: null
      };
      var tail = head;
      var flushing = false;
      var requestFlush = void 0;
      var isNodeJS = false;
      function flush() {
        while (head.next) {
          head = head.next;
          var task = head.task;
          head.task = void 0;
          var domain = head.domain;
          if (domain) {
            head.domain = void 0;
            domain.enter();
          }
          try {
            task();
          } catch (e) {
            if (isNodeJS) {
              if (domain) {
                domain.exit();
              }
              setTimeout(flush, 0);
              if (domain) {
                domain.enter();
              }
              throw e;
            } else {
              setTimeout(function() {
                throw e;
              }, 0);
            }
          }
          if (domain) {
            domain.exit();
          }
        }
        flushing = false;
      }
      if (typeof process !== "undefined" && process.nextTick) {
        isNodeJS = true;
        requestFlush = function() {
          process.nextTick(flush);
        };
      } else if (typeof setImmediate === "function") {
        if (typeof window !== "undefined") {
          requestFlush = setImmediate.bind(window, flush);
        } else {
          requestFlush = function() {
            setImmediate(flush);
          };
        }
      } else if (typeof MessageChannel !== "undefined") {
        var channel = new MessageChannel();
        channel.port1.onmessage = flush;
        requestFlush = function() {
          channel.port2.postMessage(0);
        };
      } else {
        requestFlush = function() {
          setTimeout(flush, 0);
        };
      }
      function asap(task) {
        tail = tail.next = {
          task: task,
          domain: isNodeJS && process.domain,
          next: null
        };
        if (!flushing) {
          flushing = true;
          requestFlush();
        }
      }
      module.exports = asap;
    }).call(this, require("_process"));
  }, {
    _process: 1
  } ],
  5: [ function(require, module, exports) {
    if (typeof Promise.prototype.done !== "function") {
      Promise.prototype.done = function(onFulfilled, onRejected) {
        var self = arguments.length ? this.then.apply(this, arguments) : this;
        self.then(null, function(err) {
          setTimeout(function() {
            throw err;
          }, 0);
        });
      };
    }
  }, {} ],
  6: [ function(require, module, exports) {
    var asap = require("asap");
    if (typeof Promise === "undefined") {
      Promise = require("./lib/core.js");
      require("./lib/es6-extensions.js");
    }
    require("./polyfill-done.js");
  }, {
    "./lib/core.js": 2,
    "./lib/es6-extensions.js": 3,
    "./polyfill-done.js": 5,
    asap: 4
  } ]
}, {}, [ 6 ]);
//# sourceMappingURL=/polyfills/promise-6.1.0.js.map
;
define("promise", function(){});

/* global requirejs */
define("SEnv", ["Klass", "assert","promise"], function(Klass, assert,_) {
    function now(){return new Date().getTime();}
    function WDT2Float(w) {return w/128-1;}
    //--- Also in M2Parser
    var Ses = 10,
        Chs = 10,
        Regs = Chs * 3,
        WvElC = 32,
        EnvElC = 32,
        WvC = 96,
        wdataSize = 48000,  // should be dividable by 120
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
        MLabel = 120,

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
            return Math.trunc(x/y);
            //return Math.trunc(chkn(x,"x") / chkn(y,"y") );
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
        /*SPS = 44100,
        SPS96 = 22080,
        SPS_60 = div(44100, 60),*/
        DivClock = 111860.78125,// See [1]
        Loops = 163840,
//---------End include
        m2t = [0xd5d, 0xc9c, 0xbe7, 0xb3c, 0xa9b, 0xa02, 0x973, 0x8eb, 0x86b, 0x7f2, 0x780, 0x714,
            0x6af, 0x64e, 0x5f4, 0x59e, 0x54e, 0x501, 0x4ba, 0x476, 0x436, 0x3f9, 0x3c0, 0x38a,
            0x357, 0x327, 0x2fa, 0x2cf, 0x2a7, 0x281, 0x25d, 0x23b, 0x21b, 0x1fd, 0x1e0, 0x1c5,
            0x1ac, 0x194, 0x17d, 0x168, 0x153, 0x140, 0x12e, 0x11d, 0x10d, 0xfe, 0xf0, 0xe3,
            0xd6, 0xca, 0xbe, 0xb4, 0xaa, 0xa0, 0x97, 0x8f, 0x87, 0x7f, 0x78, 0x71,
            0x6b, 0x65, 0x5f, 0x5a, 0x55, 0x50, 0x4c, 0x47, 0x43, 0x40, 0x3c, 0x39,
            0x35, 0x32, 0x30, 0x2d, 0x2a, 0x28, 0x26, 0x24, 0x22, 0x20, 0x1e, 0x1c,
            0x1b, 0x19, 0x18, 0x16, 0x15, 0x14, 0x13, 0x12, 0x11, 0x10, 0xf, 0xe
        ],//  From: Tbl5-1 of [1]
        //[1]  http://ngs.no.coocan.jp/doc/wiki.cgi/TechHan?page=1%BE%CF+PSG%A4%C8%B2%BB%C0%BC%BD%D0%CE%CF
        Trunc = Math.trunc.bind(),
        stEmpty = -1,
        stFreq = 1,
        stVol = 2,
        stWave = 3,
        sndElemCount = 64,
        //type
        /*TSoundElem = Klass.define({
            $fields: {
                time: Integer,
                typ: Integer,
                val: Integer
            }
        }),*/
        nil = null,
        False = false,
        True = true,
        //TPlayState = (psPlay,psStop,psWait,psPause);
        psPlay = "psPlay",
        psStop = "psStop",
        psWait = "psWait",
        psPause = "psPause",
        m2tInt=[], //:array[0..95] of Integer;
        sinT = [], //:array [0..sinMAX-1] of ShortInt;
        TTL, //:Integer;
        cnt=0; //:Integer;// debug
    var defs;
    var TEnveloper = Klass.define(defs={ //class (TSoundGenerator)
        $this: "t",
        $fields: {
            //BSize: Integer,
            Pos: Integer,
            PrevPos: Integer,
            RPos: Integer,
            //WriteAd: Integer,
            //SccCount: Array, // [0..Chs-1] of Integer;
            //Steps: Array, // [0..Chs-1] of integer;
            //SccWave: Array, // [0..Chs-1] of PChar;
            WaveDat: Array, // [0..WvC-1,0..WvElC-1] of Byte;
            //RefreshRate: Number, //longint,//;
            //RRPlus: Integer,
            //PosPlus: Integer, //;
            wdata2: Array,//array[0..wdataSize-1] of SmallInt;

            BeginPlay: Boolean,
            SeqTime: Integer,
            SeqTime120: Integer,

            WavOutMode: Boolean,
            //WavPlaying: Boolean,
            /*{$ifdef ForM2}
            WavOutObj:TWaveSaver,
            {$endif}*/
            //EShape: Array, // [0..Chs-1] of PChar,
            //EVol: Array,
            //EBaseVol: Array,
            //ESpeed: Array,
            //ECount: Array, // [0..Chs-1] of Word,
            //Oct: Array, // [0..Chs-1] of Byte,
            //MCount: Array, // [0..Chs-1] of Integer,
            //MPoint: Array, // [0..Chs-1] of PChar,
            //MPointC: Array, // [0..Chs-1] of Integer,
            //Resting: Array, // [0..Chs-1] of Boolean,
            //PlayState: Array, // [0..Chs-1] of TPlayState,
            //Slur: Array,
            //Sync: Array, // [0..Chs-1] of Boolean,
            //Detune: Array, // [0..Chs-1] of Integer,
            //PorStart: Array,
            //PorEnd: Array,
            //PorLen: Array, // [0..Chs-1] of Integer,
            //LfoV: Array,
            //LfoA: Array,
            //LfoC: Array,
            //LfoD: Array,
            //LfoDC: Array,
            //LfoSync: Array, // [0..Chs-1] of Integer,
            //sync=0:非同期、1:同期、2:ワンショット 3:鋸波形
            Fading: Integer,

            //CurWav: Array, // [0..Chs-1] of Integer,
            //L2WL: Array, // [0..Chs-1] of Integer,
            // log 2 WaveLength
            PCMW: Array, // [0..PCMWavs-1] of TWavLoader,

            Delay: Integer,

            Tempo: Integer,
            ComStr: String,
            WFilename: String,

            EnvDat: Array, // [0..Envs-1,0..EnvElC-1] of Byte,

            WriteMaxLen: Integer,
            //soundMode: Array // [0..chs-1] of Boolean,
        },
        load:function (t,d) {
            var ver=readLong(d);
            var chs=readByte(d);
            //var chdatas;
            //t.MPoint=chdatas=[];
            for (var i=0;i<chs;i++) {
                var chdata=[];
                //chdatas.push(chdata);
                var len=readLong(d);
                //console.log(len);
                //if(len>999999) throw new Error("LONG");
                for (var j=0;j<len;j++) {
                    chdata.push(readByte(d));
                }
                t.channels[i].MPoint=chdata;
            }
            function readByte(a) {
                if (a.length==0) throw new Error("Out of data");
                return a.shift();
            }
            function readLong(a) {
                if (a.length<4) throw new Error("Out of data");
                var r=a.shift(),e=1;
                e<<=8;
                r+=a.shift()*e;
                e<<=8;
                r+=a.shift()*e;
                e<<=8;
                r+=a.shift()*e;
                return r;
            }
        },
        setNoiseWDT: function (t) {
            // Noise
            for (var j=0;j<1024;j++) {
                t.WaveDat[WvC-1][j]=WDT2Float( Math.floor(Math.random() * 78 + 90) );
            }
        },
        loadWDT: function (t,url) {
            return new Promise(function (succ,fail) {
            try{
                console.log("LOading wdt...?");
                if (!url) {
                    requirejs(["Tones.wdt"],function (u) {
                        t.loadWDT(u).then(succ,fail);
                    });
                }
                var oReq = new XMLHttpRequest();
                oReq.open("GET", url, true);
                oReq.responseType = "arraybuffer";
                oReq.onload = function (oEvent) {
                    var arrayBuffer = oReq.response,i,j;
                    if (arrayBuffer) {
                        var b = new Uint8Array(arrayBuffer);
                        console.log("Loading wdt",b.length);
                        //WaveDat
                        var idx=0;
                        for (i = 0; i < WvC; i++) {
                            for (j=0;j<32;j++) {
                                t.WaveDat[i][j]=WDT2Float( b[idx++] );
                            }
                        }
                        t.setNoiseWDT();
                        //EnvDat
                        for (i=0 ;i<16;i++) {//Envs
                            for (j=0;j<32;j++) {
                                t.EnvDat[i][j]=b[idx++];
                            }
                        }
                        console.log("Loading wdt done");
                        succ();
                    }
                };
                oReq.send(null);
            } catch(e) {fail(e);}
            });
        },
        getPlayPos: function () {
            var ti=this.context.currentTime- this. playStartTime;
            var tiSamples=Math.floor(ti*this.sampleRate);
            return tiSamples % wdataSize;
        },
        setSound: function(t, ch /*:Integer;*/ , typ /*:Integer;*/ , val /*:Integer*/ ) {
            var chn=t.channels[ch];
            chn.soundMode = True;
            switch (typ) {
                case stFreq:
                    chn.Steps = val;
                    break;
                case stVol:
                    chn.EVol = val;
                    break;
            }
        },
        InitSin: function(t) {
            var i; //:Integer;
            for (i = 0; i < sinMax; i++) {
                sinT[i] = Math.trunc(Math.sin(3.1415926 * 2 * i / sinMax) * 127);
            }
        },
        InitEnv: function(t) {
            var i, j; //:Integer;
            t.EnvDat=[];
            for (i = 0; i < Envs; i++) {
                t.EnvDat[i]=[];
                for (j = 0; j < EnvElC; j++) {
                    t.EnvDat[i][j] = Math.floor((EnvElC - 1 - j) / 2);
                }
            }
        },
        ConvM2T: function(t) {
            var i; //:Integer;
            m2tInt=[];
            for (i = 0; i < 96; i++) {
                m2tInt[i] = Math.trunc(DivClock * 65536 / m2t[i] * 65536 / t.sampleRate);
            }
        },
        InitWave: function(t) {
            var i, j;
            t.WaveDat=[];
            for (i = 0; i < WvC; i++) {
                t.WaveDat[i]=[];
                for (j = 0; j < WvElC / 2; j++) {
                    t.WaveDat[i][j] = WDT2Float(103);
                    t.WaveDat[i][j + div(WvElC, 2)] = WDT2Float(153);
                }
            }
        },

        $: function(t,context,options) {
            var i, j; //:Integer;
            options=options||{};
            t.useScriptProcessor=options.useScriptProcessor;
            t.useFast=options.useFast;
            t.resolution=options.resolution||120;
            t.wavOutSpeed=options.wavOutSpeed||10;
            t.context=context;
            t.sampleRate = t.context.sampleRate;
            //t.initNode({});
            //t.WavPlaying=false;
            // inherited Create (Handle);
            t.Delay = 2000;
            t.Pos = t.PrevPos = t.RPos = /*t.WriteAd =*/ t.SeqTime =
            t.SeqTime120 = 0;
            t.BeginPlay=false;
            t.InitWave();
            t.InitEnv();
            t.InitSin();
            t.ConvM2T();
            t.wdata2=[];
            t.PCMW=[];
            //t.L2WL=[];
            //t.Sync=[];
            //t.ECount=[];
            //t.MCount=[];
            for (i = 0; i < PCMWavs; i++) {
                t.PCMW[i] = nil;
            }
            //t.Steps = [];
            //t.SccWave = [];
            //t.SccCount = [];
            //t.EShape = []; //=t.EnvDat[0];
            //t.EVol = [];
            //t.EBaseVol = [];
            //t.MPoint = [];
            //t.MPointC = [];
            //t.ESpeed = [];
            //t.PlayState = [];
            //t.Detune = [];
            //t.LfoV = [];
            //t.LfoD = [];
            //t.LfoDC = [];
            //t.PorStart=[];
            //t.PorEnd=[];
            //t.PorLen=[];
            //t.soundMode = [];
            //t.CurWav=[];
            //t.Oct=[];
            //t.Resting=[];
            //t.Slur=[];
            //t.Sync=[];
            //t.LfoV=[];t.LfoA=[];t.LfoC=[];t.LfoD=[];t.LfoDC=[];t.LfoSync=[];
            t.channels=[];
            for (i = 0; i < Chs; i++) {
                t.channels.push({});
                t.channels[i].LfoV=0;t.channels[i].LfoA=0;t.channels[i].LfoC=0;t.channels[i].LfoD=0;t.channels[i].LfoDC=0;t.channels[i].LfoSync=0;
                t.channels[i].Slur=t.channels[i].Sync=0;
                t.channels[i].PorStart=t.channels[i].PorEnd=t.channels[i].PorLen=0;
                t.channels[i].ECount=0;
                t.channels[i].MCount=0;
                t.channels[i].Resting=0;
                t.channels[i].Steps = 0;
                t.channels[i].SccWave = t.WaveDat[0];
                t.channels[i].SccCount = 0;
                t.channels[i].EShape = t.EnvDat[0];
                t.channels[i].EVol = 0;
                t.channels[i].EBaseVol = 128;
                t.channels[i].MPoint = nil;
                t.channels[i].MPointC = 0;
                t.channels[i].ESpeed = 5;
                t.channels[i].PlayState = psStop;
                t.channels[i].Detune = 0;
                t.channels[i].LfoV = 0;
                t.SelWav(i, 0);
                t.channels[i].LfoD = 0;
                t.channels[i].LfoDC = 0;
                t.channels[i].Oct = 4;
                t.channels[i].soundMode = False;
            }
            t.Fading = FadeMax;
            t.timeLag = 2000;

            t.WriteMaxLen = 20000;
            t.WavOutMode = False;
            t.label2Time=[];
            t.PC2Time=[];// only ch:0
            t.WFilename = '';
            /* {$ifdef ForM2}
            t.WavOutObj=nil;
             {$endif}*/
            t.Tempo = 120;
            t.ComStr = '';
            t.performance={writtenSamples:0, elapsedTime:0, timeForChProc:0, timeForWrtSmpl:0};
            //t.loadWDT();
        },
        getBuffer: function (t) {
            var channel=1;
            if (this.buf) return this.buf;
            this.buf = this.context.createBuffer(channel, wdataSize, this.sampleRate);
            return this.buf;
        },
        playNode: function (t) {
            if (this.isSrcPlaying) return;
            var source = this.context.createBufferSource();
            // AudioBufferSourceNodeにバッファを設定する
            source.buffer = this.getBuffer();
            // AudioBufferSourceNodeを出力先に接続すると音声が聞こえるようになる
            if (typeof source.noteOn=="function") {
                source.noteOn(0);
                //source.connect(this.node);
            }
            source.connect(this.context.destination);
            // 音源の再生を始める
            source.start();
            source.loop = true;
            source.playStartTime = this.playStartTime = this.context.currentTime;
            this.bufSrc=source;
            this.isSrcPlaying = true;
        },
        startRefreshLoop: function (t) {
            if (t.refreshTimer!=null) return;
            var grid=t.resolution;
            var data=t.getBuffer().getChannelData(0);
            var WriteAd=0;
            for (var i=0;i<wdataSize;i+=grid) {
                t.refreshPSG(data,i,grid);
            }
            function refresh() {
                if (!t.isSrcPlaying) return;
                var cnt=0;
                var playPosZone=Math.floor(t.getPlayPos()/grid);
                while (true) {
                    if (cnt++>wdataSize/grid) throw new Error("Mugen "+playPosZone);
                    var writeAdZone=Math.floor(WriteAd/grid);
                    if (playPosZone===writeAdZone) break;
                    t.refreshPSG(data,WriteAd,grid);
                    WriteAd=(WriteAd+grid)%wdataSize;
                }
            }
            t.refreshTimer=setInterval(refresh,16);
        },
        stopRefreshLoop: function (t) {
            if (t.refreshTimer==null) return;
            clearInterval(t.refreshTimer);
            delete t.refreshTimer;
        },
        stopNode : function (t) {
            if (!this.isSrcPlaying) return;
            this.bufSrc.stop();
            this.isSrcPlaying = false;
        },
        Play1Sound: function(t, c, n, iss) {
            var TP; //:Integer;
            var chn=t.channels[c];
            if (chn.soundMode) return; // ) return;
            if (n == MRest) {
                chn.Resting = True;
                return;
            }
            if ((c < 0) || (c >= Chs) || (n < 0) || (n > 95)) return; // ) return;
            chn.Resting = False;
            if (!iss) {
                chn.ECount = 0;
                if (chn.Sync) chn.SccCount = 0;
                if (chn.LfoSync != LASync) chn.LfoC = 0;
            }
            if (chn.CurWav < WvC) {
                chn.Steps = m2tInt[n] + chn.Detune * div(m2tInt[n], 2048);
                if (chn.CurWav===WvC-1) {// Noise
                    chn.Steps >>>= 5;//  32->1024
                }
                // m2tInt*(1+Detune/xx)    (1+256/xx )^12 =2  1+256/xx=1.05946
                //    256/xx=0.05946   xx=256/0.05946  = 4096?
            } else {
                if (chn.L2WL >= 2) {
                    //Steps[c]:=($40000000 shr (L2WL[c]-2)) div (m2tInt[36] div 65536) * (m2tInt[n] div 65536);
                    chn.Steps = div(0x40000000 >>> (chn.L2WL - 2), div(m2tInt[36], 65536)) * div(m2tInt[n], 65536);
                }
            }
            chn.PorLen = -1;
        },
        //    procedure TEnveloper.Play1Por (c,f,t:Word;iss:Boolean);
        Play1Por: function (t,c,from,to,iss) {
             var TP=0;
             var chn=t.channels[c];
             if ((c<0)  ||  (c>=Chs)  ||  (to<0)  ||  (to>95) ||
                (from<0)  ||  (from>95) ) return;
             chn.Resting=False;

             //TP=m2t[f];
             chn.PorStart=m2tInt[from]+chn.Detune*div(m2tInt[from] , 2048);//Trunc (DivClock/TP*65536/t.sampleRate)+Detune[c];
             //TP=m2t[to];
             chn.PorEnd=m2tInt[to]+chn.Detune*div(m2tInt[to] , 2048);//Trunc (DivClock/TP*65536/t.sampleRate)+Detune[c];
             // Noise
             if (chn.CurWav===WvC-1) {
                 chn.PorStart >>>= 5;//  32->1024
                 chn.PorEnd >>>= 5;//  32->1024
             }
             if  (!iss) chn.ECount=0;

        },
        StopMML: function(t, c) {
            if ((c < 0) || (c >= Chs)) return; // ) return;
            //MPoint[c]=nil;
            t.WaitMML(c);
            t.channels[c].PlayState = psStop;
            t.channels[c].MCount = t.SeqTime + 1;
        },
        allWaiting: function (t) {
            for(var i=0;i<Chs;i++) {
                if (t.channels[i].PlayState == psPlay) {
                    return false;
                }
            }
            return true;
        },
        handleAllState: function (t) {
            var allWait=true,allStop=true,i;
            for(i=0;i<Chs;i++) {
                switch (t.channels[i].PlayState) {
                case psPlay:
                    allWait=false;
                    allStop=false;
                    break;
                case psWait:
                    allStop=false;
                    break;
                }
            }
            //          alw     als
            // P        F       F
            // W        T       F
            // S        T       T
            // P,W      F       F
            // W,S      T       F
            // S,P      F       F
            // P,W,S    F       F
            if (allWait && !allStop) {
                for(i=0;i<Chs;i++) {
                    t.RestartMML(i);
                }
            }
            return allStop;
        },
        allStopped: function (t) {
            for(var i=0;i<Chs;i++) {
                if (t.channels[i].PlayState != psStop) {
                    return false;
                }
            }
            return true;
        },
        RestartMML: function(t, c) {
            if ((c < 0) || (c >= Chs)) return;
            var chn=t.channels[c];
            if (chn.PlayState == psWait) {
                chn.PlayState = psPlay;
                chn.MCount = t.SeqTime + 1;
            }
        },
        restartIfAllWaiting: function (t) {
            if (t.allWaiting()) {
                for(var i=0;i<Chs;i++) {
                    t.RestartMML(i);
                }
            }
        },
        //procedure TEnveloper.WaitMML (c:Integer);
        WaitMML: function(t, c) {
            var i; //:Integer;
            if ((c < 0) || (c >= Chs)) return;
            //MPoint[c]=nil;
            var chn=t.channels[c];
            chn.PlayState = psWait;
            chn.MCount = t.SeqTime + 1;
        },
        //procedure TEnveloper.Start;
        Start: function(t) {
            t.Stop();
            t.Rewind();
            t.BeginPlay = True;
            t.startRefreshLoop();
            t.playNode();
        },
        Rewind: function (t) {
            var ch; //:Integer;
            t.SeqTime=0;
            for (ch = 0; ch < Chs; ch++) {
                var chn=t.channels[ch];
                chn.soundMode = False;
                chn.MPointC = 0;
                chn.PlayState = psPlay;
                chn.MCount = t.SeqTime;
            }
        },
        Stop: function (t) {
            if (!t.BeginPlay) return;
            t.stopNode();
            t.stopRefreshLoop();
        },
        wavOut: function (t) {
            t.Stop();
            t.Rewind();
            var buf=[];
            var grid=t.resolution;
            for (var i=0;i<grid;i++) buf.push(0);
            var allbuf=[];
            t.writtenSamples=0;
            t.WavOutMode=true;
            t.label2Time=[];
            t.loopStart=null;
            t.loopStartFrac=null;
            t.PC2Time=[];// only ch:0
            var sec=-1;
            var efficiency=t.wavOutSpeed||10;
            var setT=0;
            return new Promise(function (succ) {
                    while (true) {
                        for (var i=0;i<grid;i++) allbuf.push(0);
                        t.refreshPSG(allbuf,allbuf.length-grid,grid);
                        t.writtenSamples+=grid;
                        var ss=Math.floor(t.writtenSamples/t.sampleRate);
                        if (ss>sec) {
                            //console.log("Written ",ss,"sec");
                            sec=ss;
                        }
                        //allbuf=allbuf.concat(buf.slice());
                        if (t.allStopped()) {
                            t.WavOutMode=false;
                            succ(allbuf);
                            //console.log("setT",setT);
                            console.log(t.performance);
                            return;
                        }
                    }
            });
        },
        toAudioBuffer: function (t) {
            return t.wavOut().then(function (arysrc) {
                var buffer = t.context.createBuffer(1, arysrc.length, t.sampleRate);
                var ary = buffer.getChannelData(0);
                for (var i = 0; i < ary.length; i++) {
                     ary[i] = arysrc[i];
                }
                var res={decodedData: buffer};
                if (t.loopStartFrac) res.loopStart=t.loopStartFrac[0]/t.loopStartFrac[1];
                return res;
            });
        },
        //procedure TEnveloper.SelWav (ch,n:Integer);
        SelWav: function(t, ch, n) {
            var chn=t.channels[ch];
            chn.CurWav = n;
            if (n < WvC) {
                chn.SccWave = t.WaveDat[n];
                chn.L2WL = 5;
                // Noise
                if (n===WvC-1) chn.L2WL=10;
                chn.Sync = False;
            } else {
                if (t.PCMW[n - WvC] != nil) {
                    chn.SccWave = t.PCMW[n - WvC].Start;
                    chn.L2WL = t.PCMW[n - WvC].Log2Len;
                    chn.Sync = True;
                }
            }
        },
        RegPCM: function (t,fn, n) {
            console.log("[STUB]regpcm",fn.map(function (e) {return String.fromCharCode(e);}),n);
        },
        /*
        procedure TEnveloper.RegPCM (fn:string;n:Integer);
        var i:Integer;
            wl,wl2:TWavLoader;
        {
             if ( ! FileExists(fn) ) {
                fn=ExtractFilePath (ParamStr(0))+'\\'+fn;
                if ( ! FileExists(fn) ) return;
             }
             for ( i=0 to Chs-1 )
                 if ( CurWav[i]==n ) SelWav(i,0);
             wl=TWavLoader.Create (fn);IncGar;
             if ( ! wl.isError ) {
                if ( PCMW[n-WvC]!=nil ) {
                   PCMW[n-WvC].Free; DecGar;
                }
                wl2=TWavLoader.Clone (TObject(wl));  IncGar;
                PCMW[n-WvC]=wl2;
             }
             wl.Free;   DecGar;

        }
        */
        refreshPSG: function(t,data,WriteAd,length) {
            var i, ch, WaveMod, WriteBytes, wdtmp, inext, mid, w1, w2, //:integer;
                TP = [],
                vCenter = [], //:array [0..Chs-1] of Integer;
                //Steps:array [0..Chs-1] of Integer;
                Lambda, NewLambda, //:Real;
                res, //:MMRESULT;
                WriteTwice, //:Boolean;
                WriteMax, //:integer;
                nowt, //:longint;
                // AllVCenter:Integer;
                Wf=0, Wt=0, WMid=0, WRes=0, WSum=0, v=0, NoiseP=0, Tmporc=0, //:Integer;
                LParam, HParam, WParam, //:Byte;
                JmpSafe, //:Integer;
                se; //:^TSoundElem;

            cnt++;

            var mcountK=t.sampleRate / 22050;
            var tempoK=44100 / t.sampleRate ;
            var startTime=new Date().getTime();
            if (t.allStopped()) {
                for (i=WriteAd; i<=WriteAd+length; i++) {
                    data[i]=0;
                }
                return;
            }
            var vv=[],SeqTime=t.SeqTime,lpchk=0,chn;
            var chPT=now();
            for (ch = 0; ch < Chs; ch++) {
                chn=t.channels[ch];
                if (chn.MPoint[chn.MPointC] == nil) t.StopMML(ch);
                if (chn.PlayState != psPlay) continue;
                if (chn.PorLen > 0) {
                    Tmporc = chn.MCount - SeqTime;
                    chn.Steps = (
                        div(chn.PorStart, chn.PorLen) * Tmporc +
                        div(chn.PorEnd, chn.PorLen * (chn.PorLen - Tmporc))
                    );
                }
                if ((chn.soundMode))
                    v = chn.EVol;
                else if ((chn.Resting))
                    v = 0;
                else
                    v = chn.EShape[chn.ECount >>> 11] * chn.EVol * chn.EBaseVol; // 16bit
                if (t.Fading < FadeMax) {
                    v = v * div(t.Fading, FadeMax); // 16bit
                }
                vv[ch]=v;
                if (chn.ECount + chn.ESpeed*(length/2) < 65536 ) chn.ECount += chn.ESpeed*(length/2);

                JmpSafe = 0;

                while (chn.MCount <= SeqTime) {
                    var pc = chn.MPointC;
                    if (ch==0) t.PC2Time[pc]=t.writtenSamples;
                    LParam = chn.MPoint[pc + 1];
                    HParam = chn.MPoint[pc + 2];
                    var code = chn.MPoint[pc];
                    if (code >= 0 && code < 96 || code === MRest) {
                        t.Play1Sound(ch, code, chn.Slur);
                        if (!chn.Slur) chn.LfoDC = chn.LfoD;
                        chn.Slur = False;
                        chn.MCount +=
                            (LParam + HParam * 256) * 2;
                        // SPS=22050の場合 *2 を *1 に。
                        // SPS=x の場合   * (x/22050)
                        chn.MPointC += 3;
                    } else switch (code) {
                        case MPor:
                             t.Play1Por (ch,
                               LParam,
                               HParam,
                               chn.Slur
                             );
                             chn.Slur=False;
                             chn.MCount+=
                             ( chn.MPoint[pc + 3]+chn.MPoint[pc + 4]*256 )*2;
                            // SPS=22050の場合 *2 を *1 に。
                             chn.PorLen=chn.MCount-SeqTime;
                             chn.MPointC+=5;
                        break;
                        case MTempo:
                            t.Tempo = LParam + HParam * 256;
                            chn.MPointC += 3;
                            break;
                        case MVol:
                            chn.EVol = LParam;
                            chn.MPointC += 2;
                            break;
                        case MBaseVol:
                            chn.EBaseVol = LParam;
                            chn.MPointC += 2;
                            break;
                        case Mps:
                            chn.ESpeed = LParam;
                            chn.MPointC += 2;
                            break;
                        case MSelWav:
                            t.SelWav(ch, LParam);
                            chn.MPointC += 2;
                            break;
                        case MWrtWav:
                            chn.MPointC += 34; // MWrtWav wavno data*32
                            for (i = 0; i < 32; i++) {
                                t.WaveDat[LParam][i] = WDT2Float( chn.MPoint[pc + 2 + i] );
                            }
                            break;
                        case MSelEnv:
                            chn.EShape = t.EnvDat[LParam];
                            chn.MPointC += 2;
                            break;
                        case MWrtEnv:
                            // MWrtEnv envno data*32
                            chn.MPointC += 34;
                            for (i = 0; i < 32; i++) {
                                wdtmp = chn.MPoint[pc + 2 + i];
                                if (wdtmp > 15) wdtmp = 15;
                                t.EnvDat[LParam][i] = wdtmp;
                            }
                            break;
                        case MJmp:
                            if (t.WavOutMode) {
                                if (ch==0) {
                                    var dstLabelPos=chn.MPointC + array2Int(chn.MPoint, pc+1);
                                    //var dstLabelNum=chn.MPoint[dstLabelPos+1];
                                    var dstTime=t.PC2Time[dstLabelPos];// t.label2Time[dstLabelNum-0];
                                    if (typeof dstTime=="number" && dstTime<t.writtenSamples) {
                                        t.loopStartFrac=[dstTime, t.sampleRate];
                                        console.log("@jump", "ofs=",t.loopStartFrac );
                                    }
                                }
                                chn.MPointC += 5;
                            } else {
                                chn.MPointC += array2Int(chn.MPoint, pc+1);
                            }
                            JmpSafe++;
                            if (JmpSafe > 1) {
                                console.log("Jumpsafe!");
                                t.StopMML(ch);
                                chn.MCount = SeqTime + 1;
                            }
                            break;
                        case MLabel:
                            if (t.WavOutMode && ch==0) {
                                t.label2Time[LParam]=[t.writtenSamples,t.sampleRate];
                                console.log("@label", LParam , chn.MPointC , t.writtenSamples+"/"+t.sampleRate );
                            }
                            chn.MPointC+=2;
                            break;
                        case MSlur:
                            chn.Slur = True;
                            chn.MPointC += 1;
                            break;
                        case MWait:
                            t.WaitMML(ch);
                            chn.MPointC += 1;
                            break;
                        case MCom:
                            t.ComStr = StrPas(chn.MPoint, pc + 1);
                            chn.MPointC += t.ComStr.length + 2; // opcode str \0
                            break;
                        case MWOut:
                            t.WFilename = StrPas(chn.MPoint, pc + 1);
                            chn.MPointC += t.WFilename.length + 2; // opcode str \0
                            break;
                        case MWEnd:
                            chn.MPointC += 1;
                            break;
                        case MDet:
                            chn.Detune = ShortInt(LParam);
                            chn.MPointC += 2;
                            break;
                        case MLfo:
                            chn.LfoSync = (LParam);
                            chn.LfoV = (HParam) * 65536;
                            chn.LfoA = (chn.MPoint[pc + 3]);
                            chn.LfoD = 0;
                            chn.MPointC += 4;
                            break;
                        case MLfoD:
                            chn.LfoD = LParam * t.sampleRate;
                            chn.MPointC += 2;
                            break;
                        case MSync:
                            chn.Sync = (LParam == 1);
                            chn.MPointC += 2;
                            break;
                        case MPCMReg:
                            var fn=StrPas(chn.MPoint, pc+1);
                            t.RegPCM (fn,chn.MPoint[pc+1+fn.length+1]);
                            chn.MPointC+=fn.length +3;
                            break;
                        case Mend:
                            t.StopMML(ch); //MPoint[ch]=nil;
                            break;
                        default:
                            t.StopMML(ch);
                            throw new Error("Invalid opcode" + code);
                            //chn.MPointC += 1;
                    }
                }
                // End Of MMLProc
            }
            t.handleAllState();
            t.SeqTime+= Math.floor( t.Tempo * (length/120) * tempoK );
            for (var ad=WriteAd; ad<WriteAd+length; ad++) {
                data[ad]=0;
            }
            var wrtsT=now();
            t.performance.timeForChProc+=wrtsT-chPT;
            var noiseWritten=false;
            var WrtEnd=WriteAd+length;
            for (ch = 0; ch < Chs; ch++) {
                chn=t.channels[ch];
                if (chn.PlayState != psPlay) continue;
                v=vv[ch]/ 0x80000;
                if (v<=0) continue;
                var SccCount=chn.SccCount,Steps=chn.Steps,SccWave=chn.SccWave,sh=(32-chn.L2WL);
                // Proc LFO here!
                if (chn.LfoV != 0) {
                    if (chn.LfoDC > 0) {
                        chn.LfoDC -= t.Tempo*length;
                    } else {
                        Steps += (sinT[chn.LfoC >>> (16 + sinMax_s)] *
                                (Steps >> 9 ) * chn.LfoA)  >> 8;
                        chn.LfoC += chn.LfoV/2*length;
                    }
                }
                // Sync(for PCM playback) is separeted?
                for (ad=WriteAd; ad<WrtEnd; ad++) {
                    data[ad] += v*SccWave[SccCount >>> sh];
                    SccCount += Steps;
                }
                chn.SccCount=SccCount >>> 0;
            }// of ch loop
            t.setNoiseWDT();// Longer?
            t.performance.timeForWrtSmpl+=now()-wrtsT;
            t.performance.elapsedTime+=new Date().getTime()-startTime;
            t.performance.writtenSamples+=length;
            t.performance.writeRate=t.performance.writtenSamples/(t.performance.elapsedTime/1000*t.sampleRate);
            //--------------|---------------------------
            //             playpos  LS            LE
            //                       +-------------+

        }// of refreshPSG
    }); // of Klass.define
    var undefs={};
    function replf(_,name) {
        //console.log(name);
        if (!defs.$fields[name]) {
            if (undefs[name]==null) undefs[name]=1;
            //console.error("Undefined ",name);
        }
    }
    for(var k in defs) {
        var fldreg=/\bt\s*\.\s*([a-zA-Z0-9]+)\b/g;
        if (typeof defs[k]==="function") {
            var src=defs[k]+"";
            var r=src.replace(fldreg, replf);
            undefs[k]=0;
        }
    }
    console.log(undefs);
    return TEnveloper;
}); // of requirejs.define
;
/*global window,self,global*/
define('root',[],function (){
    if (typeof window!=="undefined") return window;
    if (typeof self!=="undefined") return self;
    if (typeof global!=="undefined") return global;
    return (function (){return this;})();
});

// Worker Side
define('WorkerServiceW',["promise","root"], function (_,root) {
    var idseq=1;
    var paths={},queue={},self=root;
    root.WorkerService={
        install: function (path, func) {
            paths[path]=func;
        },
        serv: function (path,func) {
            this.install(path,func);
        },
        ready: function () {
            root.WorkerService.isReady=true;
            self.postMessage({ready:true});
        },
        reverse: function (path, params) {
            var id=idseq++;
            return new Promise(function (succ,err) {
                queue[id]=function (e) {
                    if (e.status=="ok") {
                        succ(e.result);
                    } else {
                        err(e.error);
                    }
                };
                self.postMessage({
                    reverse: true,
                    id: id,
                    path: path,
                    params: params
                });

            });
        }
    };
    self.addEventListener("message", function (e) {
        var d=e.data;
        var id=d.id;
        var context={id:id};
        if (d.reverse) {
            queue[d.id](d);
            delete queue[d.id];
            return;
        }
        try {
            Promise.resolve( paths[d.path](d.params,context) ).then(function (r) {
                self.postMessage({
                    id:id, result:r, status:"ok"
                });
            },sendError);
        } catch (ex) {
            sendError(ex);
        }
        function sendError(e) {
            self.postMessage({
                id:id, error:e?(e.stack||e+""):"unknown", status:"error"
            });
        }
    });
    root.WorkerService.install("WorkerService/isReady",function (){
        return root.WorkerService.isReady;
    });
    if (!root.console) {
        root.console={
            log: function () {
                root.WorkerService.reverse("console/log",Array.prototype.slice.call(arguments));
            }
        };
    }
    return root.WorkerService;
});

define('Tones.wdt',[],function () {
    return "data:application/octet-stream;base64,UFBQUFBQUFBQUFBQUFBQULm5ubm5ubm5ubm5ubm5ublnZ2dnZ6einUdETExBTHyao6OZnpNASWqZmJqZMENshm1LOjA6UFZOMys4RVBfZ3iHmKCvwMfUzLGpr8XPxbSSoGdnVUpBQD9BSUpKTlJjfK7BxL+xoHxiVkpPaIGToK1oYVZORkA5NDQ0NjpBSVZgbHuKlaOrrq6tq6Sfk4d8dopORUtVYGJobGdQRTw7RmF4jLO6uK+cmZmZmZqalY6MTkxOS0tLS0tLS0tLS0tLTH2uxc7SzruegVFQUE9PT05GSUdHRkZGRkZGz8/MzMzOz87Oz3dERUVFRUXOztDQSSdPa2xsa2tra2ttbW1ta4yx29rb3MGkim5WQSUlJScnR0lJSUlJSkpKSUlJSUlJSUlKvLy8u7y8u75GRkdHR0fs7OwPSqmfUEtJRTg4ODY2LysrKSkoKh4eHh4eHh4eH05OT09PT09PT09PT09PUFBQUFBQUFBQUFBPT0+4tra2Z2dbOTg7R2eIpK2kmIlsVUxHSlhwhJ+xq6OZmZmZjYiVioFsUS0iICo2TmCClaCzsaVrTEpccZGuurazsK+pop9cY1eRfGtfVUc/dZKecWhtomFjX3aBgXFgVUlAUYeY1ipFVWNseIKMkpmiqK2wubu+wMTFxcbGy8vQ0tHR0tR3iGBXbElAqKuOUk9Yk5OvuLm5ubSgcFZLTGpukpRma2dnZ2dnfpeZl4dwalBOZ2egtbOZeGVmcYKdrbWwrZmZZ2dnZ0c5MzMxMTEzNTk8Z5mZmZmZmcnJx8fGxsXDv7NKQUBUZW1tZV1dY3eUoKqrq5+cnai6xMXAtaWdk4p3YDA8TFZhZ3J8hI6fqrW/z9fs1rypnY2AcWFSRz80LSkgPEFGTlBWV1xdYmhscHN3eHyChoqRlZmeoKKlrbC1usHGv7WupaOak4+IiIR+eXhzbmtnYF1bxsZUUU5JQzs4NmBgYGBhwMC/v7/Dw8PExMPDw2NiZWVlZWVlZWVlYWFlV1dWVlRRVFJSUlTFxcXExMPDw8PDxFBQVFRUVldTVFfHx8fGxcS/v7u5tLCtp6Cal5KOhIB7cm5oYFdOPjgqxauxqZoXipOUZ2eTQ0GIlW2up6+VztDWSXKrpVCoTIOkyz5AQUFBQ0NBP0BGS1FdaHF3goePmaCps7u/xMXFxccjIChdZWBcRx8cGh0rRF11jaW80uBzs6ez29zOqY1qPmxmVjNBPmegtLy1u7iajYyUo6uqpJ+XkY2NjYyKiISZZ2dohIRYW4SEVleUq7q6sI1EREtlkZFbXJOrvr68sZeZmJhnZ2dnZ7a4QUNDP8vR0c/Oy8tFR0eZmZmZmZmZmShmg6q4qYqTpbq7uLWzq6igoJ6Xko2BdmNROC01SkMqAOH3/v/73wDh+v//+eoA6Pj+//nqAOj4///46gDk9vxnZ2dnqKqtgHl1gJSdnZV3cHOCjZyjoJyYl5SUmZmZmUNBRUdLVFhicHt+fn5+fn5+fn5+fn2BiJSns7/ExsbFcHBwcHBtbW1sbGxsbW1sbG1ubXzBw3M1HyApamxtbWzPz8/Oz8nBs5R7Zl1FOTw4RFJgc4mgvsXLy1dSUltix3FwcHBwc3V1dXV1dXNxcXFy1tYgIiJ2dnZ2dnZ1cXFxXDooNVowKDBcMCk1Q1BdeI2kvt3q4Ljd5tyx3+jcqH1mX19mZ2eZmYQ8PkZHSldddYKPlJmZmZmZmZmZmZmTjGdnZ3l4eHl5bFVMSklUgKSxsbawmqqzy76Yk7O+tLCtUTowLVKPsMHS1dHOzMfDtauZgWBFPDEzMTE+XICTjoFnZ2dnW09LXU5FVmNzhJOerrqnj4S/uJmZmZmZmZmZmb5RUElMTrXQ3N3cyYZwbHWOo8HV3dvBnZWOj5mgq7G4fX18gMG/e3h4eXl5fHx8gcG8gjAvLi4uLi4xMTAwL31HxMXGxsbFxcXFxURBPz8/QMPDxMTDw0ZDQ0FGRkdHR5q50OPcv62YhHV2j6u1qo5xVUpUcImKe2dSQCMcL0ZleGtcPDEuJygzYGNjZWZmZ567w8XAqaCOj4+SlJWUlIxlZWVHNjAkJTFQX2BgYGBfYp2qsbGwqJmRjoN8dXJubGdnZ2dUTEtQVFhfZWhxfI2vwMbJyb6qZ1pSRUaZmZmZgIePoLvQ29GwdrDQ3NS+nmFBKyMvT5JPLiQvRF9weH+uvsTEuqBYo7nAwL6vd2FQR0dHandqSklJSUlJSldshv8SfP8NaP7/DAz/B/0DA8T/yw/r++4PbfcSEvX4FBpaUWfJe7Cfqatnq2erqZ9KO5N952qZW4d2c3WGxlCZmdJnZ2dnZ2dnZ2dnZ2dnZ2dnmZmZmZmZmZmZmZmZmZmZmWdnZ2dnZ2dnZ2dnZ2dnZ2eZmZmZmZmZmZmZmZmZmZmZZ2dnZ2dnZ2dnZ2dnZ2dnZ5mZmZmZmZmZmZmZmZmZmZmenJR5d4KSlYRmVlBRUVJnr8fHwbSrpaKelHllZWVugWdnZ2dnZ2dnZ2dnZ2dnZ2eZmZmZmZmZmZmZmZmZmZmZZ2dnZ2dnZ2dnZ2dnZ2dnZ5mZmZmZmZmZmZmZmZmZmZlnZ2dnbmBfYmuOvsC5qJKHhIB+fXx8fXFnVVaan5mZmWdnZ2dnZ2dnZ2dnZ2dnZ2eZmZmZmZmZmZmZmZmZmZmZZ2dnZ2dnZ2dnZ2dnZ2dnZ5mZmZmZmZmZmZmZmZmZmZlnZ2dnZ2dnZ2dnZ2dnZ2dnmZmZmZmZmZmZmZmZmZmZmWdnZ2dhWoGRhltYZXyap6mfc3FmYXycqa6kj4J9fYGMZ2dnZ2dnZ2dnZ2dnZ2dnZ5mZmZmZmZmZmZmZmZmZmZlzdTw6Oz8/Pz9FR0pPV2Fqc36JjZqgqrC2vL+/vnd3c5pROjQxKycrKysuMDAxNj44ODtKk7zL0NS/jK/A0Mm4Z2dnZ2dnZ2dnZ2dnZ2dnZ5KtwdDMwamNZmdnZ2dnZ2eKg2dfaGt5eYS4mnBmY2VnZ2dna4+rq6t+bnZ2oKOnmLCwZ0k8Ozs7PEBLUltsj6q0ury6mX1RSpi5uFBKh6u5S05Ma2trampqTE5OTk5OecnJysvLra+urq60yc7OzspwcHJy1NbX2NjY1tR1cnV1c3Nzubm2tkNBQUNxcHJycaurq2dnZ2dmY2NqxsbExV9fX2HGycbGxkVEPkA8Ozs7Ii5L/+sAGi9FYXecvtXh7PX5/v7+/v7++/Dr3LAoDRMjIiUCIy8rPDRHUU9GHhMZIDUKCkQqGhoKCQwREy88PoSMnIynoLuoz7i8l6eCcnxXZjlOGE9BbmGCopfGp7iZQUNFTHagya6TcEVDQUFBW2iBmai5xc/Gua2VfWtWTkc7Ozs8tLS0trS0Ojo4ODk5uLi4tra2tbW2tra4tbW1tT5WaHFzbF1QODlLbp21w8/Rz8/Pz9DR0dHR0c65h1Y+coOgu8TDuZ13YEA0MDM/VG2Hmaq1wMXGxsO1p5SAc206c3NzlaeooIhYQzpAZnZ1dsPBwMDBwcHBwHV3dnM7O09wlMXav5d2XUs1IjtGXHWPorDF2MOtmYFxW0s6LygkZ2doMzMzMTNlZWhnlZWVlZWV0NDS0NDQ0NDPmJmZmWeYXC8tLS0tLispKTxlfJGcnaq1uriulJK4trWYlbq4qGdnZ2dnZ2dnZ2dnZ2dnZ2eZqL7Hyb+xnJSEfTEpQJyaZ2dnZ2evsLS5Tjw8RU5PZ5mZmZmZmWhdXF+ZmZmZmZlnZ2eAl56VaFJFQ0VKZ2dnmZmZmZmZmZmZmZmZmZmZmWJnZ2dnZ2dnZ2dnZ2dnZ2eZtb6+saOVh3x5cVQ/QUxfNEFOXWVrc36Hj5yjpaijeJejtsDFys/V1tfX1tXV1SuaUTpYVlZ5WlxdXDAwMWA+ODg7SpO5xtDOz6TQ0Mq8rspnUVFMS1ZztsbHvq+djU9PUGF2iZior7i+wMHDxsnKP1BmZWA4NCozO1eInrPBxYaGg7+/moJRQDAkIyMkKTNbWldXV2d2dmc4ODg5OnmvxcTExMSxV1hYWFiImZmZilqCipRyj5uHomxkmX19hY2giWeHZmSMg5RnmIGZpYFmDw4LCgoJCAcHBgYFBQQEAwMDAgICAgICAgICAgICAgAPDgsKCQkJCAgIBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwEODg4ODg4ODg0MDAwMDAwMDAwLCwsLCwsLCwoKCgoKAgUICgsNDg8PDw8PDw8ODg0NDAwLCwsKCgoJCQgICAcPDgwLCgkIBwcGBgYGBQUFBQUEBAMDAgICAgEBAQ8PDw8ODg4ODg4ODg4ODg4ODg0NDAwLCgoJCAgGBQQCAQAAAAUHCQoLCwwMDA0NDQ0ODg4ODg0NDQ0NDAwMDAwMDAwBAQECAgIDAwMDBAQFBAQFBQYHBwgJCQoLCwwNDg4ODg8ODAsKCQgHBwYGBgYFBQUFBQQEAwMCAgICAQEBAQAADw4MCwoJCAcHBgYGBgUFBQUFBAQDAwICAgIBAQEBAAAPDgwLCgkIBwcGBgYGBQUFBQUEBAMDAgICAgEBAQEAAA8ODAsKCQgHBwYGBgYFBQUFBQQEAwMCAgICAQEBAQAADw4MCwoJCAcHBgYGBgUFBQUFBAQDAwICAgIBAQEBAAAPDgwLCgkIBwcGBgYGBQUFBQUEBAMDAgICAgEBAQEAAA8ODAsKCQgHBwYGBgYFBQUFBQQEAwMCAgICAQEBAQAADw4MCwoJCAcHBgcGBgYGBQUFBQYHCAgHCAgBAQEBAAA=";
});

/*global requirejs*/
define('SEnvWorker',["SEnv","WorkerServiceW","Tones.wdt","promise"],function (SEnv, WS,wdt,_) {
    var e;
    WS.serv("MezonetJS/wavOut",function (params) {
        var p=Promise.resolve();
        if (!e) {
            var ctx={sampleRate:params.sampleRate};
            e=new SEnv(ctx,{wavOutSpeed:10000});
            p=e.loadWDT(wdt);
        }
        return p.then(function () {
            return e.load(params.mzo);
        }).then(function () {
            return e.wavOut();
        }).then(function (arysrc) {
            return {arysrc:arysrc, loopStartFrac:e.loopStartFrac};
        });
    });
    WS.serv("test", function () {
        console.log("TEST!!");
        return "OK";
    });
    WS.ready();
});


require(["SEnvWorker"]);
