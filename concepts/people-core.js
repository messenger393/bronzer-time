// ======================= math & projection =======================
const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,easeIn=t=>t*t*t,easeOut=t=>1-Math.pow(1-t,3);
let SEED=1;const rnd=()=>{SEED=(SEED*16807)%2147483647;return SEED/2147483647},R=(a,b)=>a+rnd()*(b-a),pick=a=>a[Math.floor(rnd()*a.length)];
const hx=h=>h[0]!=='#'?h.match(/\d+/g).slice(0,3).map(Number):[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const sh=(h,a)=>{const c=hx(h).map(v=>Math.max(0,Math.min(255,Math.round(a>0?v+(255-v)*a:v*(1+a)))));return'#'+c.map(v=>v.toString(16).padStart(2,'0')).join('')};
const mixc=(a,b,t)=>{const A=hx(a),B=hx(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')};
const OBQ=.62,ZH=.86;let SC=96;
const P=(p,o)=>[o[0]+p[0]*SC,o[1]+(p[1]*OBQ-p[2]*ZH)*SC];
const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],mul=(a,s)=>[a[0]*s,a[1]*s,a[2]*s],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],len=a=>Math.hypot(a[0],a[1],a[2]),nrm=a=>{const l=len(a)||1;return[a[0]/l,a[1]/l,a[2]/l]};
function ik(S,T,a,b,pole){let d=sub(T,S),L=len(d);L=clamp(L,Math.abs(a-b)+1e-3,a+b-1e-4);const dn=nrm(d),x=(a*a-b*b+L*L)/(2*L),h=Math.sqrt(Math.max(0,a*a-x*x));let pv=sub(pole,mul(dn,dot(pole,dn)));pv=nrm(pv);return{E:add(add(S,mul(dn,x)),mul(pv,h)),H:add(S,mul(dn,L))}}
const LIGHT=(()=>{const l=Math.hypot(.6,.8);return[-.6/l,-.8/l]})();
function capsule(g,A,B,wa,wb,col,o){o=o||{};const dx=B[0]-A[0],dy=B[1]-A[1],L=Math.hypot(dx,dy)||.001,nx=-dy/L,ny=dx/L;
 g.beginPath();g.moveTo(A[0]+nx*wa,A[1]+ny*wa);g.lineTo(B[0]+nx*wb,B[1]+ny*wb);g.arc(B[0],B[1],wb,Math.atan2(ny,nx),Math.atan2(-ny,-nx),false);g.lineTo(A[0]-nx*wa,A[1]-ny*wa);g.arc(A[0],A[1],wa,Math.atan2(-ny,-nx),Math.atan2(ny,nx),false);g.closePath();
 const ld=nx*LIGHT[0]+ny*LIGHT[1],m=(wa+wb)/2,cx=(A[0]+B[0])/2,cy=(A[1]+B[1])/2,s=ld>0?1:-1,gr=g.createLinearGradient(cx+nx*m*s,cy+ny*m*s,cx-nx*m*s,cy-ny*m*s);
 gr.addColorStop(0,sh(col,.22));gr.addColorStop(.45,col);gr.addColorStop(1,sh(col,-.32));g.fillStyle=gr;g.fill();
 if(o.ol!==0){g.strokeStyle='rgba(28,18,10,.55)';g.lineWidth=Math.max(.6,SC/110);g.stroke()}
 if(o.rim!==0){g.save();g.clip();g.strokeStyle='rgba(255,236,200,.35)';g.lineWidth=Math.max(1,SC/60);g.beginPath();const k=-s;g.moveTo(A[0]+nx*wa*k*.85,A[1]+ny*wa*k*.85);g.lineTo(B[0]+nx*wb*k*.85,B[1]+ny*wb*k*.85);g.stroke();g.restore()}}
function ball(g,C,r,col,o){o=o||{};const gr=g.createRadialGradient(C[0]+LIGHT[0]*r*.45,C[1]+LIGHT[1]*r*.45,r*.1,C[0],C[1],r);gr.addColorStop(0,sh(col,.28));gr.addColorStop(.6,col);gr.addColorStop(1,sh(col,-.35));g.beginPath();g.arc(C[0],C[1],r,0,TAU);g.fillStyle=gr;g.fill();if(o.ol!==0){g.strokeStyle='rgba(28,18,10,.55)';g.lineWidth=Math.max(.6,SC/110);g.stroke()}
 if(o.rim!==0){g.save();g.clip();g.strokeStyle='rgba(255,236,200,.4)';g.lineWidth=Math.max(1,SC/55);g.beginPath();const a0=Math.atan2(-LIGHT[1],-LIGHT[0]);g.arc(C[0],C[1],r*.92,a0-.4,a0+.9);g.stroke();g.restore()}}
function blob(g,x,y,rx,ry,a,blur){g.save();g.filter='blur('+Math.max(.5,blur)+'px)';g.fillStyle='rgba(12,8,4,'+a+')';g.beginPath();g.ellipse(x,y,Math.max(.5,rx),Math.max(.5,ry),0,0,TAU);g.fill();g.restore()}
function poly(g,pts,fill,st,lw){g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();if(fill){g.fillStyle=fill;g.fill()}if(st){g.strokeStyle=st;g.lineWidth=lw||1;g.stroke()}}
function ln(g,a,b,col,w){g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.strokeStyle=col;g.lineWidth=w;g.lineCap='round';g.stroke()}
const swing=(p,keys)=>{for(let i=0;i<keys.length-1;i++){const[a,va,e]=keys[i],[b,vb]=keys[i+1];if(p>=a&&p<=b){const u=(p-a)/(b-a);const fn=e==='in'?easeIn:e==='out'?easeOut:ease;return lerp(va,vb,fn(u))}}return keys[keys.length-1][1]};
