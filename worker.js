/* global self,requirejs,reqConf*/
var root=self;
self.importScripts("js/lib/require.js");
self.importScripts("js/reqConf.js");
requirejs.config(reqConf);
var main=getQueryString("main");
requirejs([main],function () {});
function getQueryString(key, default_)
{
    if (arguments.length===1) default_="";
    key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regex = new RegExp("[\\?&]"+key+"=([^&#]*)");
    var qs = regex.exec(root.location.href);
    if(qs == null)
     return default_;
    else
     return (qs[1]);
}
