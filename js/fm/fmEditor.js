window.addEventListener("load",function (){
    //const $=window.$;
    const doc=document.querySelector.bind(document);
    const expr=(q,a)=>`s(t+s(t*${q.n}/${q.d})*${a})*0.3`;
    const t=(n,q,a)=>`1[zfm@${n},256,${q.d},"${expr(q,a)}"]`;//`; [ZFM:${n},${q.n},${q.d},${a}]`;
    const gcd=(x,y)=>x<y?gcd(y,x): x%y==0 ? y : gcd(x-y,y);
    const q=(n,d)=>({
        value: n/d, n, d
    });
    const qary=[q(1,4),q(1,2),q(1,1),q(3,2),q(2,1),q(5,2),q(3,1),q(4,1),q(5,1),q(6,1),q(7,1),q(8,1),q(16,1)];
    /*for (let i=1;i<=4;i*=2) for (let j=1;j<=i;j++) {
        if (gcd(i,j)===1) wary.push(q(j,i));
    }
    wary.sort((a,b)=>a.value-b.value);
    const nearq=(v)=>{
        let e;
        for (e of wary) {
            if (v<e.value) return e;
        }
        return e;
    };*/
    const cv=doc("#wavForm");
    const W=cv.getAttribute("width")-0;
    const H=cv.getAttribute("height")-0;
    const A=2;
    const F=8;
    const ctx=cv.getContext("2d");
    cv.addEventListener("mousedown",e=>{
        const {x:ampraw,y:fraw}={x:e.offsetX/W*A, y:e.offsetY/H/**F*/};
        const fq=qary[Math.floor(fraw*qary.length)];// nearq(fraw%1);
        const amp=Math.floor(ampraw*100/Math.sqrt(fq.value))/100;
        //console.log(fraw, fqf);
        //const fq=q(Math.floor(fraw)*fqf.d+fqf.n, fqf.d);
        console.log(fq,amp);
        //console.log(expr(xq, y));
        const f=window.zfmExpr(expr(fq, amp));
        ctx.fillStyle="black";
        ctx.fillRect(0,0,W,H);
        ctx.fillStyle="lime";
        ctx.fillRect(W/fq.d,0,1,H);
        ctx.strokeStyle="white";
        ctx.beginPath();
        ctx.moveTo(-10,H/2);
        for (let i=0;i<W;i++) {
            ctx.lineTo(i, (f(i*fq.d/W )*0.5+0.5)*H);
        }
        ctx.stroke();
        const n=doc("#wavNo").value-0;
        doc("#zcmd").value=t(n,fq, amp);
        const pb=window.playback;
        if (pb) {
            const wd=[];
            wd.lambda=256;
            for (let i=0;i<256*fq.d;i++) {
                wd.push(f(i/256));
            }
            pb.setWaveDat(n,wd);
        }
        //ctx.fillRect(xq.value/F*W , e.offsetY,2,2);

        //window.zfmExpr(expr(  ));
        //console.log(e);
    });
    //console.log(cv);
});
