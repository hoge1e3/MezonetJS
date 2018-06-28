//import P from "./Parser.js";
//import assert from "../klass/assert.js";
define(["Parser","assert"],function (P,assert) {
class Grammar {
    constructor(options) {
        this.defs={};
        if (options) {
            if (options.space) this.space=this.toParser(options.space);
        }
    }
    def(defs) {
        if (defs.$space) {
            this.space=this.toParser(defs.$space);
        }
        for (let k in defs) {
            let v=defs[k];
            if (k==="$space") {
                //this.space=this.toParser(v);
            } else {
                this.defs[k]=this.toParser(v===1? "'"+k : v).ret((r)=>{
                    if (r && typeof r==="object" && !r.type) r.type=k;
                    return r;
                });
            }
        }
    }
    get(name) {
        return this.defs[name] || P.lazy(()=>{
            const r=this.defs[name];
            if (!r) throw new Error(`Undefined grammar ${name}`);
            return r;
        });
    }
    toParser(expr) {
        if (expr instanceof P.Parser) return expr;
        if (typeof expr==="string") {
            if (expr.match(/^'/)) {
                const r=P.StringParser.str(expr.substring(1));
                if (this.space) return this.space.and(r).ret((s,b)=>b);
                return r;
            }
            return this.get(expr);
        } else if (expr instanceof RegExp) {
            let r=P.StringParser.reg(expr);
            if (this.space) return this.space.and(r).ret((s,b)=>b);
            return r;
        } else if (expr instanceof Array) {
            let p;
            const names=[];
            for (let e of expr) {
                if (e.constructor===Object) {
                    const tnames=[];
                    for (let k in e) {
                        tnames.push(k)
                    }
                    assert(tnames.length===1,"Invalid expr ",expr);
                    names.push(tnames[0]);
                    e=e[tnames[0]];
                } else names.push(null);
                e=this.toParser(e);
                if (!p) p=e;
                else p=p.and(e);
            }
            p=p.ret((...results)=>{
                const r={};
                for (let i=0;i<results.length;i++) {
                    r[i]=results[i];
                    if (names[i]==="this") return results[i];
                    if (names[i]==="$extend") {
                        Object.assign(r,results[i]);
                        delete r.type;
                    } else {
                        if (names[i]) r[names[i]]=results[i];
                    }
                }
                return r;
            });
            return p;
        }
        assert.fail("Invalid expr",expr);
    }
};
//const testf=(...{a,b})=>a+b;
const methods=["opt","rep0","rep1","sep0","sep1","except"];
const p=Grammar.prototype;
Grammar.P=P;
for (const m of methods) {
    Object.defineProperty(p,m,{
        get: function () {
            const g=this;
            return (...args)=>{
                const a=args.map(g.toParser.bind(g));
                const head=a.shift();
                return head[m](...a);
            };
        }
    });
}
const chainMethods=["and","or"];
for (const m of chainMethods) {
    Object.defineProperty(p,m,{
        get: function () {
            const g=this;
            return (...args)=>{
                const a=args.map(g.toParser.bind(g));
                let head=a.shift();
                while(a.length>0) {
                    head=head[m](a.shift());
                }
                return head;
            };
        }
    });
}
return Grammar;
});
//export default Grammar;
