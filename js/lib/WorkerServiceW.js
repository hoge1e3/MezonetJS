// Worker Side
define(["promise","root","debugPrint"], function (_,root,D) {
    var idseq=1;
    var paths={},queue={},self=root;
    function debug() {
        //console.log.apply(console,["WSW"].concat(Array.prototype.slice.call(arguments)));
    }
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
                    debug("Q",D.shortJSON(e));
                    if (e.status=="ok") {
                        succ(e.result);
                    } else {
                        err(e.error);
                    }
                };
                var send={
                    reverse: true,
                    id: id,
                    path: path,
                    params: params
                };
                debug("r",D.shortJSON(send));
                self.postMessage(send);
            });
        }
    };
    self.addEventListener("message", function (e) {
        var d=e.data;
        debug("mesg", D.shortJSON(d));
        var id=d.id;
        var context={id:id};
        if (d.reverse) {
            queue[d.id](d);
            delete queue[d.id];
            return;
        }
        try {
            Promise.resolve( paths[d.path](d.params,context) ).then(function (r) {
                var send={
                    path:d.path,
                    id:id, result:r, status:"ok"
                };
                self.postMessage(send);
                debug("ret", D.shortJSON(send));
            }).then(function(){},sendError);
        } catch (ex) {
            sendError(ex);
        }
        function sendError(e) {
            var send={
                path:d.path,
                id:id, error:e?(e.stack||e+""):"unknown", status:"error"
            };
            try {
                self.postMessage(send);
                console.error("WSW:err",D.shortJSON(send));
            } catch (ex) {
                console.error("WSW:err:err",id,ex.stack);
                try {
                    setTimeout(function () {sendError(e);},500);
                }catch(ex2) {
                    console.error(ex2.stack);
                }
            }
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
