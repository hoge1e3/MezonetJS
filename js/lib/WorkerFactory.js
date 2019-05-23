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
        createFromString: function (src) {
            var url=URL.createObjectURL( new Blob([src] ,{type:"text/javascript"} ));
            return new Worker(url);
        },
        require: function (name) {
            return new Worker("worker.js?main="+name);
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
