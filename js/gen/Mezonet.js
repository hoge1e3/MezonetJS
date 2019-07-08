(function (root, factory) {
    root.Mezonet = factory();
}(this, function () {
var requirejs,require,define;(function(undef){var main,req,makeMap,handlers,defined={},waiting={},config={},defining={},hasOwn=Object.prototype.hasOwnProperty,aps=[].slice,jsSuffixRegExp=/\.js$/;function hasProp(obj,prop){return hasOwn.call(obj,prop)}function normalize(name,baseName){var nameParts,nameSegment,mapValue,foundMap,lastIndex,foundI,foundStarMap,starI,i,j,part,normalizedBaseParts,baseParts=baseName&&baseName.split("/"),map=config.map,starMap=map&&map["*"]||{};if(name){name=name.split("/");lastIndex=name.length-1;if(config.nodeIdCompat&&jsSuffixRegExp.test(name[lastIndex])){name[lastIndex]=name[lastIndex].replace(jsSuffixRegExp,"")}if(name[0].charAt(0)==="."&&baseParts){normalizedBaseParts=baseParts.slice(0,baseParts.length-1);name=normalizedBaseParts.concat(name)}for(i=0;i<name.length;i++){part=name[i];if(part==="."){name.splice(i,1);i-=1}else if(part===".."){if(i===0||i===1&&name[2]===".."||name[i-1]===".."){continue}else if(i>0){name.splice(i-1,2);i-=2}}}name=name.join("/")}if((baseParts||starMap)&&map){nameParts=name.split("/");for(i=nameParts.length;i>0;i-=1){nameSegment=nameParts.slice(0,i).join("/");if(baseParts){for(j=baseParts.length;j>0;j-=1){mapValue=map[baseParts.slice(0,j).join("/")];if(mapValue){mapValue=mapValue[nameSegment];if(mapValue){foundMap=mapValue;foundI=i;break}}}}if(foundMap){break}if(!foundStarMap&&starMap&&starMap[nameSegment]){foundStarMap=starMap[nameSegment];starI=i}}if(!foundMap&&foundStarMap){foundMap=foundStarMap;foundI=starI}if(foundMap){nameParts.splice(0,foundI,foundMap);name=nameParts.join("/")}}return name}function makeRequire(relName,forceSync){return function(){var args=aps.call(arguments,0);if(typeof args[0]!=="string"&&args.length===1){args.push(null)}return req.apply(undef,args.concat([relName,forceSync]))}}function makeNormalize(relName){return function(name){return normalize(name,relName)}}function makeLoad(depName){return function(value){defined[depName]=value}}function callDep(name){if(hasProp(waiting,name)){var args=waiting[name];delete waiting[name];defining[name]=true;main.apply(undef,args)}if(!hasProp(defined,name)&&!hasProp(defining,name)){throw new Error("No "+name)}return defined[name]}function splitPrefix(name){var prefix,index=name?name.indexOf("!"):-1;if(index>-1){prefix=name.substring(0,index);name=name.substring(index+1,name.length)}return[prefix,name]}function makeRelParts(relName){return relName?splitPrefix(relName):[]}makeMap=function(name,relParts){var plugin,parts=splitPrefix(name),prefix=parts[0],relResourceName=relParts[1];name=parts[1];if(prefix){prefix=normalize(prefix,relResourceName);plugin=callDep(prefix)}if(prefix){if(plugin&&plugin.normalize){name=plugin.normalize(name,makeNormalize(relResourceName))}else{name=normalize(name,relResourceName)}}else{name=normalize(name,relResourceName);parts=splitPrefix(name);prefix=parts[0];name=parts[1];if(prefix){plugin=callDep(prefix)}}return{f:prefix?prefix+"!"+name:name,n:name,pr:prefix,p:plugin}};function makeConfig(name){return function(){return config&&config.config&&config.config[name]||{}}}handlers={require:function(name){return makeRequire(name)},exports:function(name){var e=defined[name];if(typeof e!=="undefined"){return e}else{return defined[name]={}}},module:function(name){return{id:name,uri:"",exports:defined[name],config:makeConfig(name)}}};main=function(name,deps,callback,relName){var cjsModule,depName,ret,map,i,relParts,args=[],callbackType=typeof callback,usingExports;relName=relName||name;relParts=makeRelParts(relName);if(callbackType==="undefined"||callbackType==="function"){deps=!deps.length&&callback.length?["require","exports","module"]:deps;for(i=0;i<deps.length;i+=1){map=makeMap(deps[i],relParts);depName=map.f;if(depName==="require"){args[i]=handlers.require(name)}else if(depName==="exports"){args[i]=handlers.exports(name);usingExports=true}else if(depName==="module"){cjsModule=args[i]=handlers.module(name)}else if(hasProp(defined,depName)||hasProp(waiting,depName)||hasProp(defining,depName)){args[i]=callDep(depName)}else if(map.p){map.p.load(map.n,makeRequire(relName,true),makeLoad(depName),{});args[i]=defined[depName]}else{throw new Error(name+" missing "+depName)}}ret=callback?callback.apply(defined[name],args):undefined;if(name){if(cjsModule&&cjsModule.exports!==undef&&cjsModule.exports!==defined[name]){defined[name]=cjsModule.exports}else if(ret!==undef||!usingExports){defined[name]=ret}}}else if(name){defined[name]=callback}};requirejs=require=req=function(deps,callback,relName,forceSync,alt){if(typeof deps==="string"){if(handlers[deps]){return handlers[deps](callback)}return callDep(makeMap(deps,makeRelParts(callback)).f)}else if(!deps.splice){config=deps;if(config.deps){req(config.deps,config.callback)}if(!callback){return}if(callback.splice){deps=callback;callback=relName;relName=null}else{deps=undef}}callback=callback||function(){};if(typeof relName==="function"){relName=forceSync;forceSync=alt}if(forceSync){main(undef,deps,callback,relName)}else{setTimeout(function(){main(undef,deps,callback,relName)},4)}return req};req.config=function(cfg){return req(cfg)};requirejs._defined=defined;define=function(name,deps,callback){if(typeof name!=="string"){throw new Error("See almond README: incorrect module build, no module name")}if(!deps.splice){callback=deps;deps=[]}if(!hasProp(defined,name)&&!hasProp(waiting,name)){waiting[name]=[name,deps,callback]}};define.amd={jQuery:true}})();

define("almond", function(){});

define('WorkerFactory',[],function () {
    var WorkerFactory={
        extractSrcFromFunction: function (f,startMark,endMark) {
            startMark=startMark||/(.|\s)*WORKER[_]SRC[_]BEGIN\*\//;
            endMark=endMark||/\/\*WORKER[_]SRC[_]END(.|\s)*/;
            var src=(""+f).replace(startMark,"").replace(endMark,"");
            return src;
        },
        createFromFunction: function (f,startMark,endMark) {
            var src=this.extractSrcFromFunction(f,startMark,endMark);
            return this.createFromString(src);
        },
        urlFromString: function (src) {
            return URL.createObjectURL( new Blob([src] ,{type:"text/javascript"} ));
        },
        createFromString: function (src) {
            var url=this.urlFromString(src);
            return new Worker(url);
        },
        requireUrl: function (name) {
            return "worker.js?main="+name;
        },
        require: function (name) {
            return new Worker(this.requireUrl(name));
        },
        create: function (src) {
            if (typeof src==="string") {
                return this.require(src);
            } else if (typeof src==="function") {
                return this.createFromFunction(src);
            }
            throw new Error("Invaluid src type "+src);
        }
    };

    return WorkerFactory;
});

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

define('Klass',["assert"],function (A) {
    var Klass={};
    Klass.define=function (pd) {
        var p,parent;
        if (pd.$parent) {
            parent=pd.$parent;
            p=Object.create(parent.prototype);
            p.super=function () {
                var a=Array.prototype.slice.call(arguments);
                var n=a.shift();
                return parent.prototype[n].apply(this,a);
            };
        } else {
            p={};
        }
        var thisName,singletonName;
        if (pd.$this) {
            thisName=pd.$this;
        }
        if (pd.$singleton) {
            singletonName=pd.$singleton;
        }
        var init=wrap(pd.$) || function (e) {
            if (e && typeof e=="object") {
                for (var k in e) {
                    this[k]=e[k];
                }
            }
        };
        var fldinit;
        var warn,wrapped,wrapCancelled;
        //var check;
        if (init instanceof Array) {
            fldinit=init;
            init=function () {
                var a=Array.prototype.slice.call(arguments);
                for (var i=0;i<fldinit.length;i++) {
                    if (a.length>0) this[fldinit[i]]=a.shift();
                }
            };
        }
        var klass;
        function checkSchema(self) {
            if (pd.$fields) {
                //console.log("Checking schema",self,pd.$fields);
                A.is(self,pd.$fields);
            }
        }
        klass=function () {
            if (! (this instanceof klass)) {
                var res=Object.create(p);
                init.apply(res,arguments);
                checkSchema(res);
                return res;
            }
            init.apply(this,arguments);
            checkSchema(this);
        };
        if (parent) {
            klass.super=function () {
                var a=Array.prototype.slice.call(arguments);
                var t=a.shift();
                var n=a.shift();
                return parent.prototype[n].apply(t,a);
            };
        }
        klass.inherit=function (pd) {
            pd.$parent=klass;
            return Klass.define(pd);
        };
        klass.prototype=p;
        for (var name in pd) {
            if (name[0]=="$") continue;
            if (name.substring(0,7)=="static$") {
                klass[name.substring(7)]=wrapStatic(pd[name]);
            } else {
                if (isPropDesc(pd[name])) {
                    Object.defineProperty(p,name,wrap(pd[name], name));
                } else {
                    p[name]=wrap(pd[name], name);
                }
            }
        }
        function wrapStatic(m) {
            if (!singletonName) return m;
            var args=getArgs(m);
            if (args[0]!==singletonName) return m;
            return (function () {
                var a=Array.prototype.slice.call(arguments);
                a.unshift(klass);
                return m.apply(klass,a);
            });
        }
        function wrap(m,mname) {
            if (!thisName) return m;
            if (isPropDesc(m)) {
                for (var k in m) {
                    m[k]=wrap(m[k]);
                }
                return m;
            }
            if (typeof m!=="function") return m;
            if (thisName!==true) {
                var args=getArgs(m);
                if (args[0]!==thisName) {
                    wrapCancelled=wrapCancelled||[];
                    wrapCancelled.push(mname);
                    return m;
                }
                warn=true;
            }
            wrapped=true;
            return (function () {
                var a=Array.prototype.slice.call(arguments);
                a.unshift(this);
                return m.apply(this,a);
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
        if (warn) {
            //console.warn("This declaration style may malfunction when minified");
            if (!wrapCancelled) {
                console.warn("Use $this:true instead");
            } else {
                console.warn("Use python style in all methods and Use $this:true instead",wrapCancelled);
            }
            try {
                throw new Error("Stakku");
            } catch (e) {
                console.log(e.stack);
            }
            //console.warn(pd);
        }
        return klass;
    };
    function getArgs(f) {
        var fpat=/function[^\(]*\(([^\)]*)\)/;
        var r=fpat.exec(f+"");
        if (r) {
            return r[1].replace(/\s/g,"").split(",");
        }
        return [];
    }
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
    Klass.Function=function () {throw new Error("Abstract");};
    Klass.opt=A.opt;
    Klass.Binder=Klass.define({
        $this:true,
        $:function (t,target) {
            function addMethod(k){
                if (typeof target[k]!=="function") return;
                t[k]=function () {
                    var a=Array.prototype.slice.call(arguments);
                    //console.log(this, this.__target);
                    //A(this.__target,"target is not set");
                    return target[k].apply(target,a);
                };
            }
            for (var k in target) addMethod(k);
        }
    });
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
/*global window,self,global*/
define('root',[],function (){
    if (typeof window!=="undefined") return window;
    if (typeof self!=="undefined") return self;
    if (typeof global!=="undefined") return global;
    return (function (){return this;})();
});

// Browser Side
var idseq=0;
define('WorkerServiceB',["promise","Klass","root"], function (_,Klass,root) {
    var Wrapper=Klass.define({
        $this:true,
        $: function (t,worker) {
            t.idseq=1;
            t.queue={};
            t.worker=worker;
            t.readyQueue=[];
            worker.addEventListener("message",function (e) {
                //console.log("WSB: Recv ",e.data);

                var d=e.data;
                if (d.reverse) {
                    t.procReverse(e);
                } else if (d.ready) {
                    t.ready();
                } else if (d.id) {
                    t.queue[d.id](d);
                    delete t.queue[d.id];
                }
            });
            t.run("WorkerService/isReady").then(function (r) {
                if (r) t.ready();
            });
        },
        procReverse: function (t,e) {
            var d=e.data;
            var id=d.id;
            var path=d.path;
            var params=d.params;
            try {
                Promise.resolve(paths[path](params)).then(function (r) {
                    t.worker.postMessage({
                        reverse:true,
                        status:"ok",
                        id:id,
                        result: r
                    });
                },sendError);
            } catch(err) {
                sendError(err);
            }
            function sendError(e) {
                t.worker.postMessage({
                    reverse: true,
                    id:id, error:e?(e.stack||e+""):"unknown", status:"error"
                });
            }
        },
        ready: function (t) {
            if (t.isReady) return;
            t.isReady=true;
            console.log("Worker is ready!");
            t.readyQueue.forEach(function (f){ f();});
        },
        readyPromise: function (t) {
            return new Promise(function (succ) {
                if (t.isReady) return succ();
                t.readyQueue.push(succ);
            });
        },
        run: function (t, path, params) {
            return t.readyPromise().then(function() {
                return new Promise(function (succ,err) {
                    var id=t.idseq++;
                    t.queue[id]=function (e) {
                        //console.log("Status",e);
                        if (e.status=="ok") {
                            succ(e.result);
                        } else {
                            err(e.error);
                        }
                    };
                    t.worker.postMessage({
                        id: id,
                        path: path,
                        params: params
                    });
                });
            });
        },
        terminate: function (t) {
            t.worker.terminate();
        }
    });
    var paths={};
    root.WorkerService={
        Wrapper:Wrapper,
        load: function (src) {
            var w=new Worker(src);
            return new Wrapper(w);
        },
        install: function (path, func) {
            paths[path]=func;
        },
        serv: function (path,func) {
            this.install(path,func);
        }
    };
    root.WorkerService.serv("console/log", function (params){
        console.log.apply(console,params);
    });
    return root.WorkerService;
});

/*global requirejs*/
define('MezonetClient',["WorkerFactory","WorkerServiceB","Klass"],function (WorkerFactory,WS,Klass) {
    Promise.prototype.finally = Promise.prototype.finally || function (fn) {
        function onFinally(cb){
            return Promise.resolve(fn()).then(cb);
        }
        return this.then(
            function (result) {
                return onFinally(function(){
                    return result;
                });
            },
            function (reason) {
                return onFinally(function(){
                    return Promise.reject(reason);
                });
            }
        );
    };
    var workerURL=WorkerFactory.urlFromString("var requirejs,require,define;(function(undef){var main,req,makeMap,handlers,defined={},waiting={},config={},defining={},hasOwn=Object.prototype.hasOwnProperty,aps=[].slice,jsSuffixRegExp=/\\.js$/;function hasProp(obj,prop){return hasOwn.call(obj,prop)}function normalize(name,baseName){var nameParts,nameSegment,mapValue,foundMap,lastIndex,foundI,foundStarMap,starI,i,j,part,normalizedBaseParts,baseParts=baseName&&baseName.split(\"/\"),map=config.map,starMap=map&&map[\"*\"]||{};if(name){name=name.split(\"/\");lastIndex=name.length-1;if(config.nodeIdCompat&&jsSuffixRegExp.test(name[lastIndex])){name[lastIndex]=name[lastIndex].replace(jsSuffixRegExp,\"\")}if(name[0].charAt(0)===\".\"&&baseParts){normalizedBaseParts=baseParts.slice(0,baseParts.length-1);name=normalizedBaseParts.concat(name)}for(i=0;i<name.length;i++){part=name[i];if(part===\".\"){name.splice(i,1);i-=1}else if(part===\"..\"){if(i===0||i===1&&name[2]===\"..\"||name[i-1]===\"..\"){continue}else if(i>0){name.splice(i-1,2);i-=2}}}name=name.join(\"/\")}if((baseParts||starMap)&&map){nameParts=name.split(\"/\");for(i=nameParts.length;i>0;i-=1){nameSegment=nameParts.slice(0,i).join(\"/\");if(baseParts){for(j=baseParts.length;j>0;j-=1){mapValue=map[baseParts.slice(0,j).join(\"/\")];if(mapValue){mapValue=mapValue[nameSegment];if(mapValue){foundMap=mapValue;foundI=i;break}}}}if(foundMap){break}if(!foundStarMap&&starMap&&starMap[nameSegment]){foundStarMap=starMap[nameSegment];starI=i}}if(!foundMap&&foundStarMap){foundMap=foundStarMap;foundI=starI}if(foundMap){nameParts.splice(0,foundI,foundMap);name=nameParts.join(\"/\")}}return name}function makeRequire(relName,forceSync){return function(){var args=aps.call(arguments,0);if(typeof args[0]!==\"string\"&&args.length===1){args.push(null)}return req.apply(undef,args.concat([relName,forceSync]))}}function makeNormalize(relName){return function(name){return normalize(name,relName)}}function makeLoad(depName){return function(value){defined[depName]=value}}function callDep(name){if(hasProp(waiting,name)){var args=waiting[name];delete waiting[name];defining[name]=true;main.apply(undef,args)}if(!hasProp(defined,name)&&!hasProp(defining,name)){throw new Error(\"No \"+name)}return defined[name]}function splitPrefix(name){var prefix,index=name?name.indexOf(\"!\"):-1;if(index>-1){prefix=name.substring(0,index);name=name.substring(index+1,name.length)}return[prefix,name]}function makeRelParts(relName){return relName?splitPrefix(relName):[]}makeMap=function(name,relParts){var plugin,parts=splitPrefix(name),prefix=parts[0],relResourceName=relParts[1];name=parts[1];if(prefix){prefix=normalize(prefix,relResourceName);plugin=callDep(prefix)}if(prefix){if(plugin&&plugin.normalize){name=plugin.normalize(name,makeNormalize(relResourceName))}else{name=normalize(name,relResourceName)}}else{name=normalize(name,relResourceName);parts=splitPrefix(name);prefix=parts[0];name=parts[1];if(prefix){plugin=callDep(prefix)}}return{f:prefix?prefix+\"!\"+name:name,n:name,pr:prefix,p:plugin}};function makeConfig(name){return function(){return config&&config.config&&config.config[name]||{}}}handlers={require:function(name){return makeRequire(name)},exports:function(name){var e=defined[name];if(typeof e!==\"undefined\"){return e}else{return defined[name]={}}},module:function(name){return{id:name,uri:\"\",exports:defined[name],config:makeConfig(name)}}};main=function(name,deps,callback,relName){var cjsModule,depName,ret,map,i,relParts,args=[],callbackType=typeof callback,usingExports;relName=relName||name;relParts=makeRelParts(relName);if(callbackType===\"undefined\"||callbackType===\"function\"){deps=!deps.length&&callback.length?[\"require\",\"exports\",\"module\"]:deps;for(i=0;i<deps.length;i+=1){map=makeMap(deps[i],relParts);depName=map.f;if(depName===\"require\"){args[i]=handlers.require(name)}else if(depName===\"exports\"){args[i]=handlers.exports(name);usingExports=true}else if(depName===\"module\"){cjsModule=args[i]=handlers.module(name)}else if(hasProp(defined,depName)||hasProp(waiting,depName)||hasProp(defining,depName)){args[i]=callDep(depName)}else if(map.p){map.p.load(map.n,makeRequire(relName,true),makeLoad(depName),{});args[i]=defined[depName]}else{throw new Error(name+\" missing \"+depName)}}ret=callback?callback.apply(defined[name],args):undefined;if(name){if(cjsModule&&cjsModule.exports!==undef&&cjsModule.exports!==defined[name]){defined[name]=cjsModule.exports}else if(ret!==undef||!usingExports){defined[name]=ret}}}else if(name){defined[name]=callback}};requirejs=require=req=function(deps,callback,relName,forceSync,alt){if(typeof deps===\"string\"){if(handlers[deps]){return handlers[deps](callback)}return callDep(makeMap(deps,makeRelParts(callback)).f)}else if(!deps.splice){config=deps;if(config.deps){req(config.deps,config.callback)}if(!callback){return}if(callback.splice){deps=callback;callback=relName;relName=null}else{deps=undef}}callback=callback||function(){};if(typeof relName===\"function\"){relName=forceSync;forceSync=alt}if(forceSync){main(undef,deps,callback,relName)}else{setTimeout(function(){main(undef,deps,callback,relName)},4)}return req};req.config=function(cfg){return req(cfg)};requirejs._defined=defined;define=function(name,deps,callback){if(typeof name!==\"string\"){throw new Error(\"See almond README: incorrect module build, no module name\")}if(!deps.splice){callback=deps;deps=[]}if(!hasProp(defined,name)&&!hasProp(waiting,name)){waiting[name]=[name,deps,callback]}};define.amd={jQuery:true}})();\n\ndefine(\"almond\", function(){});\n\ndefine('assert',[],function () {\r\n    var Assertion=function(failMesg) {\r\n        this.failMesg=flatten(failMesg || \"Assertion failed: \");\r\n    };\r\n    var $a;\r\n    Assertion.prototype={\r\n        _regedType:{},\r\n        registerType: function (name,t) {\r\n            this._regedType[name]=t;\r\n        },\r\n        MODE_STRICT:\"strict\",\r\n        MODE_DEFENSIVE:\"defensive\",\r\n        MODE_BOOL:\"bool\",\r\n        fail:function () {\r\n            var a=$a(arguments);\r\n            var value=a.shift();\r\n            a=flatten(a);\r\n            a=this.failMesg.concat(value).concat(a);//.concat([\"(mode:\",this._mode,\")\"]);\r\n            console.log.apply(console,a);\r\n            if (this.isDefensive()) return value;\r\n            if (this.isBool()) return false;\r\n            throw new Error(a.join(\" \"));\r\n        },\r\n        subAssertion: function () {\r\n            var a=$a(arguments);\r\n            a=flatten(a);\r\n            return new Assertion(this.failMesg.concat(a));\r\n        },\r\n        assert: function (t,failMesg) {\r\n            if (!t) return this.fail(t,failMesg);\r\n            return t;\r\n        },\r\n        eq: function (a,b) {\r\n            if (a!==b) return this.fail(a,\"!==\",b);\r\n            return this.isBool()?true:a;\r\n        },\r\n        ne: function (a,b) {\r\n            if (a===b) return this.fail(a,\"===\",b);\r\n            return this.isBool()?true:a;\r\n        },\r\n        isset: function (a, n) {\r\n            if (a==null) return this.fail(a, (n||\"\")+\" is null/undef\");\r\n            return this.isBool()?true:a;\r\n        },\r\n        is: function (value,type) {\r\n            var t=type,v=value;\r\n            if (t==null) {\r\n                return this.fail(value, \"assert.is: type must be set\");\r\n                // return t; Why!!!!???? because is(args,[String,Number])\r\n            }\r\n            if (t._assert_func) {\r\n                t._assert_func.apply(this,[v]);\r\n                return this.isBool()?true:value;\r\n            }\r\n            this.assert(value!=null,[value, \"should be \",t]);\r\n            if (t instanceof Array || (typeof global==\"object\" && typeof global.Array==\"function\" && t instanceof global.Array) ) {\r\n                if (!value || typeof value.length!=\"number\") {\r\n                    return this.fail(value, \"should be array:\");\r\n                }\r\n                var self=this;\r\n                for (var i=0 ;i<t.length; i++) {\r\n                    var na=self.subAssertion(\"failed at \",value,\"[\",i,\"]: \");\r\n                    if (t[i]==null) {\r\n                        console.log(\"WOW!7\", v[i],t[i]);\r\n                    }\r\n                    na.is(v[i],t[i]);\r\n                }\r\n                return this.isBool()?true:value;\r\n            }\r\n            if (t===String || t==\"string\") {\r\n                this.assert(typeof(v)==\"string\",[v,\"should be a string \"]);\r\n                return this.isBool()?true:value;\r\n            }\r\n            if (t===Number || t==\"number\") {\r\n                this.assert(typeof(v)==\"number\",[v,\"should be a number\"]);\r\n                return this.isBool()?true:value;\r\n            }\r\n            if (t===Boolean || t==\"boolean\") {\r\n                this.assert(typeof(v)==\"boolean\",[v,\"should be a boolean\"]);\r\n                return this.isBool()?true:value;\r\n            }\r\n            if (t instanceof RegExp || (typeof global==\"object\" && typeof global.RegExp==\"function\" && t instanceof global.RegExp)) {\r\n                this.is(v,String);\r\n                this.assert(t.exec(v),[v,\"does not match to\",t]);\r\n                return this.isBool()?true:value;\r\n            }\r\n            if (t===Function) {\r\n                this.assert(typeof v==\"function\",[v,\"should be a function\"]);\r\n                return this.isBool()?true:value;\r\n            }\r\n            if (typeof t==\"function\") {\r\n                this.assert((v instanceof t),[v, \"should be \",t]);\r\n                return this.isBool()?true:value;\r\n            }\r\n            if (t && typeof t==\"object\") {\r\n                for (var k in t) {\r\n                    var na=this.subAssertion(\"failed at \",value,\".\",k,\":\");\r\n                    na.is(value[k],t[k]);\r\n                }\r\n                return this.isBool()?true:value;\r\n            }\r\n            if (typeof t==\"string\") {\r\n                var ty=this._regedType[t];\r\n                if (ty) return this.is(value,ty);\r\n                //console.log(\"assertion Warning:\",\"unregistered type:\", t, \"value:\",value);\r\n                return this.isBool()?true:value;\r\n            }\r\n            return this.fail(value, \"Invaild type: \",t);\r\n        },\r\n        ensureError: function (action, err) {\r\n            try {\r\n                action();\r\n            } catch(e) {\r\n                if(typeof err==\"string\") {\r\n                    assert(e+\"\"===err,action+\" thrown an error \"+e+\" but expected:\"+err);\r\n                }\r\n                console.log(\"Error thrown successfully: \",e.message);\r\n                return;\r\n            }\r\n            this.fail(action,\"should throw an error\",err);\r\n        },\r\n        setMode:function (mode) {\r\n            this._mode=mode;\r\n        },\r\n        isDefensive:function () {\r\n            return this._mode===this.MODE_DEFENSIVE;\r\n        },\r\n        isBool:function () {\r\n            return this._mode===this.MODE_BOOL;\r\n        },\r\n        isStrict:function () {\r\n            return !this.isDefensive() && !this.isBool();\r\n        }\r\n    };\r\n    $a=function (args) {\r\n        var a=[];\r\n        for (var i=0; i<args.length ;i++) a.push(args[i]);\r\n        return a;\r\n    };\r\n    var top=new Assertion();\r\n    var assert=function () {\r\n        try {\r\n            return top.assert.apply(top,arguments);\r\n        } catch(e) {\r\n            throw new Error(e.stack);\r\n        }\r\n    };\r\n    [\"setMode\",\"isDefensive\",\"is\",\"isset\",\"ne\",\"eq\",\"ensureError\"].forEach(function (m) {\r\n        assert[m]=function () {\r\n            try {\r\n                return top[m].apply(top,arguments);\r\n            } catch(e) {\r\n                console.log(e.stack);\r\n                //if (top.isDefensive()) return arguments[0];\r\n                //if (top.isBool()) return false;\r\n                throw new Error(e.message);\r\n            }\r\n        };\r\n    });\r\n    assert.fail=top.fail.bind(top);\r\n    assert.MODE_STRICT=top.MODE_STRICT;\r\n    assert.MODE_DEFENSIVE=top.MODE_DEFENSIVE;\r\n    assert.MODE_BOOL=top.MODE_BOOL;\r\n    assert.f=function (f) {\r\n        return {\r\n            _assert_func: f\r\n        };\r\n    };\r\n    assert.opt=function (t) {\r\n        return assert.f(function (v) {\r\n            return v==null || v instanceof t;\r\n        });\r\n    };\r\n    assert.and=function () {\r\n        var types=$a(arguments);\r\n        assert(types instanceof Array);\r\n        return assert.f(function (value) {\r\n            var t=this;\r\n            for (var i=0; i<types.length; i++) {\r\n                t.is(value,types[i]);\r\n            }\r\n        });\r\n    };\r\n    function flatten(a) {\r\n        if (a instanceof Array) {\r\n            var res=[];\r\n            a.forEach(function (e) {\r\n                res=res.concat(flatten(e));\r\n            });\r\n            return res;\r\n        }\r\n        return [a];\r\n    }\r\n    function isArg(a) {\r\n        return \"length\" in a && \"caller\" in a && \"callee\" in a;\r\n    };\r\n    return assert;\r\n});\r\n\ndefine('Klass',[\"assert\"],function (A) {\r\n    var Klass={};\r\n    Klass.define=function (pd) {\r\n        var p,parent;\r\n        if (pd.$parent) {\r\n            parent=pd.$parent;\r\n            p=Object.create(parent.prototype);\r\n            p.super=function () {\r\n                var a=Array.prototype.slice.call(arguments);\r\n                var n=a.shift();\r\n                return parent.prototype[n].apply(this,a);\r\n            };\r\n        } else {\r\n            p={};\r\n        }\r\n        var thisName,singletonName;\r\n        if (pd.$this) {\r\n            thisName=pd.$this;\r\n        }\r\n        if (pd.$singleton) {\r\n            singletonName=pd.$singleton;\r\n        }\r\n        var init=wrap(pd.$) || function (e) {\r\n            if (e && typeof e==\"object\") {\r\n                for (var k in e) {\r\n                    this[k]=e[k];\r\n                }\r\n            }\r\n        };\r\n        var fldinit;\r\n        var warn,wrapped,wrapCancelled;\r\n        //var check;\r\n        if (init instanceof Array) {\r\n            fldinit=init;\r\n            init=function () {\r\n                var a=Array.prototype.slice.call(arguments);\r\n                for (var i=0;i<fldinit.length;i++) {\r\n                    if (a.length>0) this[fldinit[i]]=a.shift();\r\n                }\r\n            };\r\n        }\r\n        var klass;\r\n        function checkSchema(self) {\r\n            if (pd.$fields) {\r\n                //console.log(\"Checking schema\",self,pd.$fields);\r\n                A.is(self,pd.$fields);\r\n            }\r\n        }\r\n        klass=function () {\r\n            if (! (this instanceof klass)) {\r\n                var res=Object.create(p);\r\n                init.apply(res,arguments);\r\n                checkSchema(res);\r\n                return res;\r\n            }\r\n            init.apply(this,arguments);\r\n            checkSchema(this);\r\n        };\r\n        if (parent) {\r\n            klass.super=function () {\r\n                var a=Array.prototype.slice.call(arguments);\r\n                var t=a.shift();\r\n                var n=a.shift();\r\n                return parent.prototype[n].apply(t,a);\r\n            };\r\n        }\r\n        klass.inherit=function (pd) {\r\n            pd.$parent=klass;\r\n            return Klass.define(pd);\r\n        };\r\n        klass.prototype=p;\r\n        for (var name in pd) {\r\n            if (name[0]==\"$\") continue;\r\n            if (name.substring(0,7)==\"static$\") {\r\n                klass[name.substring(7)]=wrapStatic(pd[name]);\r\n            } else {\r\n                if (isPropDesc(pd[name])) {\r\n                    Object.defineProperty(p,name,wrap(pd[name], name));\r\n                } else {\r\n                    p[name]=wrap(pd[name], name);\r\n                }\r\n            }\r\n        }\r\n        function wrapStatic(m) {\r\n            if (!singletonName) return m;\r\n            var args=getArgs(m);\r\n            if (args[0]!==singletonName) return m;\r\n            return (function () {\r\n                var a=Array.prototype.slice.call(arguments);\r\n                a.unshift(klass);\r\n                return m.apply(klass,a);\r\n            });\r\n        }\r\n        function wrap(m,mname) {\r\n            if (!thisName) return m;\r\n            if (isPropDesc(m)) {\r\n                for (var k in m) {\r\n                    m[k]=wrap(m[k]);\r\n                }\r\n                return m;\r\n            }\r\n            if (typeof m!==\"function\") return m;\r\n            if (thisName!==true) {\r\n                var args=getArgs(m);\r\n                if (args[0]!==thisName) {\r\n                    wrapCancelled=wrapCancelled||[];\r\n                    wrapCancelled.push(mname);\r\n                    return m;\r\n                }\r\n                warn=true;\r\n            }\r\n            wrapped=true;\r\n            return (function () {\r\n                var a=Array.prototype.slice.call(arguments);\r\n                a.unshift(this);\r\n                return m.apply(this,a);\r\n            });\r\n        }\r\n        p.$=init;\r\n        Object.defineProperty(p,\"$bind\",{\r\n            get: function () {\r\n                if (!this.__bounded) {\r\n                    this.__bounded=new Klass.Binder(this);\r\n                }\r\n                return this.__bounded;\r\n            }\r\n        });\r\n        if (warn) {\r\n            //console.warn(\"This declaration style may malfunction when minified\");\r\n            if (!wrapCancelled) {\r\n                console.warn(\"Use $this:true instead\");\r\n            } else {\r\n                console.warn(\"Use python style in all methods and Use $this:true instead\",wrapCancelled);\r\n            }\r\n            try {\r\n                throw new Error(\"Stakku\");\r\n            } catch (e) {\r\n                console.log(e.stack);\r\n            }\r\n            //console.warn(pd);\r\n        }\r\n        return klass;\r\n    };\r\n    function getArgs(f) {\r\n        var fpat=/function[^\\(]*\\(([^\\)]*)\\)/;\r\n        var r=fpat.exec(f+\"\");\r\n        if (r) {\r\n            return r[1].replace(/\\s/g,\"\").split(\",\");\r\n        }\r\n        return [];\r\n    }\r\n    function isPropDesc(o) {\r\n        if (typeof o!==\"object\") return false;\r\n        if (!o) return false;\r\n        var pk={configurable:1,enumerable:1,value:1,writable:1,get:1,set:1};\r\n        var c=0;\r\n        for (var k in o) {\r\n            if (!pk[k]) return false;\r\n            c+=pk[k];\r\n        }\r\n        return c;\r\n    }\r\n    Klass.Function=function () {throw new Error(\"Abstract\");};\r\n    Klass.opt=A.opt;\r\n    Klass.Binder=Klass.define({\r\n        $this:true,\r\n        $:function (t,target) {\r\n            function addMethod(k){\r\n                if (typeof target[k]!==\"function\") return;\r\n                t[k]=function () {\r\n                    var a=Array.prototype.slice.call(arguments);\r\n                    //console.log(this, this.__target);\r\n                    //A(this.__target,\"target is not set\");\r\n                    return target[k].apply(target,a);\r\n                };\r\n            }\r\n            for (var k in target) addMethod(k);\r\n        }\r\n    });\r\n    return Klass;\r\n});\r\n/*\r\nrequirejs([\"Klass\"],function (k) {\r\n  P=k.define ({\r\n     $:[\"x\",\"y\"]\r\n  });\r\n  p=P(2,3);\r\n  console.log(p.x,p.y);\r\n});\r\n*/\r\n;\n(function e(t, n, r) {\r\n  function s(o, u) {\r\n    if (!n[o]) {\r\n      if (!t[o]) {\r\n        var a = typeof require == \"function\" && require;\r\n        if (!u && a) return a(o, !0);\r\n        if (i) return i(o, !0);\r\n        var f = new Error(\"Cannot find module '\" + o + \"'\");\r\n        throw f.code = \"MODULE_NOT_FOUND\", f;\r\n      }\r\n      var l = n[o] = {\r\n        exports: {}\r\n      };\r\n      t[o][0].call(l.exports, function(e) {\r\n        var n = t[o][1][e];\r\n        return s(n ? n : e);\r\n      }, l, l.exports, e, t, n, r);\r\n    }\r\n    return n[o].exports;\r\n  }\r\n  var i = typeof require == \"function\" && require;\r\n  for (var o = 0; o < r.length; o++) s(r[o]);\r\n  return s;\r\n})({\r\n  1: [ function(require, module, exports) {\r\n    var process = module.exports = {};\r\n    process.nextTick = function() {\r\n      var canSetImmediate = typeof window !== \"undefined\" && window.setImmediate;\r\n      var canPost = typeof window !== \"undefined\" && window.postMessage && window.addEventListener;\r\n      if (canSetImmediate) {\r\n        return function(f) {\r\n          return window.setImmediate(f);\r\n        };\r\n      }\r\n      if (canPost) {\r\n        var queue = [];\r\n        window.addEventListener(\"message\", function(ev) {\r\n          var source = ev.source;\r\n          if ((source === window || source === null) && ev.data === \"process-tick\") {\r\n            ev.stopPropagation();\r\n            if (queue.length > 0) {\r\n              var fn = queue.shift();\r\n              fn();\r\n            }\r\n          }\r\n        }, true);\r\n        return function nextTick(fn) {\r\n          queue.push(fn);\r\n          window.postMessage(\"process-tick\", \"*\");\r\n        };\r\n      }\r\n      return function nextTick(fn) {\r\n        setTimeout(fn, 0);\r\n      };\r\n    }();\r\n    process.title = \"browser\";\r\n    process.browser = true;\r\n    process.env = {};\r\n    process.argv = [];\r\n    function noop() {}\r\n    process.on = noop;\r\n    process.addListener = noop;\r\n    process.once = noop;\r\n    process.off = noop;\r\n    process.removeListener = noop;\r\n    process.removeAllListeners = noop;\r\n    process.emit = noop;\r\n    process.binding = function(name) {\r\n      throw new Error(\"process.binding is not supported\");\r\n    };\r\n    process.cwd = function() {\r\n      return \"/\";\r\n    };\r\n    process.chdir = function(dir) {\r\n      throw new Error(\"process.chdir is not supported\");\r\n    };\r\n  }, {} ],\r\n  2: [ function(require, module, exports) {\r\n    \"use strict\";\r\n    var asap = require(\"asap\");\r\n    module.exports = Promise;\r\n    function Promise(fn) {\r\n      if (typeof this !== \"object\") throw new TypeError(\"Promises must be constructed via new\");\r\n      if (typeof fn !== \"function\") throw new TypeError(\"not a function\");\r\n      var state = null;\r\n      var value = null;\r\n      var deferreds = [];\r\n      var self = this;\r\n      this.then = function(onFulfilled, onRejected) {\r\n        return new self.constructor(function(resolve, reject) {\r\n          handle(new Handler(onFulfilled, onRejected, resolve, reject));\r\n        });\r\n      };\r\n      function handle(deferred) {\r\n        if (state === null) {\r\n          deferreds.push(deferred);\r\n          return;\r\n        }\r\n        asap(function() {\r\n          var cb = state ? deferred.onFulfilled : deferred.onRejected;\r\n          if (cb === null) {\r\n            (state ? deferred.resolve : deferred.reject)(value);\r\n            return;\r\n          }\r\n          var ret;\r\n          try {\r\n            ret = cb(value);\r\n          } catch (e) {\r\n            deferred.reject(e);\r\n            return;\r\n          }\r\n          deferred.resolve(ret);\r\n        });\r\n      }\r\n      function resolve(newValue) {\r\n        try {\r\n          if (newValue === self) throw new TypeError(\"A promise cannot be resolved with itself.\");\r\n          if (newValue && (typeof newValue === \"object\" || typeof newValue === \"function\")) {\r\n            var then = newValue.then;\r\n            if (typeof then === \"function\") {\r\n              doResolve(then.bind(newValue), resolve, reject);\r\n              return;\r\n            }\r\n          }\r\n          state = true;\r\n          value = newValue;\r\n          finale();\r\n        } catch (e) {\r\n          reject(e);\r\n        }\r\n      }\r\n      function reject(newValue) {\r\n        state = false;\r\n        value = newValue;\r\n        finale();\r\n      }\r\n      function finale() {\r\n        for (var i = 0, len = deferreds.length; i < len; i++) handle(deferreds[i]);\r\n        deferreds = null;\r\n      }\r\n      doResolve(fn, resolve, reject);\r\n    }\r\n    function Handler(onFulfilled, onRejected, resolve, reject) {\r\n      this.onFulfilled = typeof onFulfilled === \"function\" ? onFulfilled : null;\r\n      this.onRejected = typeof onRejected === \"function\" ? onRejected : null;\r\n      this.resolve = resolve;\r\n      this.reject = reject;\r\n    }\r\n    function doResolve(fn, onFulfilled, onRejected) {\r\n      var done = false;\r\n      try {\r\n        fn(function(value) {\r\n          if (done) return;\r\n          done = true;\r\n          onFulfilled(value);\r\n        }, function(reason) {\r\n          if (done) return;\r\n          done = true;\r\n          onRejected(reason);\r\n        });\r\n      } catch (ex) {\r\n        if (done) return;\r\n        done = true;\r\n        onRejected(ex);\r\n      }\r\n    }\r\n  }, {\r\n    asap: 4\r\n  } ],\r\n  3: [ function(require, module, exports) {\r\n    \"use strict\";\r\n    var Promise = require(\"./core.js\");\r\n    var asap = require(\"asap\");\r\n    module.exports = Promise;\r\n    function ValuePromise(value) {\r\n      this.then = function(onFulfilled) {\r\n        if (typeof onFulfilled !== \"function\") return this;\r\n        return new Promise(function(resolve, reject) {\r\n          asap(function() {\r\n            try {\r\n              resolve(onFulfilled(value));\r\n            } catch (ex) {\r\n              reject(ex);\r\n            }\r\n          });\r\n        });\r\n      };\r\n    }\r\n    ValuePromise.prototype = Promise.prototype;\r\n    var TRUE = new ValuePromise(true);\r\n    var FALSE = new ValuePromise(false);\r\n    var NULL = new ValuePromise(null);\r\n    var UNDEFINED = new ValuePromise(undefined);\r\n    var ZERO = new ValuePromise(0);\r\n    var EMPTYSTRING = new ValuePromise(\"\");\r\n    Promise.resolve = function(value) {\r\n      if (value instanceof Promise) return value;\r\n      if (value === null) return NULL;\r\n      if (value === undefined) return UNDEFINED;\r\n      if (value === true) return TRUE;\r\n      if (value === false) return FALSE;\r\n      if (value === 0) return ZERO;\r\n      if (value === \"\") return EMPTYSTRING;\r\n      if (typeof value === \"object\" || typeof value === \"function\") {\r\n        try {\r\n          var then = value.then;\r\n          if (typeof then === \"function\") {\r\n            return new Promise(then.bind(value));\r\n          }\r\n        } catch (ex) {\r\n          return new Promise(function(resolve, reject) {\r\n            reject(ex);\r\n          });\r\n        }\r\n      }\r\n      return new ValuePromise(value);\r\n    };\r\n    Promise.all = function(arr) {\r\n      var args = Array.prototype.slice.call(arr);\r\n      return new Promise(function(resolve, reject) {\r\n        if (args.length === 0) return resolve([]);\r\n        var remaining = args.length;\r\n        function res(i, val) {\r\n          try {\r\n            if (val && (typeof val === \"object\" || typeof val === \"function\")) {\r\n              var then = val.then;\r\n              if (typeof then === \"function\") {\r\n                then.call(val, function(val) {\r\n                  res(i, val);\r\n                }, reject);\r\n                return;\r\n              }\r\n            }\r\n            args[i] = val;\r\n            if (--remaining === 0) {\r\n              resolve(args);\r\n            }\r\n          } catch (ex) {\r\n            reject(ex);\r\n          }\r\n        }\r\n        for (var i = 0; i < args.length; i++) {\r\n          res(i, args[i]);\r\n        }\r\n      });\r\n    };\r\n    Promise.reject = function(value) {\r\n      return new Promise(function(resolve, reject) {\r\n        reject(value);\r\n      });\r\n    };\r\n    Promise.race = function(values) {\r\n      return new Promise(function(resolve, reject) {\r\n        values.forEach(function(value) {\r\n          Promise.resolve(value).then(resolve, reject);\r\n        });\r\n      });\r\n    };\r\n    Promise.prototype[\"catch\"] = function(onRejected) {\r\n      return this.then(null, onRejected);\r\n    };\r\n  }, {\r\n    \"./core.js\": 2,\r\n    asap: 4\r\n  } ],\r\n  4: [ function(require, module, exports) {\r\n    (function(process) {\r\n      var head = {\r\n        task: void 0,\r\n        next: null\r\n      };\r\n      var tail = head;\r\n      var flushing = false;\r\n      var requestFlush = void 0;\r\n      var isNodeJS = false;\r\n      function flush() {\r\n        while (head.next) {\r\n          head = head.next;\r\n          var task = head.task;\r\n          head.task = void 0;\r\n          var domain = head.domain;\r\n          if (domain) {\r\n            head.domain = void 0;\r\n            domain.enter();\r\n          }\r\n          try {\r\n            task();\r\n          } catch (e) {\r\n            if (isNodeJS) {\r\n              if (domain) {\r\n                domain.exit();\r\n              }\r\n              setTimeout(flush, 0);\r\n              if (domain) {\r\n                domain.enter();\r\n              }\r\n              throw e;\r\n            } else {\r\n              setTimeout(function() {\r\n                throw e;\r\n              }, 0);\r\n            }\r\n          }\r\n          if (domain) {\r\n            domain.exit();\r\n          }\r\n        }\r\n        flushing = false;\r\n      }\r\n      if (typeof process !== \"undefined\" && process.nextTick) {\r\n        isNodeJS = true;\r\n        requestFlush = function() {\r\n          process.nextTick(flush);\r\n        };\r\n      } else if (typeof setImmediate === \"function\") {\r\n        if (typeof window !== \"undefined\") {\r\n          requestFlush = setImmediate.bind(window, flush);\r\n        } else {\r\n          requestFlush = function() {\r\n            setImmediate(flush);\r\n          };\r\n        }\r\n      } else if (typeof MessageChannel !== \"undefined\") {\r\n        var channel = new MessageChannel();\r\n        channel.port1.onmessage = flush;\r\n        requestFlush = function() {\r\n          channel.port2.postMessage(0);\r\n        };\r\n      } else {\r\n        requestFlush = function() {\r\n          setTimeout(flush, 0);\r\n        };\r\n      }\r\n      function asap(task) {\r\n        tail = tail.next = {\r\n          task: task,\r\n          domain: isNodeJS && process.domain,\r\n          next: null\r\n        };\r\n        if (!flushing) {\r\n          flushing = true;\r\n          requestFlush();\r\n        }\r\n      }\r\n      module.exports = asap;\r\n    }).call(this, require(\"_process\"));\r\n  }, {\r\n    _process: 1\r\n  } ],\r\n  5: [ function(require, module, exports) {\r\n    if (typeof Promise.prototype.done !== \"function\") {\r\n      Promise.prototype.done = function(onFulfilled, onRejected) {\r\n        var self = arguments.length ? this.then.apply(this, arguments) : this;\r\n        self.then(null, function(err) {\r\n          setTimeout(function() {\r\n            throw err;\r\n          }, 0);\r\n        });\r\n      };\r\n    }\r\n  }, {} ],\r\n  6: [ function(require, module, exports) {\r\n    var asap = require(\"asap\");\r\n    if (typeof Promise === \"undefined\") {\r\n      Promise = require(\"./lib/core.js\");\r\n      require(\"./lib/es6-extensions.js\");\r\n    }\r\n    require(\"./polyfill-done.js\");\r\n  }, {\r\n    \"./lib/core.js\": 2,\r\n    \"./lib/es6-extensions.js\": 3,\r\n    \"./polyfill-done.js\": 5,\r\n    asap: 4\r\n  } ]\r\n}, {}, [ 6 ]);\r\n//# sourceMappingURL=/polyfills/promise-6.1.0.js.map\r\n;\ndefine(\"promise\", function(){});\n\n/* global requirejs */\r\ndefine(\"SEnv\", [\"Klass\", \"assert\",\"promise\"], function(Klass, assert,_) {\r\n    function now(){return new Date().getTime();}\r\n    function WDT2Float(w) {return w/128-1;}\r\n    //--- Also in M2Parser\r\n    var Ses = 10,\r\n        Chs = 10,\r\n        Regs = Chs * 3,\r\n        WvElC = 32,\r\n        EnvElC = 32,\r\n        WvC = 96,\r\n        wdataSize = 48000,  // should be dividable by 120\r\n        //   99=r 100=vol 101=ps (x*128)  255=end\r\n        MRest = 99,\r\n        MVol = 100,\r\n        Mps = 101,\r\n        MSelWav = 102,\r\n        MTempo = 103,\r\n        MJmp = 104,\r\n        MSlur = 105,\r\n        MPor = 106,\r\n        MSelEnv = 107,\r\n        MWait = 108,\r\n        MCom = 109,\r\n        MDet = 110,\r\n        MWOut = 111,\r\n        MWEnd = 112,\r\n        MWrtWav = 113,\r\n        MWrtEnv = 114,\r\n        MLfo = 115,\r\n        MSync = 116,\r\n        MPCMReg = 117,\r\n        MLfoD = 118,\r\n        MBaseVol = 119,\r\n        MLabel = 120,\r\n\r\n        Mend = 255,\r\n\r\n        //sync=0:非同期、1:同期、2:ワンショット 3:鋸波形\r\n        LASync = 0,\r\n        LSync = 1,\r\n        LOneShot = 2,\r\n        LSaw = 3,\r\n\r\n        Envs = 16,\r\n        PCMWavs = 16, // 96-111\r\n        FadeMax = 256,\r\n\r\n        div = function(x, y) {\r\n            return Math.trunc(x/y);\r\n            //return Math.trunc(chkn(x,\"x\") / chkn(y,\"y\") );\r\n        },\r\n        chkn = function (x,mesg) {\r\n            if (x!==x) throw new Error(mesg+\": Not a number!\");\r\n            if (typeof x!==\"number\") {console.error(x);throw new Error(mesg+\": Not a not a number but not a number!\");}\r\n            return x;\r\n        },\r\n        abs = Math.abs.bind(Math),\r\n        ShortInt = function(b) {\r\n            return b >= 128 ? b - 256 : b;\r\n        },\r\n        StrPas=function (ary,idx) {\r\n            var a=[];\r\n            for (var i=idx;ary[i];i++) {\r\n                a.push(ary[i]);\r\n            }\r\n            return a;\r\n        },\r\n        array2Int= function (ary,idx) {\r\n            var r=ary[idx];\r\n            r+=ary[idx+1]*0x100;\r\n            r+=ary[idx+2]*0x10000;\r\n            r+=ary[idx+3]*0x1000000;\r\n            if (r>=0x80000000) r-=0x100000000;\r\n            return r;\r\n        },\r\n        Integer = Number,\r\n        sinMax_s = 5,\r\n        sinMax = 65536 >> sinMax_s, //2048,\r\n        /*SPS = 44100,\r\n        SPS96 = 22080,\r\n        SPS_60 = div(44100, 60),*/\r\n        DivClock = 111860.78125,// See [1]\r\n        Loops = 163840,\r\n//---------End include\r\n        m2t = [0xd5d, 0xc9c, 0xbe7, 0xb3c, 0xa9b, 0xa02, 0x973, 0x8eb, 0x86b, 0x7f2, 0x780, 0x714,\r\n            0x6af, 0x64e, 0x5f4, 0x59e, 0x54e, 0x501, 0x4ba, 0x476, 0x436, 0x3f9, 0x3c0, 0x38a,\r\n            0x357, 0x327, 0x2fa, 0x2cf, 0x2a7, 0x281, 0x25d, 0x23b, 0x21b, 0x1fd, 0x1e0, 0x1c5,\r\n            0x1ac, 0x194, 0x17d, 0x168, 0x153, 0x140, 0x12e, 0x11d, 0x10d, 0xfe, 0xf0, 0xe3,\r\n            0xd6, 0xca, 0xbe, 0xb4, 0xaa, 0xa0, 0x97, 0x8f, 0x87, 0x7f, 0x78, 0x71,\r\n            0x6b, 0x65, 0x5f, 0x5a, 0x55, 0x50, 0x4c, 0x47, 0x43, 0x40, 0x3c, 0x39,\r\n            0x35, 0x32, 0x30, 0x2d, 0x2a, 0x28, 0x26, 0x24, 0x22, 0x20, 0x1e, 0x1c,\r\n            0x1b, 0x19, 0x18, 0x16, 0x15, 0x14, 0x13, 0x12, 0x11, 0x10, 0xf, 0xe\r\n        ],//  From: Tbl5-1 of [1]\r\n        //[1]  http://ngs.no.coocan.jp/doc/wiki.cgi/TechHan?page=1%BE%CF+PSG%A4%C8%B2%BB%C0%BC%BD%D0%CE%CF\r\n        Trunc = Math.trunc.bind(),\r\n        stEmpty = -1,\r\n        stFreq = 1,\r\n        stVol = 2,\r\n        stWave = 3,\r\n        sndElemCount = 64,\r\n        //type\r\n        /*TSoundElem = Klass.define({\r\n            $fields: {\r\n                time: Integer,\r\n                typ: Integer,\r\n                val: Integer\r\n            }\r\n        }),*/\r\n        nil = null,\r\n        False = false,\r\n        True = true,\r\n        //TPlayState = (psPlay,psStop,psWait,psPause);\r\n        psPlay = \"psPlay\",\r\n        psStop = \"psStop\",\r\n        psWait = \"psWait\",\r\n        psPause = \"psPause\",\r\n        m2tInt=[], //:array[0..95] of Integer;\r\n        sinT = [], //:array [0..sinMAX-1] of ShortInt;\r\n        TTL, //:Integer;\r\n        cnt=0; //:Integer;// debug\r\n    var defs;\r\n    var TEnveloper = Klass.define(defs={ //class (TSoundGenerator)\r\n        $this: true,\r\n        $fields: {\r\n            //BSize: Integer,\r\n            Pos: Integer,\r\n            PrevPos: Integer,\r\n            RPos: Integer,\r\n            WaveDat: Array, // [0..WvC-1,0..WvElC-1] of Byte;\r\n            wdata2: Array,//array[0..wdataSize-1] of SmallInt;\r\n\r\n            BeginPlay: Boolean,\r\n            SeqTime: Integer,\r\n            SeqTime120: Integer,\r\n\r\n            wavoutContext: Boolean,\r\n            //LFOsync=0:非同期、1:同期、2:ワンショット 3:鋸波形\r\n            Fading: Integer,\r\n\r\n            //L2WL: log 2 WaveLength\r\n            PCMW: Array, // [0..PCMWavs-1] of TWavLoader,\r\n\r\n            Delay: Integer,\r\n\r\n            Tempo: Integer,\r\n            ComStr: String,\r\n            WFilename: String,\r\n\r\n            EnvDat: Array, // [0..Envs-1,0..EnvElC-1] of Byte,\r\n\r\n            WriteMaxLen: Integer,\r\n            //soundMode: Array // [0..chs-1] of Boolean,\r\n        },\r\n        load:function (t,d) {\r\n            var ver=readLong(d);\r\n            var chs=readByte(d);\r\n            //var chdatas;\r\n            //t.MPoint=chdatas=[];\r\n            for (var i=0;i<chs;i++) {\r\n                var chdata=[];\r\n                //chdatas.push(chdata);\r\n                var len=readLong(d);\r\n                //console.log(len);\r\n                //if(len>999999) throw new Error(\"LONG\");\r\n                for (var j=0;j<len;j++) {\r\n                    chdata.push(readByte(d));\r\n                }\r\n                t.channels[i].MPoint=chdata;\r\n            }\r\n            function readByte(a) {\r\n                if (a.length==0) throw new Error(\"Out of data\");\r\n                return a.shift();\r\n            }\r\n            function readLong(a) {\r\n                if (a.length<4) throw new Error(\"Out of data\");\r\n                var r=a.shift(),e=1;\r\n                e<<=8;\r\n                r+=a.shift()*e;\r\n                e<<=8;\r\n                r+=a.shift()*e;\r\n                e<<=8;\r\n                r+=a.shift()*e;\r\n                return r;\r\n            }\r\n        },\r\n        setNoiseWDT: function (t) {\r\n            // Noise\r\n            for (var j=0;j<1024;j++) {\r\n                t.WaveDat[WvC-1][j]=WDT2Float( Math.floor(Math.random() * 78 + 90) );\r\n            }\r\n        },\r\n        loadWDT: function (t,url) {\r\n            return new Promise(function (succ,fail) {\r\n            try{\r\n                //console.log(\"LOading wdt...?\");\r\n                if (!url) {\r\n                    requirejs([\"Tones.wdt\"],function (u) {\r\n                        t.loadWDT(u).then(succ,fail);\r\n                    });\r\n                }\r\n                var oReq = new XMLHttpRequest();\r\n                oReq.open(\"GET\", url, true);\r\n                oReq.responseType = \"arraybuffer\";\r\n                oReq.onload = function (oEvent) {\r\n                    var arrayBuffer = oReq.response,i,j;\r\n                    if (arrayBuffer) {\r\n                        var b = new Uint8Array(arrayBuffer);\r\n                        console.log(\"Loading wdt\",b.length);\r\n                        //WaveDat\r\n                        var idx=0;\r\n                        for (i = 0; i < WvC; i++) {\r\n                            for (j=0;j<32;j++) {\r\n                                t.WaveDat[i][j]=WDT2Float( b[idx++] );\r\n                            }\r\n                        }\r\n                        t.setNoiseWDT();\r\n                        //EnvDat\r\n                        for (i=0 ;i<16;i++) {//Envs\r\n                            for (j=0;j<32;j++) {\r\n                                t.EnvDat[i][j]=b[idx++];\r\n                            }\r\n                        }\r\n                        console.log(\"Loading wdt done\");\r\n                        succ();\r\n                    }\r\n                };\r\n                oReq.send(null);\r\n            } catch(e) {fail(e);}\r\n            });\r\n        },\r\n        /*getPlayPos: function (t) {\r\n            var ti=this.context.currentTime- this. playStartTime;\r\n            var tiSamples=Math.floor(ti*this.sampleRate);\r\n            return tiSamples % wdataSize;\r\n        },*/\r\n        setSound: function(t, ch /*:Integer;*/ , typ /*:Integer;*/ , val /*:Integer*/ ) {\r\n            var chn=t.channels[ch];\r\n            chn.soundMode = True;\r\n            switch (typ) {\r\n                case stFreq:\r\n                    chn.Steps = val;\r\n                    break;\r\n                case stVol:\r\n                    chn.EVol = val;\r\n                    break;\r\n            }\r\n        },\r\n        InitSin: function(t) {\r\n            var i; //:Integer;\r\n            for (i = 0; i < sinMax; i++) {\r\n                sinT[i] = Math.trunc(Math.sin(3.1415926 * 2 * i / sinMax) * 127);\r\n            }\r\n        },\r\n        InitEnv: function(t) {\r\n            var i, j; //:Integer;\r\n            t.EnvDat=[];\r\n            for (i = 0; i < Envs; i++) {\r\n                t.EnvDat[i]=[];\r\n                for (j = 0; j < EnvElC; j++) {\r\n                    t.EnvDat[i][j] = Math.floor((EnvElC - 1 - j) / 2);\r\n                }\r\n            }\r\n        },\r\n        ConvM2T: function(t) {\r\n            var i; //:Integer;\r\n            m2tInt=[];\r\n            for (i = 0; i < 96; i++) {\r\n                m2tInt[i] = Math.trunc(DivClock * 65536 / m2t[i] * 65536 / t.sampleRate);\r\n            }\r\n        },\r\n        InitWave: function(t) {\r\n            var i, j;\r\n            t.WaveDat=[];\r\n            for (i = 0; i < WvC; i++) {\r\n                t.WaveDat[i]=[];\r\n                for (j = 0; j < WvElC / 2; j++) {\r\n                    t.WaveDat[i][j] = WDT2Float(103);\r\n                    t.WaveDat[i][j + div(WvElC, 2)] = WDT2Float(153);\r\n                }\r\n            }\r\n        },\r\n\r\n        $: function(t,context,options) {\r\n            var i, j; //:Integer;\r\n            options=options||{};\r\n            t.useScriptProcessor=options.useScriptProcessor;\r\n            t.useFast=options.useFast;\r\n            t.resolution=options.resolution||120;\r\n            t.wavOutSpeed=options.wavOutSpeed||10;\r\n            t.context=context;\r\n            t.sampleRate = chkn(t.context.sampleRate,\"t.context.sampleRate\");\r\n            //t.initNode({});\r\n            //t.WavPlaying=false;\r\n            // inherited Create (Handle);\r\n            t.Delay = 2000;\r\n            t.Pos = t.PrevPos = t.RPos = /*t.WriteAd =*/ t.SeqTime =\r\n            t.SeqTime120 = 0;\r\n            t.BeginPlay=false;\r\n            t.InitWave();\r\n            t.InitEnv();\r\n            t.InitSin();\r\n            t.ConvM2T();\r\n            t.wdata2=[];\r\n            t.PCMW=[];\r\n            for (i = 0; i < PCMWavs; i++) {\r\n                t.PCMW[i] = nil;\r\n            }\r\n            t.channels=[];\r\n            for (i = 0; i < Chs; i++) {\r\n                t.channels.push({});\r\n            }\r\n            t.resetChannelStates();\r\n            t.Fading = FadeMax;\r\n            t.timeLag = 2000;\r\n\r\n            t.WriteMaxLen = 20000;\r\n            t.wavoutContext = False;\r\n            t.WFilename = '';\r\n            /* {$ifdef ForM2}\r\n            t.WavOutObj=nil;\r\n             {$endif}*/\r\n            t.ComStr = '';\r\n            t.performance={timeForChProc:0, timeForWrtSmpl:0};\r\n            //t.loadWDT();\r\n        },\r\n        resetChannelStates: function (t) {\r\n            for (var i = 0; i < Chs; i++) {\r\n                var chn=t.channels[i];\r\n                chn.LfoV=0;chn.LfoA=0;chn.LfoC=0;chn.LfoD=0;chn.LfoDC=0;chn.LfoSync=0;\r\n                chn.Slur=chn.Sync=0;\r\n                chn.PorStart=chn.PorEnd=chn.PorLen=0;\r\n                chn.ECount=0;\r\n                chn.MCount=0;\r\n                chn.Resting=0;\r\n                chn.Steps = 0;\r\n                chn.SccWave = t.WaveDat[0];\r\n                chn.SccCount = 0;\r\n                chn.EShape = t.EnvDat[0];\r\n                chn.EVol = 0;\r\n                chn.EBaseVol = 128;\r\n                chn.MPointC = 0;\r\n                chn.ESpeed = 5;\r\n                chn.PlayState = psStop;\r\n                chn.Detune = 0;\r\n                chn.LfoV = 0;\r\n                t.SelWav(i, 0);\r\n                chn.LfoD = 0;\r\n                chn.LfoDC = 0;\r\n                chn.Oct = 4;\r\n                chn.soundMode = False;\r\n            }\r\n            t.Tempo = 120;// changed by MML t***\r\n            t.rate = 1; // changed by setRate\r\n        },\r\n        /*\r\n        getBuffer: function (t) {\r\n            var channel=1;\r\n            if (this.buf) return this.buf;\r\n            this.buf = this.context.createBuffer(channel, wdataSize, this.sampleRate);\r\n            return this.buf;\r\n        },\r\n        playNode: function (t) {\r\n            if (this.isSrcPlaying) return;\r\n            var source = this.context.createBufferSource();\r\n            // AudioBufferSourceNodeにバッファを設定する\r\n            source.buffer = this.getBuffer();\r\n            // AudioBufferSourceNodeを出力先に接続すると音声が聞こえるようになる\r\n            if (typeof source.noteOn==\"function\") {\r\n                source.noteOn(0);\r\n                //source.connect(this.node);\r\n            }\r\n            source.connect(this.context.destination);\r\n            // 音源の再生を始める\r\n            source.start();\r\n            source.loop = true;\r\n            source.playStartTime = this.playStartTime = this.context.currentTime;\r\n            this.bufSrc=source;\r\n            this.isSrcPlaying = true;\r\n        },\r\n        startRefreshLoop: function (t) {\r\n            if (t.refreshTimer!=null) return;\r\n            var grid=t.resolution;\r\n            var data=t.getBuffer().getChannelData(0);\r\n            var WriteAd=0;\r\n            for (var i=0;i<wdataSize;i+=grid) {\r\n                t.refreshPSG(data,i,grid);\r\n            }\r\n            function refresh() {\r\n                if (!t.isSrcPlaying) return;\r\n                var cnt=0;\r\n                var playPosZone=Math.floor(t.getPlayPos()/grid);\r\n                while (true) {\r\n                    if (cnt++>wdataSize/grid) throw new Error(\"Mugen \"+playPosZone);\r\n                    var writeAdZone=Math.floor(WriteAd/grid);\r\n                    if (playPosZone===writeAdZone) break;\r\n                    t.refreshPSG(data,WriteAd,grid);\r\n                    WriteAd=(WriteAd+grid)%wdataSize;\r\n                }\r\n            }\r\n            t.refreshTimer=setInterval(refresh,16);\r\n        },\r\n        stopRefreshLoop: function (t) {\r\n            if (t.refreshTimer==null) return;\r\n            clearInterval(t.refreshTimer);\r\n            delete t.refreshTimer;\r\n        },\r\n        stopNode : function (t) {\r\n            if (!this.isSrcPlaying) return;\r\n            this.bufSrc.stop();\r\n            this.isSrcPlaying = false;\r\n        },*/\r\n        Play1Sound: function(t, c, n, iss) {\r\n            var TP; //:Integer;\r\n            var chn=t.channels[c];\r\n            if (chn.soundMode) return; // ) return;\r\n            if (n == MRest) {\r\n                chn.Resting = True;\r\n                return;\r\n            }\r\n            if ((c < 0) || (c >= Chs) || (n < 0) || (n > 95)) return; // ) return;\r\n            chn.Resting = False;\r\n            if (!iss) {\r\n                chn.ECount = 0;\r\n                if (chn.Sync) chn.SccCount = 0;\r\n                if (chn.LfoSync != LASync) chn.LfoC = 0;\r\n            }\r\n            if (chn.CurWav < WvC) {\r\n                chn.Steps = m2tInt[n] + chn.Detune * div(m2tInt[n], 2048);\r\n                if (chn.CurWav===WvC-1) {// Noise\r\n                    chn.Steps >>>= 5;//  32->1024\r\n                }\r\n                // m2tInt*(1+Detune/xx)    (1+256/xx )^12 =2  1+256/xx=1.05946\r\n                //    256/xx=0.05946   xx=256/0.05946  = 4096?\r\n            } else {\r\n                if (chn.L2WL >= 2) {\r\n                    //Steps[c]:=($40000000 shr (L2WL[c]-2)) div (m2tInt[36] div 65536) * (m2tInt[n] div 65536);\r\n                    chn.Steps = div(0x40000000 >>> (chn.L2WL - 2), div(m2tInt[36], 65536)) * div(m2tInt[n], 65536);\r\n                }\r\n            }\r\n            chn.PorLen = -1;\r\n        },\r\n        //    procedure TEnveloper.Play1Por (c,f,t:Word;iss:Boolean);\r\n        Play1Por: function (t,c,from,to,iss) {\r\n             var TP=0;\r\n             var chn=t.channels[c];\r\n             if ((c<0)  ||  (c>=Chs)  ||  (to<0)  ||  (to>95) ||\r\n                (from<0)  ||  (from>95) ) return;\r\n             chn.Resting=False;\r\n\r\n             //TP=m2t[f];\r\n             chn.PorStart=m2tInt[from]+chn.Detune*div(m2tInt[from] , 2048);//Trunc (DivClock/TP*65536/t.sampleRate)+Detune[c];\r\n             //TP=m2t[to];\r\n             chn.PorEnd=m2tInt[to]+chn.Detune*div(m2tInt[to] , 2048);//Trunc (DivClock/TP*65536/t.sampleRate)+Detune[c];\r\n             // Noise\r\n             if (chn.CurWav===WvC-1) {\r\n                 chn.PorStart >>>= 5;//  32->1024\r\n                 chn.PorEnd >>>= 5;//  32->1024\r\n             }\r\n             if  (!iss) chn.ECount=0;\r\n\r\n        },\r\n        StopMML: function(t, c) {\r\n            if ((c < 0) || (c >= Chs)) return; // ) return;\r\n            //MPoint[c]=nil;\r\n            t.WaitMML(c);\r\n            t.channels[c].PlayState = psStop;\r\n            t.channels[c].MCount = t.SeqTime + 1;\r\n        },\r\n        allWaiting: function (t) {\r\n            for(var i=0;i<Chs;i++) {\r\n                if (t.channels[i].PlayState == psPlay) {\r\n                    return false;\r\n                }\r\n            }\r\n            return true;\r\n        },\r\n        handleAllState: function (t) {\r\n            var allWait=true,allStop=true,i;\r\n            for(i=0;i<Chs;i++) {\r\n                switch (t.channels[i].PlayState) {\r\n                case psPlay:\r\n                    allWait=false;\r\n                    allStop=false;\r\n                    break;\r\n                case psWait:\r\n                    allStop=false;\r\n                    break;\r\n                }\r\n            }\r\n            //          alw     als\r\n            // P        F       F\r\n            // W        T       F\r\n            // S        T       T\r\n            // P,W      F       F\r\n            // W,S      T       F\r\n            // S,P      F       F\r\n            // P,W,S    F       F\r\n            if (allWait && !allStop) {\r\n                for(i=0;i<Chs;i++) {\r\n                    t.RestartMML(i);\r\n                }\r\n            }\r\n            return allStop;\r\n        },\r\n        allStopped: function (t) {\r\n            for(var i=0;i<Chs;i++) {\r\n                if (t.channels[i].PlayState != psStop) {\r\n                    return false;\r\n                }\r\n            }\r\n            return true;\r\n        },\r\n        RestartMML: function(t, c) {\r\n            if ((c < 0) || (c >= Chs)) return;\r\n            var chn=t.channels[c];\r\n            if (chn.PlayState == psWait) {\r\n                chn.PlayState = psPlay;\r\n                chn.MCount = t.SeqTime + 1;\r\n            }\r\n        },\r\n        restartIfAllWaiting: function (t) {\r\n            if (t.allWaiting()) {\r\n                for(var i=0;i<Chs;i++) {\r\n                    t.RestartMML(i);\r\n                }\r\n            }\r\n        },\r\n        //procedure TEnveloper.WaitMML (c:Integer);\r\n        WaitMML: function(t, c) {\r\n            var i; //:Integer;\r\n            if ((c < 0) || (c >= Chs)) return;\r\n            //MPoint[c]=nil;\r\n            var chn=t.channels[c];\r\n            chn.PlayState = psWait;\r\n            chn.MCount = t.SeqTime + 1;\r\n        },\r\n        //procedure TEnveloper.Start;\r\n        /*Start: function(t) {\r\n            t.Stop();\r\n            t.Rewind();\r\n            t.BeginPlay = True;\r\n            t.startRefreshLoop();\r\n            t.playNode();\r\n        },*/\r\n        Rewind: function (t) {\r\n            var ch; //:Integer;\r\n            t.resetChannelStates();\r\n            t.SeqTime=0;\r\n            t.trackTime=0;\r\n            for (ch = 0; ch < Chs; ch++) {\r\n                var chn=t.channels[ch];\r\n                //chn.soundMode = False;\r\n                //chn.MPointC = 0;\r\n                chn.PlayState = psPlay;\r\n                //chn.MCount = t.SeqTime;\r\n            }\r\n        },\r\n        /*Stop: function (t) {\r\n            if (!t.BeginPlay) return;\r\n            t.stopNode();\r\n            t.stopRefreshLoop();\r\n        },*/\r\n        resetWavOut: function (t) {\r\n            t.wavoutContext=false;\r\n        },\r\n        wavOut: function (t,options) {\r\n            options=options||{};\r\n\r\n            //t.Stop();\r\n            var buf=[];\r\n            var grid=t.resolution;\r\n            //for (var i=0;i<grid;i++) buf.push(0);\r\n            var allbuf=[];\r\n            var max=options.maxSamples;\r\n            if (!t.wavoutContext) {\r\n                t.Rewind();\r\n                t.wavoutContext={\r\n                    label2Time:[],\r\n                    PC2Time:[],// only ch:0;\r\n                    writtenSamples:0,\r\n                    loopStartFrac:null\r\n                };\r\n            }\r\n            var wctx=t.wavoutContext;\r\n            wctx.arysrc=allbuf;\r\n            wctx.maxSamples=max;\r\n            if (typeof options.rate===\"number\") t.rate=options.rate;\r\n            //var sec=-1;\r\n            var efficiency=t.wavOutSpeed||10;\r\n            var setT=0;\r\n            var writtenSamplesAtThisCall=0;\r\n            return new Promise(function (succ) {\r\n                while (true) {\r\n                    //if (writtenSamplesAtThisCall % (grid*100)==0) console.log(\"WRT\",writtenSamplesAtThisCall);\r\n                    var overflow=max && writtenSamplesAtThisCall>=max-grid;\r\n                    if (!overflow) {\r\n                        for (var i=0;i<grid;i++) allbuf.push(0);\r\n                        t.refreshPSG(allbuf,allbuf.length-grid,grid);\r\n                        //console.log(\"SeqTime\",t.SeqTime);\r\n                        writtenSamplesAtThisCall+=grid;\r\n                    }\r\n                    if (t.allStopped() || overflow) {\r\n                        wctx.hasNext=overflow;\r\n                        if (!overflow) t.wavoutContext=false;\r\n                        console.log(\"SUCC\",wctx.writtenSamples);\r\n                        succ(wctx);\r\n                        //console.log(\"setT\",setT);\r\n                        //console.log(t.performance);\r\n                        return;\r\n                    }\r\n                }\r\n            });\r\n        },\r\n        /*toAudioBuffer: function (t) {\r\n            return t.wavOut().then(function (arysrc) {\r\n                var buffer = t.context.createBuffer(1, arysrc.length, t.sampleRate);\r\n                var ary = buffer.getChannelData(0);\r\n                for (var i = 0; i < ary.length; i++) {\r\n                     ary[i] = arysrc[i];\r\n                }\r\n                var res={decodedData: buffer};\r\n                if (t.loopStartFrac) res.loopStart=t.loopStartFrac[0]/t.loopStartFrac[1];\r\n                return res;\r\n            });\r\n        },*/\r\n        SelWav: function(t, ch, n) {\r\n            var chn=t.channels[ch];\r\n            chn.CurWav = n;\r\n            if (n < WvC) {\r\n                chn.SccWave = t.WaveDat[n];\r\n                chn.L2WL = 5;\r\n                // Noise\r\n                if (n===WvC-1) chn.L2WL=10;\r\n                chn.Sync = False;\r\n            } else {\r\n                if (t.PCMW[n - WvC] != nil) {\r\n                    chn.SccWave = t.PCMW[n - WvC].Start;\r\n                    chn.L2WL = t.PCMW[n - WvC].Log2Len;\r\n                    chn.Sync = True;\r\n                }\r\n            }\r\n        },\r\n        RegPCM: function (t,fn, n) {\r\n            console.log(\"[STUB]regpcm\",fn.map(function (e) {return String.fromCharCode(e);}),n);\r\n        },\r\n        /*\r\n        procedure TEnveloper.RegPCM (fn:string;n:Integer);\r\n        var i:Integer;\r\n            wl,wl2:TWavLoader;\r\n        {\r\n             if ( ! FileExists(fn) ) {\r\n                fn=ExtractFilePath (ParamStr(0))+'\\\\'+fn;\r\n                if ( ! FileExists(fn) ) return;\r\n             }\r\n             for ( i=0 to Chs-1 )\r\n                 if ( CurWav[i]==n ) SelWav(i,0);\r\n             wl=TWavLoader.Create (fn);IncGar;\r\n             if ( ! wl.isError ) {\r\n                if ( PCMW[n-WvC]!=nil ) {\r\n                   PCMW[n-WvC].Free; DecGar;\r\n                }\r\n                wl2=TWavLoader.Clone (TObject(wl));  IncGar;\r\n                PCMW[n-WvC]=wl2;\r\n             }\r\n             wl.Free;   DecGar;\r\n\r\n        }\r\n        */\r\n        refreshPSG: function(t,data,WriteAd,length) {\r\n            t.procChannels(length);\r\n            t.writeSamples(data,WriteAd,length);\r\n        },\r\n        procChannels: function(t,length) {\r\n            var i, ch, wdtmp,LParam, HParam, WParam, JmpSafe;\r\n            cnt++;\r\n            var mcountK=t.sampleRate / 22050;\r\n            var tempoK=44100 / t.sampleRate ;\r\n            var startTime=new Date().getTime();\r\n            if (t.allStopped()) {\r\n                return;\r\n            }\r\n            var SeqTime=t.SeqTime,lpchk=0,chn;\r\n            var chPT=now();\r\n            var wctx=t.wavoutContext;\r\n            for (ch = 0; ch < Chs; ch++) {\r\n                chn=t.channels[ch];\r\n                if (chn.MPoint[chn.MPointC] == nil) t.StopMML(ch);\r\n                if (chn.PlayState != psPlay) continue;\r\n\r\n\r\n                JmpSafe = 0;\r\n\r\n                while (chn.MCount <= SeqTime) {\r\n                    var pc = chn.MPointC;\r\n                    if (wctx && !wctx.maxSamples && ch==0) wctx.PC2Time[pc]=wctx.writtenSamples;\r\n                    LParam = chn.MPoint[pc + 1];\r\n                    HParam = chn.MPoint[pc + 2];\r\n                    var code = chn.MPoint[pc];\r\n                    if (code >= 0 && code < 96 || code === MRest) {\r\n                        t.Play1Sound(ch, code, chn.Slur);\r\n                        if (!chn.Slur) chn.LfoDC = chn.LfoD;\r\n                        chn.Slur = False;\r\n                        chn.MCount +=\r\n                            (LParam + HParam * 256) * 2;\r\n                        // SPS=22050の場合 *2 を *1 に。\r\n                        // SPS=x の場合   * (x/22050)\r\n                        chn.MPointC += 3;\r\n                    } else switch (code) {\r\n                        case MPor:\r\n                             t.Play1Por (ch,\r\n                               LParam,\r\n                               HParam,\r\n                               chn.Slur\r\n                             );\r\n                             chn.Slur=False;\r\n                             chn.MCount+=\r\n                             ( chn.MPoint[pc + 3]+chn.MPoint[pc + 4]*256 )*2;\r\n                            // SPS=22050の場合 *2 を *1 に。\r\n                             chn.PorLen=chn.MCount-SeqTime;\r\n                             chn.MPointC+=5;\r\n                        break;\r\n                        case MTempo:\r\n                            t.Tempo = LParam + HParam * 256;\r\n                            chn.MPointC += 3;\r\n                            break;\r\n                        case MVol:\r\n                            chn.EVol = LParam;\r\n                            chn.MPointC += 2;\r\n                            break;\r\n                        case MBaseVol:\r\n                            chn.EBaseVol = LParam;\r\n                            chn.MPointC += 2;\r\n                            break;\r\n                        case Mps:\r\n                            chn.ESpeed = LParam;\r\n                            chn.MPointC += 2;\r\n                            break;\r\n                        case MSelWav:\r\n                            t.SelWav(ch, LParam);\r\n                            chn.MPointC += 2;\r\n                            break;\r\n                        case MWrtWav:\r\n                            chn.MPointC += 34; // MWrtWav wavno data*32\r\n                            for (i = 0; i < 32; i++) {\r\n                                t.WaveDat[LParam][i] = WDT2Float( chn.MPoint[pc + 2 + i] );\r\n                            }\r\n                            break;\r\n                        case MSelEnv:\r\n                            chn.EShape = t.EnvDat[LParam];\r\n                            chn.MPointC += 2;\r\n                            break;\r\n                        case MWrtEnv:\r\n                            // MWrtEnv envno data*32\r\n                            chn.MPointC += 34;\r\n                            for (i = 0; i < 32; i++) {\r\n                                wdtmp = chn.MPoint[pc + 2 + i];\r\n                                if (wdtmp > 15) wdtmp = 15;\r\n                                t.EnvDat[LParam][i] = wdtmp;\r\n                            }\r\n                            break;\r\n                        case MJmp:\r\n                            if (wctx && !wctx.maxSamples) {\r\n                                if (ch==0) {\r\n                                    var dstLabelPos=chn.MPointC + array2Int(chn.MPoint, pc+1);\r\n                                    var dstTime=wctx.PC2Time[dstLabelPos];\r\n                                    if (typeof dstTime==\"number\" && dstTime<wctx.writtenSamples) {\r\n                                        wctx.loopStartFrac=[dstTime, t.sampleRate];\r\n                                        console.log(\"@jump\", \"ofs=\",wctx.loopStartFrac );\r\n                                    }\r\n                                }\r\n                                chn.MPointC += 5;\r\n                            } else {\r\n                                chn.MPointC += array2Int(chn.MPoint, pc+1);\r\n                            }\r\n                            JmpSafe++;\r\n                            if (JmpSafe > 1) {\r\n                                console.log(\"Jumpsafe!\");\r\n                                t.StopMML(ch);\r\n                                chn.MCount = SeqTime + 1;\r\n                            }\r\n                            break;\r\n                        case MLabel:\r\n                            /*if (wctx && ch==0) {\r\n                                wctx.label2Time[LParam]=[wctx.writtenSamples,t.sampleRate];\r\n                                console.log(\"@label\", LParam , chn.MPointC , wctx.writtenSamples+\"/\"+t.sampleRate );\r\n                            }*/\r\n                            chn.MPointC+=2;\r\n                            break;\r\n                        case MSlur:\r\n                            chn.Slur = True;\r\n                            chn.MPointC += 1;\r\n                            break;\r\n                        case MWait:\r\n                            t.WaitMML(ch);\r\n                            chn.MPointC += 1;\r\n                            break;\r\n                        case MCom:\r\n                            t.ComStr = StrPas(chn.MPoint, pc + 1);\r\n                            chn.MPointC += t.ComStr.length + 2; // opcode str \\0\r\n                            break;\r\n                        case MWOut:\r\n                            t.WFilename = StrPas(chn.MPoint, pc + 1);\r\n                            chn.MPointC += t.WFilename.length + 2; // opcode str \\0\r\n                            break;\r\n                        case MWEnd:\r\n                            chn.MPointC += 1;\r\n                            break;\r\n                        case MDet:\r\n                            chn.Detune = ShortInt(LParam);\r\n                            chn.MPointC += 2;\r\n                            break;\r\n                        case MLfo:\r\n                            chn.LfoSync = (LParam);\r\n                            chn.LfoV = (HParam) * 65536;\r\n                            chn.LfoA = (chn.MPoint[pc + 3]);\r\n                            chn.LfoD = 0;\r\n                            chn.MPointC += 4;\r\n                            break;\r\n                        case MLfoD:\r\n                            chn.LfoD = LParam * t.sampleRate;\r\n                            chn.MPointC += 2;\r\n                            break;\r\n                        case MSync:\r\n                            chn.Sync = (LParam == 1);\r\n                            chn.MPointC += 2;\r\n                            break;\r\n                        case MPCMReg:\r\n                            var fn=StrPas(chn.MPoint, pc+1);\r\n                            t.RegPCM (fn,chn.MPoint[pc+1+fn.length+1]);\r\n                            chn.MPointC+=fn.length +3;\r\n                            break;\r\n                        case Mend:\r\n                            t.StopMML(ch); //MPoint[ch]=nil;\r\n                            break;\r\n                        default:\r\n                            t.StopMML(ch);\r\n                            throw new Error(\"Invalid opcode\" + code);\r\n                            //chn.MPointC += 1;\r\n                    }\r\n                }\r\n                // End Of MMLProc\r\n            }\r\n            t.handleAllState();\r\n            t.SeqTime+= Math.floor( t.Tempo * (length/120) * tempoK*t.rate );\r\n            t.trackTime += length/t.sampleRate*t.rate;\r\n            if (wctx) {\r\n                wctx.writtenSamples+=length;\r\n                wctx.trackTime=t.trackTime;\r\n            }\r\n            t.performance.timeForChProc+=now()-chPT;\r\n        },\r\n        writeSamples: function (t,data,WriteAd,length) {\r\n            var i, ch, v=0, Tmporc=0,chn,ad;\r\n            var WrtEnd=WriteAd+length;\r\n            for (ad=WriteAd; ad<WrtEnd; ad++) {\r\n                data[ad]=0;\r\n            }\r\n            if (t.allStopped()) {\r\n                return;\r\n            }\r\n            var wrtsT=now();\r\n            for (ch = 0; ch < Chs; ch++) {\r\n                chn=t.channels[ch];\r\n                if (chn.PlayState != psPlay) continue;\r\n\r\n                if (chn.PorLen > 0) {\r\n                    Tmporc = chn.MCount - t.SeqTime;\r\n                    chn.Steps = (\r\n                        div(chn.PorStart, chn.PorLen) * Tmporc +\r\n                        div(chn.PorEnd, chn.PorLen * (chn.PorLen - Tmporc))\r\n                    );\r\n                }\r\n                if ((chn.soundMode))\r\n                    v = chn.EVol;\r\n                else if ((chn.Resting))\r\n                    v = 0;\r\n                else\r\n                    v = chn.EShape[chn.ECount >>> 11] * chn.EVol * chn.EBaseVol; // 16bit\r\n                if (t.Fading < FadeMax) {\r\n                    v = v * div(t.Fading, FadeMax); // 16bit\r\n                }\r\n                //vv[ch]=v;\r\n                if (chn.ECount + chn.ESpeed*(length/2) < 65536 ) chn.ECount += chn.ESpeed*(length/2);\r\n\r\n                //v=vv[ch]/ 0x80000;\r\n                v/=0x80000;\r\n                if (v<=0) continue;\r\n                var SccCount=chn.SccCount,Steps=chn.Steps,SccWave=chn.SccWave,sh=(32-chn.L2WL);\r\n                // Proc LFO here!\r\n                if (chn.LfoV != 0) {\r\n                    if (chn.LfoDC > 0) {\r\n                        chn.LfoDC -= t.Tempo*length;\r\n                    } else {\r\n                        Steps += (sinT[chn.LfoC >>> (16 + sinMax_s)] *\r\n                                (Steps >> 9 ) * chn.LfoA)  >> 8;\r\n                        chn.LfoC += chn.LfoV/2*length;\r\n                    }\r\n                }\r\n                // Sync(for PCM playback) is separeted?\r\n                for (ad=WriteAd; ad<WrtEnd; ad++) {\r\n                    data[ad] += v*SccWave[SccCount >>> sh];\r\n                    SccCount += Steps;\r\n                }\r\n                chn.SccCount=SccCount >>> 0;\r\n            }// of ch loop\r\n            t.setNoiseWDT();// Longer?\r\n            t.performance.timeForWrtSmpl+=now()-wrtsT;\r\n            //t.performance.elapsedTime+=new Date().getTime()-startTime;\r\n            //t.performance.writtenSamples+=length;\r\n            //t.performance.writeRate=t.performance.writtenSamples/(t.performance.elapsedTime/1000*t.sampleRate);\r\n            //--------------|---------------------------\r\n            //             playpos  LS            LE\r\n            //                       +-------------+\r\n\r\n        }// of writeToArray\r\n    }); // of Klass.define\r\n    /*var undefs={};\r\n    function replf(_,name) {\r\n        //console.log(name);\r\n        if (!defs.$fields[name]) {\r\n            if (undefs[name]==null) undefs[name]=1;\r\n            //console.error(\"Undefined \",name);\r\n        }\r\n    }\r\n    for(var k in defs) {\r\n        var fldreg=/\\bt\\s*\\.\\s*([a-zA-Z0-9]+)\\b/g;\r\n        if (typeof defs[k]===\"function\") {\r\n            var src=defs[k]+\"\";\r\n            var r=src.replace(fldreg, replf);\r\n            undefs[k]=0;\r\n        }\r\n    }\r\n    console.log(undefs);*/\r\n    return TEnveloper;\r\n}); // of requirejs.define\r\n;\n/*global window,self,global*/\r\ndefine('root',[],function (){\r\n    if (typeof window!==\"undefined\") return window;\r\n    if (typeof self!==\"undefined\") return self;\r\n    if (typeof global!==\"undefined\") return global;\r\n    return (function (){return this;})();\r\n});\r\n\n// Worker Side\r\ndefine('WorkerServiceW',[\"promise\",\"root\"], function (_,root) {\r\n    var idseq=1;\r\n    var paths={},queue={},self=root;\r\n    root.WorkerService={\r\n        install: function (path, func) {\r\n            paths[path]=func;\r\n        },\r\n        serv: function (path,func) {\r\n            this.install(path,func);\r\n        },\r\n        ready: function () {\r\n            root.WorkerService.isReady=true;\r\n            self.postMessage({ready:true});\r\n        },\r\n        reverse: function (path, params) {\r\n            var id=idseq++;\r\n            return new Promise(function (succ,err) {\r\n                queue[id]=function (e) {\r\n                    if (e.status==\"ok\") {\r\n                        succ(e.result);\r\n                    } else {\r\n                        err(e.error);\r\n                    }\r\n                };\r\n                self.postMessage({\r\n                    reverse: true,\r\n                    id: id,\r\n                    path: path,\r\n                    params: params\r\n                });\r\n\r\n            });\r\n        }\r\n    };\r\n    self.addEventListener(\"message\", function (e) {\r\n        var d=e.data;\r\n        var id=d.id;\r\n        var context={id:id};\r\n        if (d.reverse) {\r\n            queue[d.id](d);\r\n            delete queue[d.id];\r\n            return;\r\n        }\r\n        try {\r\n            Promise.resolve( paths[d.path](d.params,context) ).then(function (r) {\r\n                //console.log(\"WSW: Return \");\r\n                self.postMessage({\r\n                    id:id, result:r, status:\"ok\"\r\n                });\r\n            },sendError);\r\n        } catch (ex) {\r\n            sendError(ex);\r\n        }\r\n        function sendError(e) {\r\n            self.postMessage({\r\n                id:id, error:e?(e.stack||e+\"\"):\"unknown\", status:\"error\"\r\n            });\r\n        }\r\n    });\r\n    root.WorkerService.install(\"WorkerService/isReady\",function (){\r\n        return root.WorkerService.isReady;\r\n    });\r\n    if (!root.console) {\r\n        root.console={\r\n            log: function () {\r\n                root.WorkerService.reverse(\"console/log\",Array.prototype.slice.call(arguments));\r\n            }\r\n        };\r\n    }\r\n    return root.WorkerService;\r\n});\r\n\ndefine('Tones.wdt',[],function () {\r\n    return \"data:application/octet-stream;base64,UFBQUFBQUFBQUFBQUFBQULm5ubm5ubm5ubm5ubm5ublnZ2dnZ6einUdETExBTHyao6OZnpNASWqZmJqZMENshm1LOjA6UFZOMys4RVBfZ3iHmKCvwMfUzLGpr8XPxbSSoGdnVUpBQD9BSUpKTlJjfK7BxL+xoHxiVkpPaIGToK1oYVZORkA5NDQ0NjpBSVZgbHuKlaOrrq6tq6Sfk4d8dopORUtVYGJobGdQRTw7RmF4jLO6uK+cmZmZmZqalY6MTkxOS0tLS0tLS0tLS0tLTH2uxc7SzruegVFQUE9PT05GSUdHRkZGRkZGz8/MzMzOz87Oz3dERUVFRUXOztDQSSdPa2xsa2tra2ttbW1ta4yx29rb3MGkim5WQSUlJScnR0lJSUlJSkpKSUlJSUlJSUlKvLy8u7y8u75GRkdHR0fs7OwPSqmfUEtJRTg4ODY2LysrKSkoKh4eHh4eHh4eH05OT09PT09PT09PT09PUFBQUFBQUFBQUFBPT0+4tra2Z2dbOTg7R2eIpK2kmIlsVUxHSlhwhJ+xq6OZmZmZjYiVioFsUS0iICo2TmCClaCzsaVrTEpccZGuurazsK+pop9cY1eRfGtfVUc/dZKecWhtomFjX3aBgXFgVUlAUYeY1ipFVWNseIKMkpmiqK2wubu+wMTFxcbGy8vQ0tHR0tR3iGBXbElAqKuOUk9Yk5OvuLm5ubSgcFZLTGpukpRma2dnZ2dnfpeZl4dwalBOZ2egtbOZeGVmcYKdrbWwrZmZZ2dnZ0c5MzMxMTEzNTk8Z5mZmZmZmcnJx8fGxsXDv7NKQUBUZW1tZV1dY3eUoKqrq5+cnai6xMXAtaWdk4p3YDA8TFZhZ3J8hI6fqrW/z9fs1rypnY2AcWFSRz80LSkgPEFGTlBWV1xdYmhscHN3eHyChoqRlZmeoKKlrbC1usHGv7WupaOak4+IiIR+eXhzbmtnYF1bxsZUUU5JQzs4NmBgYGBhwMC/v7/Dw8PExMPDw2NiZWVlZWVlZWVlYWFlV1dWVlRRVFJSUlTFxcXExMPDw8PDxFBQVFRUVldTVFfHx8fGxcS/v7u5tLCtp6Cal5KOhIB7cm5oYFdOPjgqxauxqZoXipOUZ2eTQ0GIlW2up6+VztDWSXKrpVCoTIOkyz5AQUFBQ0NBP0BGS1FdaHF3goePmaCps7u/xMXFxccjIChdZWBcRx8cGh0rRF11jaW80uBzs6ez29zOqY1qPmxmVjNBPmegtLy1u7iajYyUo6uqpJ+XkY2NjYyKiISZZ2dohIRYW4SEVleUq7q6sI1EREtlkZFbXJOrvr68sZeZmJhnZ2dnZ7a4QUNDP8vR0c/Oy8tFR0eZmZmZmZmZmShmg6q4qYqTpbq7uLWzq6igoJ6Xko2BdmNROC01SkMqAOH3/v/73wDh+v//+eoA6Pj+//nqAOj4///46gDk9vxnZ2dnqKqtgHl1gJSdnZV3cHOCjZyjoJyYl5SUmZmZmUNBRUdLVFhicHt+fn5+fn5+fn5+fn2BiJSns7/ExsbFcHBwcHBtbW1sbGxsbW1sbG1ubXzBw3M1HyApamxtbWzPz8/Oz8nBs5R7Zl1FOTw4RFJgc4mgvsXLy1dSUltix3FwcHBwc3V1dXV1dXNxcXFy1tYgIiJ2dnZ2dnZ1cXFxXDooNVowKDBcMCk1Q1BdeI2kvt3q4Ljd5tyx3+jcqH1mX19mZ2eZmYQ8PkZHSldddYKPlJmZmZmZmZmZmZmTjGdnZ3l4eHl5bFVMSklUgKSxsbawmqqzy76Yk7O+tLCtUTowLVKPsMHS1dHOzMfDtauZgWBFPDEzMTE+XICTjoFnZ2dnW09LXU5FVmNzhJOerrqnj4S/uJmZmZmZmZmZmb5RUElMTrXQ3N3cyYZwbHWOo8HV3dvBnZWOj5mgq7G4fX18gMG/e3h4eXl5fHx8gcG8gjAvLi4uLi4xMTAwL31HxMXGxsbFxcXFxURBPz8/QMPDxMTDw0ZDQ0FGRkdHR5q50OPcv62YhHV2j6u1qo5xVUpUcImKe2dSQCMcL0ZleGtcPDEuJygzYGNjZWZmZ567w8XAqaCOj4+SlJWUlIxlZWVHNjAkJTFQX2BgYGBfYp2qsbGwqJmRjoN8dXJubGdnZ2dUTEtQVFhfZWhxfI2vwMbJyb6qZ1pSRUaZmZmZgIePoLvQ29GwdrDQ3NS+nmFBKyMvT5JPLiQvRF9weH+uvsTEuqBYo7nAwL6vd2FQR0dHandqSklJSUlJSldshv8SfP8NaP7/DAz/B/0DA8T/yw/r++4PbfcSEvX4FBpaUWfJe7Cfqatnq2erqZ9KO5N952qZW4d2c3WGxlCZmdJnZ2dnZ2dnZ2dnZ2dnZ2dnmZmZmZmZmZmZmZmZmZmZmWdnZ2dnZ2dnZ2dnZ2dnZ2eZmZmZmZmZmZmZmZmZmZmZZ2dnZ2dnZ2dnZ2dnZ2dnZ5mZmZmZmZmZmZmZmZmZmZmenJR5d4KSlYRmVlBRUVJnr8fHwbSrpaKelHllZWVugWdnZ2dnZ2dnZ2dnZ2dnZ2eZmZmZmZmZmZmZmZmZmZmZZ2dnZ2dnZ2dnZ2dnZ2dnZ5mZmZmZmZmZmZmZmZmZmZlnZ2dnbmBfYmuOvsC5qJKHhIB+fXx8fXFnVVaan5mZmWdnZ2dnZ2dnZ2dnZ2dnZ2eZmZmZmZmZmZmZmZmZmZmZZ2dnZ2dnZ2dnZ2dnZ2dnZ5mZmZmZmZmZmZmZmZmZmZlnZ2dnZ2dnZ2dnZ2dnZ2dnmZmZmZmZmZmZmZmZmZmZmWdnZ2dhWoGRhltYZXyap6mfc3FmYXycqa6kj4J9fYGMZ2dnZ2dnZ2dnZ2dnZ2dnZ5mZmZmZmZmZmZmZmZmZmZlzdTw6Oz8/Pz9FR0pPV2Fqc36JjZqgqrC2vL+/vnd3c5pROjQxKycrKysuMDAxNj44ODtKk7zL0NS/jK/A0Mm4Z2dnZ2dnZ2dnZ2dnZ2dnZ5KtwdDMwamNZmdnZ2dnZ2eKg2dfaGt5eYS4mnBmY2VnZ2dna4+rq6t+bnZ2oKOnmLCwZ0k8Ozs7PEBLUltsj6q0ury6mX1RSpi5uFBKh6u5S05Ma2trampqTE5OTk5OecnJysvLra+urq60yc7OzspwcHJy1NbX2NjY1tR1cnV1c3Nzubm2tkNBQUNxcHJycaurq2dnZ2dmY2NqxsbExV9fX2HGycbGxkVEPkA8Ozs7Ii5L/+sAGi9FYXecvtXh7PX5/v7+/v7++/Dr3LAoDRMjIiUCIy8rPDRHUU9GHhMZIDUKCkQqGhoKCQwREy88PoSMnIynoLuoz7i8l6eCcnxXZjlOGE9BbmGCopfGp7iZQUNFTHagya6TcEVDQUFBW2iBmai5xc/Gua2VfWtWTkc7Ozs8tLS0trS0Ojo4ODk5uLi4tra2tbW2tra4tbW1tT5WaHFzbF1QODlLbp21w8/Rz8/Pz9DR0dHR0c65h1Y+coOgu8TDuZ13YEA0MDM/VG2Hmaq1wMXGxsO1p5SAc206c3NzlaeooIhYQzpAZnZ1dsPBwMDBwcHBwHV3dnM7O09wlMXav5d2XUs1IjtGXHWPorDF2MOtmYFxW0s6LygkZ2doMzMzMTNlZWhnlZWVlZWV0NDS0NDQ0NDPmJmZmWeYXC8tLS0tLispKTxlfJGcnaq1uriulJK4trWYlbq4qGdnZ2dnZ2dnZ2dnZ2dnZ2eZqL7Hyb+xnJSEfTEpQJyaZ2dnZ2evsLS5Tjw8RU5PZ5mZmZmZmWhdXF+ZmZmZmZlnZ2eAl56VaFJFQ0VKZ2dnmZmZmZmZmZmZmZmZmZmZmWJnZ2dnZ2dnZ2dnZ2dnZ2eZtb6+saOVh3x5cVQ/QUxfNEFOXWVrc36Hj5yjpaijeJejtsDFys/V1tfX1tXV1SuaUTpYVlZ5WlxdXDAwMWA+ODg7SpO5xtDOz6TQ0Mq8rspnUVFMS1ZztsbHvq+djU9PUGF2iZior7i+wMHDxsnKP1BmZWA4NCozO1eInrPBxYaGg7+/moJRQDAkIyMkKTNbWldXV2d2dmc4ODg5OnmvxcTExMSxV1hYWFiImZmZilqCipRyj5uHomxkmX19hY2giWeHZmSMg5RnmIGZpYFmDw4LCgoJCAcHBgYFBQQEAwMDAgICAgICAgICAgICAgAPDgsKCQkJCAgIBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwEODg4ODg4ODg0MDAwMDAwMDAwLCwsLCwsLCwoKCgoKAgUICgsNDg8PDw8PDw8ODg0NDAwLCwsKCgoJCQgICAcPDgwLCgkIBwcGBgYGBQUFBQUEBAMDAgICAgEBAQ8PDw8ODg4ODg4ODg4ODg4ODg0NDAwLCgoJCAgGBQQCAQAAAAUHCQoLCwwMDA0NDQ0ODg4ODg0NDQ0NDAwMDAwMDAwBAQECAgIDAwMDBAQFBAQFBQYHBwgJCQoLCwwNDg4ODg8ODAsKCQgHBwYGBgYFBQUFBQQEAwMCAgICAQEBAQAADw4MCwoJCAcHBgYGBgUFBQUFBAQDAwICAgIBAQEBAAAPDgwLCgkIBwcGBgYGBQUFBQUEBAMDAgICAgEBAQEAAA8ODAsKCQgHBwYGBgYFBQUFBQQEAwMCAgICAQEBAQAADw4MCwoJCAcHBgYGBgUFBQUFBAQDAwICAgIBAQEBAAAPDgwLCgkIBwcGBgYGBQUFBQUEBAMDAgICAgEBAQEAAA8ODAsKCQgHBwYGBgYFBQUFBQQEAwMCAgICAQEBAQAADw4MCwoJCAcHBgcGBgYGBQUFBQYHCAgHCAgBAQEBAAA=\";\r\n});\r\n\n/*global requirejs*/\r\ndefine('SEnvWorker',[\"SEnv\",\"WorkerServiceW\",\"Tones.wdt\",\"promise\"],function (SEnv, WS,wdt,_) {\r\n    var e;\r\n    function load(params) {\r\n        var p=Promise.resolve();\r\n        if (!e) {\r\n            var ctx={sampleRate:params.sampleRate};\r\n            e=new SEnv(ctx,{wavOutSpeed:10000});\r\n            p=e.loadWDT(wdt);\r\n        }\r\n        return p.then(function () {\r\n            e.load(params.mzo);\r\n        });\r\n    }\r\n    WS.serv(\"MezonetJS/load\",load);\r\n    WS.serv(\"MezonetJS/wavOut\",function (params) {\r\n        var p=Promise.resolve();\r\n        if (params.mzo) {\r\n            p=load(params);\r\n        }\r\n        return p.then(function () {\r\n            return e.wavOut({maxSamples:params.maxSamples,rate:params.rate});\r\n        }).then(function (wctx) {\r\n            delete wctx.PC2Time;\r\n            console.log(\"SEW succ\",wctx.writtenSamples);\r\n            return wctx;\r\n        });\r\n    });\r\n    WS.serv(\"test\", function () {\r\n        console.log(\"TEST!!\");\r\n        return \"OK\";\r\n    });\r\n    WS.ready();\r\n});\r\n\n\nrequire([\"SEnvWorker\"]);\n");
    function arrayToAudioBuffer(context,arysrc,sampleRate) {
        var buffer = context.createBuffer(1, arysrc.length, sampleRate);
        var ary = buffer.getChannelData(0);
        for (var i = 0; i < ary.length; i++) {
             ary[i] = arysrc[i];
        }
        return buffer;
    }
    function timeout(t) {
        return new Promise(function (s) {
            setTimeout(s,t);
        });
    }
    function now(){return new Date().getTime();}

    var Playback=Klass.define({
        $this:true,
        $: function (t,src,options) {
            // src:MezonetClient
            //  ws:WS.Wrapper
            t.w=new WS.Wrapper(new Worker(workerURL));
            t.context=src.context;
            t.mzo=src.mzo;
            t.src=src;
            t.sampleRate=t.context.sampleRate;
            t.curRate=1;
            t.plusTime=0;
            t.writtenSamples=0;
            t.scriptProcessorSize=options.scriptProcessorSize||0;
            t.wdataSize=Math.floor(t.sampleRate/2);
            t.processDuration=[];
            t.lastProcessed=now();
        },
        playNode: function (t,options) {
            if (t.isStopped) return ;
            if (this.isSrcPlaying) return;
            options=options||{};
            var source = t.context.createBufferSource();
            var a=[];for (var i=0;i<t.sampleRate;i++) a[i]=0;//i%500?0.2:-0.2;
            var buffer= arrayToAudioBuffer(t.context,a,t.sampleRate);
            source.buffer=buffer;

            var scriptProcessor = this.context.createScriptProcessor(t.scriptProcessorSize,1,1);
            scriptProcessor.onaudioprocess=t.refresh.bind(t);
            this.context.createGain = this.context.createGain || this.context.createGainNode;
            var gainNode = this.context.createGain();
            scriptProcessor.connect(gainNode);
            gainNode.connect(this.context.destination);
            t.gainNode=gainNode;
            this.bufSrc=source;
            source.loop=true;
            source.connect(gainNode);
            source.start = source.start || source.noteOn;
            source.start();
            t.lastProcessed=now();
            this.isSrcPlaying = true;
            t.bufSrc=source;
            t.scriptProcessor=scriptProcessor;
            var volume=options.volume||1;
            gainNode.gain.value=volume;
            t.rate=1;
            t.trackTime=0;
        },
        start:function (t,options) {
            if (t.isStopped) return Promise.resolve();
            return t.prepareBuffer().then(function () {
                t.playNode(options);
                t.startRefreshLoop();
            });
        },
        getCurrentTime: function (t) {
            return t.trackTime;
        },
        setRate: function (t,rate) {
            if (rate <= 0 || isNaN(rate)) rate = 1;
            t.rate=rate;
        },
        refresh: function (t,e) {
            /*var n=now();
            t.processDuration.push(n-t.lastProcessed);
            t.lastProcessed=n;*/
            var data = e.outputBuffer.getChannelData(0);
            var i;
            if (t.isPaused) {
                for (i=0;i<data.length;i++) {
                    data[i]=0;
                }
                return;
            }
            var len=Math.min(data.length,t.buffer.length);
            for (i=0;i<len;i++) {
                data[i]=t.buffer[i];
            }
            t.buffer.splice(0,len);
            if (t.hitToLast && t.buffer.length===0) t.stop();
        },
        prepareBuffer: function(t) {
            //console.log("maxsamples",t.wdataSize);
            if (t.buffer) return Promise.resolve(t.buffer);
            return t.w.run("MezonetJS/wavOut",{
                mzo:t.mzo,
                sampleRate:t.sampleRate,
                maxSamples:t.wdataSize
            }).then(function (res) {
                t.buffer=res.arysrc;
                t.writtenSamples+=res.arysrc.length;
                return t.buffer;
            });
        },
        startRefreshLoop: function (t) {
            //if (t.playbackMode.type==="AudioBuffer") return "loop not used";
            return refresh();
            function refresh() {
                return timeout(0).then(function () {
                    if (!t.isSrcPlaying) {
                        if (t.w) t.w.terminate();
                        return "stopped";
                    }
                    var reqLen=t.wdataSize-t.buffer.length;
                    if (reqLen<=0) return timeout(10).then(refresh);
                    return t.w.run("MezonetJS/wavOut",{
                        maxSamples:reqLen,
                        rate: t.rate
                    }).then(function (res) {
                        var s=res.arysrc;
                        t.buffer=t.buffer.concat(s);
                        t.trackTime=res.trackTime;
                        if (res.hasNext) {
                            return refresh();
                        } else {
                            t.hitToLast=true;
                        }
                    });
                });
            }
        },
        setVolume: function (t,volume) {
            volume=typeof volume==="number" ? volume:1;
            if (t.gainNode) t.gainNode.gain.value=volume;
        },
        pause: function (t) {
            if (t.isStopped) return;
            if (!t.isSrcPlaying) return;
            if (t.isPaused) return;
            t.isPaused=true;
        },
        resume: function (t) {
            if (t.isStopped) return;
            if (!t.isSrcPlaying) return;
            if (!t.isPaused) return;
            t.isPaused=false;
        },
        stop: function (t) {
            if (t.bufSrc) t.bufSrc.stop();
            if (t.scriptProcessor) t.scriptProcessor.disconnect();
            if (t.gainNode) t.gainNode.disconnect();
            t.isSrcPlaying=false;
            t.isStopped=true;
            return "stopped";
        }
    });
    var Mezonet=Klass.define({
        $this:true,
        $:function (t,context,mzo) {
            t.w=new WS.Wrapper(new Worker(workerURL));
            t.context=context;
            t.sampleRate=t.context.sampleRate;
            t.mzo=mzo;

        },
        playAsMezonet: function (options) {
            return new Playback(this,options);
        },
        init: function (t,options) {
            options=options||{};
            t.maxSamples=options.maxSamples||t.context.sampleRate*4;
            return t.w.run("MezonetJS/wavOut",{
                mzo:t.mzo,
                sampleRate:t.sampleRate,
                maxSamples:t.maxSamples
            }).then(function (res) {
                console.log("WAVoUT done",res);
                if (res.loopStartFrac) {
                    res.loopStart=res.loopStartFrac[0]/res.loopStartFrac[1];
                }
                var buffer=arrayToAudioBuffer(t.context, res.arysrc, t.sampleRate);
                res.mezonet=t;
                res.decodedData=buffer;
                if (res.hasNext) {
                    t.playbackMode={
                        // 従来のMezonetスタイルでプレイ（wavにしてループ再生じゃない/ Mosimomo.mus とかもちゃんと演奏される）
                        type:"Mezonet",
                        //buffer: buffer,//先着1名
                        //worker:t.w // 先着1名
                    };
                } else {
                    t.playbackMode={
                        // 普通のWebAudioで再生してもらう
                        type:"AudioBuffer",
                        buffer:buffer//コピーしないで使い回す
                    };
                }
                t.w.terminate();
                res.playbackMode=t.playbackMode;
                //console.log(res);
                return res;
            });
        },
        terminate: function (t) {
            t.w.terminate();
        }
    });
    Mezonet.Playback=Playback;
    return Mezonet;
});

    return require("MezonetClient");
}));
