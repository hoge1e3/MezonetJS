var data=`
      b0 04 00 00 0a 1b 00 00 00 64 78 65 05 6e 00 66
      00 6b 00 73 00 00 00 76 00 74 00 67 78 00 24 22
      56 ff ff ff 15 00 00 00 64 78 65 05 6e 00 66 00
      6b 00 73 00 00 00 76 00 74 00 ff ff ff 15 00 00
      00 64 78 65 05 6e 00 66 00 6b 00 73 00 00 00 76
      00 74 00 ff ff ff 15 00 00 00 64 78 65 05 6e 00
      66 00 6b 00 73 00 00 00 76 00 74 00 ff ff ff 15
      00 00 00 64 78 65 05 6e 00 66 00 6b 00 73 00 00
      00 76 00 74 00 ff ff ff 15 00 00 00 64 78 65 05
      6e 00 66 00 6b 00 73 00 00 00 76 00 74 00 ff ff
      ff 15 00 00 00 64 78 65 05 6e 00 66 00 6b 00 73
      00 00 00 76 00 74 00 ff ff ff 15 00 00 00 64 78
      65 05 6e 00 66 00 6b 00 73 00 00 00 76 00 74 00
      ff ff ff 15 00 00 00 64 78 65 05 6e 00 66 00 6b
      00 73 00 00 00 76 00 74 00 ff ff ff 15 00 00 00
      64 78 65 05 6e 00 66 00 6b 00 73 00 00 00 76 00
      74 00 ff ff ff
`;
var d=[];
data.replace(/[0-9a-f]+/g,function (data) {
    d.push("0x"+data-0);
});
var ver=readLong(d);
var chs=d.shift();
chdatas=[];
for (var i=0;i<chs;i++) {
    chdata=[];
    chdatas.push(chdata);
    var len=readLong(d);
    console.log(len);
    if(len>999999) throw new Error("LONG");
    for (var j=0;j<len;j++) {
        chdata.push(d.shift());
    }
}
console.log(chdatas);

function readLong(a) {
    var r=a.shift(),e=1;
    e<<=8;
    r+=a.shift()*e;
    e<<=8;
    r+=a.shift()*e;
    e<<=8;
    r+=a.shift()*e;
    return r;
}
