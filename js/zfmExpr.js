define(function (require, exports, module) {
    const funcs=["s","c","q","r","w","d"];
    const avail=["t",...funcs];
    function check(expr) {
        if (!expr.match(/^[\s\+\-\*\/\%0-9\.\,a-z\(\)]*$/)) {
            throw new Error(`Invalid token in zfm ${expr}`);
        }
        expr.replace(/\b[a-z]+\b/g, (r)=> {
            if (avail.indexOf(r)<0) throw new Error(`Invalid symbol in zfm ${expr}`);
        });
        const src=`
            const {${funcs.join(",")}}=funcs;
            return (t=>${expr});
        `;
        const F="Func"+"tion";
        const ff=new window[F]("funcs", src);
        const funcobjs={
            s: t=>Math.sin(t*Math.PI*2),
            c: t=>Math.cos(t*Math.PI*2),
            q: t=>((t,d=0.5)=>(t<d?-1:1))(t%1),
            r: t=>(t=>(t<0.25? t*4: t<0.75 ? 1-(t-0.25)*4 : -1+(t-0.75)*4))(t%1) ,
            w: t=>(t=>(t<0.5?t*2 : -1+(t-0.5)*2))(t%1),
            d: (r,t)=>(t=>( t<r ? (t/r)*0.5 : 0.5+((t-r)/(1-r))*0.5 ))(t%1),
        };
        const f=ff(funcobjs);
        return f;
    }
    module.exports=check;
});
