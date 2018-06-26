define(["assert","FuncUtil"],function (A,FuncUtil) {
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
