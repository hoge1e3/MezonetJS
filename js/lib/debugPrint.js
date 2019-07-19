define([],function () {
    return {
        shortJSON: function (o,depth) {
            depth=depth||2;
            if (o instanceof Array) {
                return "["+o.length+"]";
            }
            if (depth<=0) return "<"+typeof o+">";
            switch(typeof o) {
                case "string":case "number":case "boolean":
                return JSON.stringify(o);
                default:
                if (!o) return o+"";
                var buf="{";
                for (var k in o) {
                    buf+=k+": "+this.shortJSON(o[k],depth-1)+", ";
                }
                buf=buf.replace(/, $/,"}");
                return buf;
            }
        }
    };
});
