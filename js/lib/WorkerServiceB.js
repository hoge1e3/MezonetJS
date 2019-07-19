// Browser Side
var idseq=0;
define(["promise","Klass","root","debugPrint"],
function (_,Klass,root,D) {
    var idseq=1;
    var ISREADY="WorkerService/isReady";
    function debug() {
        //console.log.apply(console,["WSB"].concat(Array.prototype.slice.call(arguments)));
    }

    var Wrapper=Klass.define({
        $this:true,
        $: function (t,worker) {
            t.id=idseq++;
            t.idseq=1;
            t.queue={};
            t.worker=worker;
            t.readyQueue=[];
            worker.addEventListener("message",function (e) {
                var d=e.data;
                debug(t.id, D.shortJSON(d));
                if (d.reverse) {
                    t.procReverse(e);
                } else if (d.ready) {
                    t.ready();
                } else if (d.id) {
                    t.queue[d.id](d);
                    delete t.queue[d.id];
                } else {
                    console.error("WSB: Invalid data",e.data);
                }
            });
            t.run(ISREADY).then(function (r) {
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
                    var send={
                        path: path,
                        reverse:true,
                        status:"ok",
                        id:id,
                        result: r
                    };
                    //console.log("WSB::rev",D.shortJSON(send));
                    t.worker.postMessage(send);
                },sendError);
            } catch(err) {
                sendError(err);
            }
            function sendError(e) {
                var send={
                    reverse: true,
                    id:id, error:e?(e.stack||e+""):"unknown", status:"error"
                };
                console.error("WSB::err",D.shortJSON(send));
                t.worker.postMessage(send);
            }
        },
        ready: function (t) {
            if (t.isReady) return;
            t.isReady=true;
            //console.log("Worker is ready!");
            t.readyQueue.forEach(function (f){ f();});
        },
        readyPromise: function (t) {
            return new Promise(function (succ) {
                if (t.isReady) return succ();
                t.readyQueue.push(succ);
            });
        },
        run: function (t, path, params) {
            var p=(path===ISREADY?Promise.resolve():t.readyPromise());
            return p.then(function() {
                return new Promise(function (succ,err) {
                    var id=t.id+":"+(t.idseq++);
                    t.queue[id]=function (e) {
                        debug("Status",t.id, D.shortJSON(e));
                        if (e.status=="ok") {
                            succ(e.result);
                        } else {
                            err(e.error);
                        }
                    };
                    var send={
                        id: id,
                        path: path,
                        params: params
                    };
                    debug("run",D.shortJSON(send));
                    t.worker.postMessage(send);
                });
            });
        },
        terminate: function (t) {
            if (t.terminated) return;
            debug("Term",t.id);
            t.worker.terminate();
            t.terminated=true;
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
