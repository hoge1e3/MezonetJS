define([],function () {
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
