// ======================= looks =======================
const SKIN={eg:['#a8714a','#8e5a36','#b98258'],hi:['#c49470','#b8875f'],ca:['#a97650','#b58560'],my:['#c8946a','#b8845a'],mi:['#c48a5e','#d29c70'],ba:['#9c6a45','#b07a50','#86593a'],as:['#a06c48','#946040'],mt:['#b88660','#a87650']};
const CIVS={
 eg:{name:'Egyptians',cloth:['#efe8d6','#e9dfc4'],trim:['#2f6fa8','#c9962c','#b33a2a'],hair:['#1a1410','#241a12'],hats:{peasant:'none',artisan:'cap',soldier:'nemesStripe',priest:'bald',noble:'wig'},hemM:.6,hemF:.12,sleeve:0},
 hi:{name:'Hittites',cloth:['#7a4a33','#5f3b5a','#8a6a3a'],trim:['#d8b25a','#c9c2a8'],hair:['#3a2618','#2b1c12'],hats:{peasant:'cap',artisan:'cap',soldier:'helm',priest:'tall',noble:'tall'},hemM:.3,hemF:.1,sleeve:1},
 ca:{name:'Canaanites',cloth:['#9a3b2e','#3d5a8a','#c9b48a'],trim:['#e8dcc0','#2a3a5a'],hair:['#1e140c','#2c1d10'],hats:{peasant:'turban',artisan:'turban',soldier:'helm',priest:'turban',noble:'turban'},hemM:.3,hemF:.1,stripe:1,sleeve:1},
 my:{name:'Mycenaeans',cloth:['#c8b48a','#8a3a2a','#3a5a7a'],trim:['#1e2e4a','#c8902c'],hair:['#3a2410','#20140a'],hats:{peasant:'none',artisan:'none',soldier:'boar',priest:'band',noble:'band'},hemM:.55,hemF:.1,flounceF:1,sleeve:0},
 mi:{name:'Minoans',cloth:['#c8452e','#2f78a8','#e0b03c'],trim:['#f0e6cf','#203a6a'],hair:['#140e0a','#2a160c'],hats:{peasant:'none',artisan:'none',soldier:'helm',priest:'tall',noble:'none'},hemM:.62,hemF:.1,flounce:1,sleeve:0},
 ba:{name:'Babylonians',cloth:['#d9c49a','#c8ad7c','#7a3a5a'],trim:['#8a5a2a','#c8902c'],hair:['#20160e','#2a1d12'],hats:{peasant:'band',artisan:'band',soldier:'helm',priest:'bald',noble:'fez'},hemM:.2,hemF:.1,fleece:1,sleeve:1},
 as:{name:'Assyrians',cloth:['#5a3a6a','#8a2a2a','#c8b080'],trim:['#d8a838','#e8dcc0'],hair:['#140e08','#1e140a'],hats:{peasant:'band',artisan:'band',soldier:'cone',priest:'fez',noble:'fez'},hemM:.15,hemF:.1,stripe:1,sleeve:1},
 mt:{name:'Mitanni',cloth:['#3a6a5a','#a86a2a','#d8c8a0'],trim:['#c83a2a','#e0c070'],hair:['#2a1a0e','#1a120a'],hats:{peasant:'cap',artisan:'cap',soldier:'cone',priest:'tall',noble:'cap'},hemM:.25,hemF:.1,sleeve:1}};
function mkLook(civ,cls,sex,age,seed){SEED=seed||7;const C=CIVS[civ],L={civ,cls,sex,age};
 L.skin=pick(SKIN[civ]);L.cloth=pick(C.cloth);L.trim=pick(C.trim);L.hair=age==='elder'?pick(['#bdb6aa','#9c968c','#d6d0c4']):pick(C.hair);
 L.h=age==='child'?.62:age==='elder'?.95:sex==='f'?.95:1;L.bw=sex==='f'?.85:cls==='soldier'?1.12:1;
 L.hem=sex==='f'?C.hemF:C.hemM;if(cls==='noble'||cls==='priest')L.hem=Math.min(L.hem,.14);if(cls==='soldier')L.hem=Math.max(.42,Math.min(L.hem,.55));
 L.hat=C.hats[cls];if(sex==='f'&&(L.hat==='bald'||L.hat==='helm'||L.hat==='nemesStripe'))L.hat=civ==='eg'?'wig':'veil';if(age==='child')L.hat='none';
 L.hairStyle=sex==='f'?(civ==='mi'?'curls':'long'):(age==='child'?(civ==='eg'?'lock':'short'):pick(['short','short','beard']));if((civ==='ba'||civ==='as'||civ==='mt'||civ==='hi')&&sex==='m'&&age!=='child'&&L.hat!=='bald')L.hairStyle='beard';if(civ==='eg'&&sex==='m')L.hairStyle='short';if(L.hat==='bald')L.hairStyle='bald';
 L.fleece=C.fleece&&cls!=='soldier';L.flounce=(C.flounce||C.flounceF)&&sex==='f';L.stripe=C.stripe;L.sleeve=C.sleeve||sex==='f'&&civ!=='mi'&&civ!=='eg';
 L.bare=sex==='m'&&(civ==='eg'||civ==='mi'||civ==='my')&&cls!=='noble'&&cls!=='priest';
 L.jewel=cls==='noble'||(cls==='priest'&&civ==='eg');L.lean=age==='elder'?.18:0;L.cape=cls==='noble'&&(civ==='hi'||civ==='ca'||civ==='as');
 L.armor=cls==='soldier'?pick(['#8a6a3a','#b08a4a']):null;return L}
// ======================= rig =======================
// local coords: r (right), fw (forward), z (up). facing f in radians, 0 = toward camera (+y)
const L2W=(v,f,o)=>[o[0]+v[0]*Math.cos(f)+v[1]*Math.sin(f),o[1]-v[0]*Math.sin(f)+v[1]*Math.cos(f),o[2]+v[2]];
function base(){return{hip:[0,0,.92],pitch:0,roll:0,lean:0,twist:0,fL:[-.11,0,0],fR:[.11,0,0],hL:null,hR:null,head:0,headDn:0,breath:0,vel:0,props:[],tool:null,knee:1}}
function solve(L,pz,f,o){const s=L.h,hw=.105*L.bw,sw=.19*L.bw,ua=.29,fa=.27,th=.46,sn=.45;
 const Fw=[0,1,0];
 const rot=v=>{let[r,fw,z]=v;if(pz.pitch){const c=Math.cos(pz.pitch),sn_=Math.sin(pz.pitch),pv=pz.pivot||[0,0,0];const a=fw-pv[1],b=z-pv[2];fw=pv[1]+a*c+b*sn_;z=pv[2]-a*sn_+b*c}if(pz.roll){const c=Math.cos(pz.roll),s_=Math.sin(pz.roll);const a=r,b=z;r=a*c-b*s_;z=a*s_+b*c}return L2W([r*s,fw*s,z*s],f,o)};
 const hip=pz.hip,tl=pz.lean+L.lean,tw=pz.twist;
 const tor=(r,z)=>{const rr=r*Math.cos(tw),ff=-r*Math.sin(tw);return[hip[0]+rr+Math.sin(tl)*z,hip[1]+ff+Math.sin(tl)*z,hip[2]+Math.cos(tl)*z]};
 const J={};J.hipL=[hip[0]-hw,hip[1],hip[2]];J.hipR=[hip[0]+hw,hip[1],hip[2]];
 const br=1+pz.breath*.03;J.shL=tor(-sw*br,.5);J.shR=tor(sw*br,.5);J.neck=tor(0,.58);J.headC=tor(0,.7+pz.breath*.004);J.chest=tor(0,.36);
 const knP=pz.knee>0?[0,1,.2]:[0,-1,.2];
 let k=ik(J.hipL,pz.fL.map((v,i)=>i==2?v+.06:v),th,sn,pz.kpL||knP);J.knL=k.E;J.anL=k.H;k=ik(J.hipR,pz.fR.map((v,i)=>i==2?v+.06:v),th,sn,pz.kpR||knP);J.knR=k.E;J.anR=k.H;
 const hang=(sd)=>[hip[0]+sd*(sw+.04)+Math.sin(tl)*.0,hip[1]+Math.sin(tl)*.3,hip[2]-.27+Math.cos(tl)*.0];
 const hl=pz.hL||hang(-1),hr=pz.hR||hang(1);
 k=ik(J.shL,hl,ua,fa,pz.elL||[-.4,-.6,-.5]);J.elL=k.E;J.haL=k.H;k=ik(J.shR,hr,ua,fa,pz.elR||[.4,-.6,-.5]);J.elR=k.E;J.haR=k.H;
 const W={};for(const n in J)W[n]=rot(J[n]);W.local=J;W.rot=rot;return W}
// ======================= drawing a person =======================
function drawPerson(g,L,pz,f,o,T){T=T||0;ORG=[o[0],o[1]-(pz.lift||0)*ZH*SC];const W=solve(L,pz,f,[0,0,0]),pr=v=>P(v,ORG),k=SC*L.h;
 const Fw=[Math.sin(f),Math.cos(f)];const facing=Fw[1];
 const it=[];const push=(d,fn)=>it.push({d,fn});
 const legC=L.armor&&L.cls==='soldier'?sh(L.skin,-.05):L.skin;
 // shadows
 const gc=pr([ (W.anL[0]+W.anR[0])/2,(W.anL[1]+W.anR[1])/2,0]);const pc=pr([W.hipL[0],W.hipL[1],0]);
 if(!pz.noShadow){const lying=Math.abs(pz.pitch)>.8;blob(g,gc[0]+SC*.04,gc[1]+SC*.01,k*(lying?.6:.24),k*(lying?.22:.11),.38,SC*.05);blob(g,pr(W.anL)[0],pr([W.anL[0],W.anL[1],0])[1],k*.07,k*.035,.35,1);blob(g,pr(W.anR)[0],pr([W.anR[0],W.anR[1],0])[1],k*.07,k*.035,.35,1)}
 // legs
 for(const sd of['L','R']){const hp=W['hip'+sd],kn=W['kn'+sd],an=W['an'+sd];
  push(kn[1]-.001,()=>{const toe=W.rot(add(W.local['an'+sd],[0,.11,-.05]));g.save();g.strokeStyle='rgba(28,18,10,.45)';g.lineCap='round';g.lineJoin='round';g.lineWidth=k*.096+1.2;g.beginPath();g.moveTo(...pr(hp));g.lineTo(...pr(kn));g.stroke();g.lineWidth=k*.072+1.2;g.beginPath();g.moveTo(...pr(kn));g.lineTo(...pr(an));g.stroke();g.lineWidth=k*.06+1.2;g.beginPath();g.moveTo(...pr(an));g.lineTo(...pr(toe));g.stroke();g.restore();
   capsule(g,pr(hp),pr(kn),k*.06,k*.048,legC,{ol:0});capsule(g,pr(kn),pr(an),k*.048,k*.036,legC,{ol:0});
   capsule(g,pr(an),pr(toe),k*.035,k*.03,L.skin,{ol:0,rim:0});const sm=pr(lerp3(an,toe,.5)),sc_=L.civ==='hi'?'#6a3a22':'#7a5030';ln(g,[sm[0]-k*.03,sm[1]],[sm[0]+k*.03,sm[1]],sc_,k*.016);if(k>220){const ap=pr(an),tp=pr(toe);ln(g,[ap[0]-k*.035,ap[1]-k*.01],[ap[0]+k*.035,ap[1]-k*.01],sc_,k*.012);ln(g,sm,tp,sc_,k*.008);g.fillStyle=sh(sc_,-.2);g.beginPath();g.ellipse(tp[0],tp[1]+k*.02,k*.045,k*.02,0,0,TAU);g.fill();ball(g,[ap[0],ap[1]-k*.01],k*.008,'#c8902c',{ol:0,rim:0})}})}
 // skirt / garment lower
 const hipM=mul(add(W.local.hipL,W.local.hipR),.5);
 const hem=Math.max(.06,L.hem),lagF=-(pz.vel||0)*.12+Math.sin(T*TAU*1.3)*.015;
 const loc=W.local;const sp=(pz.fR[1]-pz.fL[1]);
 const skirt=()=>{const fl=L.hem<.3?1.75:1.3,w=.13*L.bw*fl,z=Math.min(hipM[2]-.05,hem),cx=hipM[0],cy=hipM[1];
  const ring=(rad,zz,lag,wob)=>{const a=[];for(let i=0;i<24;i++){const t=i/24*TAU;a.push(pr(W.rot([cx+Math.cos(t)*rad,cy+Math.sin(t)*rad*.8+lag+(Math.sin(t)>0?sp*.15:0)*(L.hem<.3?1:.3),zz+Math.sin(t*3+T*TAU*2)*wob])))}return a};
  const top=ring(.15*L.bw,hipM[2]+.06,0,0),bot=ring(w,z,lagF,.012);const pts=hull(top.concat(bot));
  const gr=g.createLinearGradient(pts[0][0]-k*.2,0,pts[0][0]+k*.3,0);let mnx=1e9,mxx=-1e9;pts.forEach(p=>{mnx=Math.min(mnx,p[0]);mxx=Math.max(mxx,p[0])});const gr2=g.createLinearGradient(mnx,0,mxx,0);gr2.addColorStop(0,sh(L.cloth,.15));gr2.addColorStop(.5,L.cloth);gr2.addColorStop(1,sh(L.cloth,-.25));
  poly(g,pts,gr2,'rgba(30,20,10,.55)',Math.max(.6,SC/110));g.save();g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.clip();
  // fold lines
  g.strokeStyle='rgba(60,40,20,.18)';g.lineWidth=Math.max(1,k*.012);for(let i=0;i<24;i+=3){if(Math.sin(i/24*TAU)<0)continue;const a=top[i],b=bot[i];g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke()}
  const bands=(col,n,wd)=>{for(let r=1;r<=n;r++){const zz=z+(hipM[2]-z)*r/(n+1),rr=lerp(w,.15*L.bw,r/(n+1)),rg=ring(rr,zz,lagF*(1-r/(n+1)),0);g.strokeStyle=typeof col==='function'?col(r):col;g.lineWidth=k*wd;g.beginPath();for(let i=0;i<=12;i++){const p=rg[i%24];i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])}g.stroke()}};
  if(L.fleece)bands(r=>r%2?sh(L.cloth,-.2):sh(L.cloth,.2),5,.035);if(L.flounce)bands(r=>r%2?L.trim:'#f0e6cf',3,.035);if(L.stripe)bands(L.trim,3,.018);
  g.restore();g.strokeStyle=L.trim;g.lineWidth=k*.022;g.beginPath();for(let i=0;i<=12;i++){const p=bot[i%24];i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])}g.stroke();
 };
 push((W.hipL[1]+W.hipR[1])/2+.02*Math.sign(facing||1),skirt);
 // torso
 const torso=()=>{const a=pr(W.shL),b=pr(W.shR),c=pr(W.rot([loc.hipR[0]+.02,loc.hipR[1],loc.hipR[2]+.04])),d=pr(W.rot([loc.hipL[0]-.02,loc.hipL[1],loc.hipL[2]+.04]));
  const col=L.bare?L.skin:L.cloth;const ch=pr(W.chest);
  g.beginPath();g.moveTo(a[0],a[1]);g.quadraticCurveTo((a[0]+b[0])/2,(a[1]+b[1])/2-k*.03,b[0],b[1]);g.quadraticCurveTo(b[0]+k*.01,(b[1]+c[1])/2,c[0],c[1]);g.lineTo(d[0],d[1]);g.quadraticCurveTo(a[0]-k*.01,(a[1]+d[1])/2,a[0],a[1]);g.closePath();
  const gr=g.createLinearGradient(a[0]+LIGHT[0]*k*.2,a[1]+LIGHT[1]*k*.2,b[0]-LIGHT[0]*k*.1,c[1]);gr.addColorStop(0,sh(col,.25));gr.addColorStop(.55,col);gr.addColorStop(1,sh(col,-.3));g.fillStyle=gr;g.fill();g.strokeStyle='rgba(28,18,10,.55)';g.lineWidth=Math.max(.6,SC/110);g.stroke();
  g.save();g.clip();
  if(L.bare){g.strokeStyle='rgba(60,30,15,.25)';g.lineWidth=k*.01;g.beginPath();g.moveTo(ch[0],ch[1]-k*.06);g.lineTo(ch[0],ch[1]+k*.12);g.stroke()}
  if(L.armor&&k>140){const ac=L.armor;for(let yy=a[1]-k*.02;yy<d[1];yy+=k*.035){const row=Math.round((yy-a[1])/(k*.035));for(let xx=Math.min(a[0],d[0])-k*.05+(row%2)*k*.0175;xx<Math.max(b[0],c[0])+k*.05;xx+=k*.035){g.fillStyle=sh(ac,((row+xx/k*10|0)%3-1)*.08);g.beginPath();g.arc(xx,yy,k*.019,0,Math.PI);g.fill();g.strokeStyle='rgba(30,18,6,.55)';g.lineWidth=Math.max(.6,k*.003);g.stroke();g.fillStyle='rgba(255,240,200,.35)';g.fillRect(xx-k*.004,yy+k*.003,k*.008,k*.004)}}}
  else if(L.armor){const ac=L.armor;for(let i=0;i<4;i++){const zz=.18+i*.08;const p=pr(W.rot([0,loc.chest[1]+.02,0].map((v,j)=>j==2?loc.hipL[2]+zz+.05:v)));g.fillStyle=i%2?sh(ac,-.1):sh(ac,.1);g.fillRect(p[0]-k*.18,p[1]-k*.03,k*.36,k*.06)}g.fillStyle='rgba(255,230,170,.18)';g.fillRect(a[0],a[1],b[0]-a[0],k*.04)}
  if(L.cape){g.fillStyle=sh(L.trim,-.3);g.globalAlpha=.4;g.fillRect(a[0]-k,a[1],k*2,k*.05);g.globalAlpha=1}
  if(L.fleece&&!L.bare){for(let i=0;i<14;i++){g.fillStyle=i%2?sh(L.cloth,-.12):sh(L.cloth,.12);g.beginPath();g.arc(lerp(d[0],c[0],(i%5)/4),lerp(a[1],d[1],Math.floor(i/5)/3+.15),k*.03,0,Math.PI);g.fill()}}
  // shading AO under arms & highlight
  const sg=g.createRadialGradient(ch[0]+LIGHT[0]*k*.1,ch[1]+LIGHT[1]*k*.1,1,ch[0],ch[1],k*.3);sg.addColorStop(0,'rgba(255,240,210,.18)');sg.addColorStop(1,'rgba(0,0,0,.12)');g.fillStyle=sg;g.fillRect(ch[0]-k,ch[1]-k,2*k,2*k);
  g.restore();
  if(L.jewel){g.strokeStyle='#d8a838';g.lineWidth=k*.035;g.beginPath();const n=pr(W.neck);g.arc(n[0],n[1]+k*.04,k*.085,.15*Math.PI,.85*Math.PI);g.stroke();g.strokeStyle='#2f6fa8';g.lineWidth=k*.015;g.beginPath();g.arc(n[0],n[1]+k*.04,k*.11,.2*Math.PI,.8*Math.PI);g.stroke()}
  ln(g,d,c,L.cls==='soldier'?'#5a3a1e':L.trim,k*.035);
 };
 const tD=(W.shL[1]+W.shR[1])/2;push(tD+.001,torso);
 // arms
 for(const sd of['L','R']){const s=W['sh'+sd],e=W['el'+sd],h=W['ha'+sd];
  push((s[1]+e[1]+h[1])/3+(h[1]>s[1]?.03:-.03),()=>{const sl=L.sleeve&&!L.bare;g.save();g.strokeStyle='rgba(28,18,10,.45)';g.lineCap='round';g.lineJoin='round';g.lineWidth=k*.084+1.2;g.beginPath();g.moveTo(...pr(s));g.lineTo(...pr(e));g.stroke();g.lineWidth=k*.066+1.2;g.beginPath();g.moveTo(...pr(e));g.lineTo(...pr(h));g.stroke();g.restore();capsule(g,pr(s),pr(e),k*.05,k*.042,sl?L.cloth:L.skin,{ol:0});capsule(g,pr(e),pr(h),k*.042,k*.033,(sl&&L.civ==='hi')?L.cloth:L.skin,{ol:0});
   if(L.jewel){ball(g,pr(lerp3(e,h,.75)),k*.03,'#d8a838',{rim:0})}
   ball(g,pr(h),k*.042,L.skin);if(k>220){const he=pr(h),ee=pr(e),dx=he[0]-ee[0],dy=he[1]-ee[1],dl=Math.hypot(dx,dy)||1,ux=dx/dl,uy=dy/dl;for(let q=-1.5;q<=1.5;q++){const bx=he[0]+ux*k*.03-uy*q*k*.016,by=he[1]+uy*k*.03+ux*q*k*.016;capsule(g,[bx,by],[bx+ux*k*.035+uy*k*.012,by+uy*k*.035-ux*k*.012],k*.0095,k*.008,L.skin,{rim:0})}capsule(g,[he[0]-uy*k*.035,he[1]+ux*k*.035],[he[0]-uy*k*.05+ux*k*.03,he[1]+ux*k*.05+uy*k*.03],k*.011,k*.009,L.skin,{rim:0})}})}
 // head
 push(Math.max(tD,W.headC[1])+.004,()=>drawHead(g,L,W,f,k,pz));
 // tool & props attached
 if(pz.tool)push(pz.tool.d!==undefined?W.rot(pz.tool.a)[1]+pz.tool.d:Math.max(W.haR[1],W.haL[1])+.01,()=>drawTool(g,pz.tool,W,k));
 (pz.held||[]).forEach(h=>push(W.rot(h.at)[1]+(h.d||.02),()=>h.fn(g,pr(W.rot(h.at)),k,W)));
 it.sort((a,b)=>a.d-b.d).forEach(i=>i.fn());
 return W}
const lerp3=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
function drawHead(g,L,W,f,k,pz){const pr=v=>P(v,ORG);const c=pr(W.headC),r=k*.115;const n=pr(W.neck);
 capsule(g,n,[c[0],c[1]+r*.3],r*.42,r*.42,L.skin,{rim:0});
 const fx=Math.sin(f+(pz.head||0)),fy=Math.cos(f+(pz.head||0));const back=[c[0]-fx*r*.35,c[1]-fy*r*.22-r*.15];
 const hairBack=()=>{if(L.hairStyle==='long'||L.hairStyle==='curls'||L.hat==='wig'){g.fillStyle=sh(L.hair,-.1);g.beginPath();g.ellipse(c[0]-fx*r*.3,c[1]+r*.45,r*1.05,r*1.15,0,0,TAU);g.fill();if(L.hairStyle==='curls'){for(let i=0;i<7;i++){ball(g,[c[0]-r+i*r*.33,c[1]+r*1.1+Math.sin(i)*r*.2],r*.22,L.hair,{ol:0,rim:0})}}}};
 if(fy>-.2)hairBack();
 if(L.hat==='nemesStripe'){g.fillStyle='#e0c060';g.beginPath();g.moveTo(c[0]-r*1.25,c[1]+r*1.3);g.lineTo(c[0]-r*1.05,c[1]-r*.4);g.lineTo(c[0]+r*1.05,c[1]-r*.4);g.lineTo(c[0]+r*1.25,c[1]+r*1.3);g.closePath();g.fill();g.strokeStyle='#2f5f98';g.lineWidth=r*.12;for(let i=0;i<5;i++){g.beginPath();g.moveTo(c[0]-r*1.15+i*r*.02,c[1]+r*i*.3-r*.2);g.lineTo(c[0]+r*1.15,c[1]+r*i*.3-r*.2);g.stroke()}}
 ball(g,c,r,L.skin);
 // face
 if(fy>-.15){const ex=c[0]+fx*r*.45,ey=c[1]+r*.05+fy*r*.15;g.fillStyle='rgba(25,15,8,.9)';const sp=r*.33*Math.max(.25,fy);[-1,1].forEach(s=>{if(r>25){g.fillStyle='#f4ecdc';g.beginPath();g.ellipse(ex+s*sp,ey,r*.14,r*.08,0,0,TAU);g.fill();g.fillStyle='#3a2414';g.beginPath();g.arc(ex+s*sp+fx*r*.03,ey,r*.065,0,TAU);g.fill();g.fillStyle='#000';g.beginPath();g.arc(ex+s*sp+fx*r*.03,ey,r*.03,0,TAU);g.fill();g.strokeStyle='rgba(30,15,5,.8)';g.lineWidth=r*.035;g.beginPath();g.ellipse(ex+s*sp,ey,r*.15,r*.09,0,Math.PI*1.05,Math.PI*1.95);g.stroke();g.lineWidth=r*.05;g.beginPath();g.moveTo(ex+s*sp-r*.13,ey-r*.18);g.quadraticCurveTo(ex+s*sp,ey-r*.24,ex+s*sp+r*.13,ey-r*.17);g.stroke();g.fillStyle='rgba(25,15,8,.9)'}else{g.beginPath();g.ellipse(ex+s*sp,ey,r*.09,r*.075,0,0,TAU);g.fill()}});
  if(L.civ==='eg'){g.strokeStyle='rgba(15,10,5,.9)';g.lineWidth=r*.07;[-1,1].forEach(s=>{g.beginPath();g.moveTo(ex+s*sp+s*r*.08,ey);g.lineTo(ex+s*sp+s*r*.25,ey-r*.05);g.stroke()})}
  g.fillStyle=sh(L.skin,-.25);g.beginPath();g.ellipse(ex,ey+r*.3,r*.08,r*.12,0,0,TAU);g.fill();g.strokeStyle='rgba(90,40,30,.6)';g.lineWidth=r*.07;g.beginPath();g.moveTo(ex-r*.15,ey+r*.55);g.lineTo(ex+r*.15,ey+r*.55);g.stroke();
  if(L.sex==='f'||L.age==='child'){g.fillStyle='rgba(200,90,70,.18)';[-1,1].forEach(s=>{g.beginPath();g.arc(ex+s*sp*1.3,ey+r*.3,r*.14,0,TAU);g.fill()})}}
 else if(Math.abs(fx)>.3){g.fillStyle='rgba(25,15,8,.9)';g.beginPath();g.arc(c[0]+fx*r*.7,c[1]+r*.05,r*.08,0,TAU);g.fill()}
 // hair top
 const hs=L.hairStyle,H=L.hat;
 if(hs!=='bald'&&!['wig','turban','fez','helm','boar','tall','veil','nemesStripe'].includes(H)){g.save();g.beginPath();g.arc(c[0],c[1],r*1.04,0,TAU);g.clip();g.fillStyle=L.hair;g.beginPath();g.ellipse(back[0],back[1]-r*.1,r*1.1,r*(fy>-.2?.85:1.4),0,0,TAU);g.fill();g.fillStyle='rgba(255,240,220,.18)';g.beginPath();g.ellipse(back[0]-r*.35,back[1]-r*.5,r*.4,r*.18,-.4,0,TAU);g.fill();if(r>25){g.strokeStyle=sh(L.hair,.25);g.lineWidth=r*.025;for(let q=0;q<18;q++){const a=-Math.PI+q/17*Math.PI;g.beginPath();g.moveTo(back[0]+Math.cos(a)*r*.15,back[1]-r*.5);g.quadraticCurveTo(back[0]+Math.cos(a)*r*.8,back[1]-r*.4,back[0]+Math.cos(a)*r*1.05,back[1]+Math.sin(a)*-r*.1+r*.2);g.stroke()}}g.restore();
  if(hs==='lock'){g.fillStyle=L.hair;g.beginPath();g.ellipse(c[0]+r*.9,c[1]+r*.5,r*.18,r*.5,.3,0,TAU);g.fill()}}
 if(hs==='beard'&&fy>-.3){g.fillStyle=L.hair;g.beginPath();g.ellipse(c[0]+fx*r*.4,c[1]+r*.75,r*.55,r*.55*(L.civ==='as'||L.civ==='ba'?1.6:1),0,0,Math.PI);g.fill();g.strokeStyle=sh(L.hair,.2);g.lineWidth=r*.05;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(c[0]+fx*r*.4+i*r*.18,c[1]+r*.8);g.lineTo(c[0]+fx*r*.4+i*r*.16,c[1]+r*1.15);g.stroke()}if(r>25&&(L.civ==='as'||L.civ==='ba')){for(let row=0;row<4;row++)for(let i=-2;i<=2;i++){g.strokeStyle=sh(L.hair,.3);g.lineWidth=r*.03;g.beginPath();g.arc(c[0]+fx*r*.4+i*r*.17,c[1]+r*(.85+row*.17),r*.07,0,Math.PI*1.6);g.stroke()}}}
 const cap=(col,h,brim)=>{g.fillStyle=col;g.beginPath();g.ellipse(c[0],c[1]-r*.35,r*1.05,r*.8,0,Math.PI,TAU);g.lineTo(c[0]+r*1.05,c[1]-r*.2);g.ellipse(c[0],c[1]-r*.2,r*1.05,r*.3,0,0,Math.PI);g.fill();g.strokeStyle='rgba(20,12,6,.5)';g.lineWidth=r*.06;g.stroke();if(brim){ln(g,[c[0]-r*1.05,c[1]-r*.2],[c[0]+r*1.05,c[1]-r*.2],brim,r*.18)}};
 if(H==='wig'){g.fillStyle=L.hair;g.beginPath();g.ellipse(c[0],c[1]-r*.15,r*1.2,r*1.05,0,Math.PI*1.02,TAU*.99);g.lineTo(c[0]+r*1.25,c[1]+r*1.1);g.lineTo(c[0]+r*.75,c[1]+r*1.15);g.lineTo(c[0]+r*.75,c[1]+r*.2);g.lineTo(c[0]-r*.75,c[1]+r*.2);g.lineTo(c[0]-r*.75,c[1]+r*1.15);g.lineTo(c[0]-r*1.25,c[1]+r*1.1);g.closePath();g.fill();g.strokeStyle='rgba(255,255,255,.08)';g.lineWidth=r*.06;for(let i=-4;i<=4;i++){g.beginPath();g.moveTo(c[0]+i*r*.25,c[1]-r*.9);g.lineTo(c[0]+i*r*.3,c[1]+r);g.stroke()}if(L.jewel)ln(g,[c[0]-r*1.15,c[1]-r*.35],[c[0]+r*1.15,c[1]-r*.35],'#d8a838',r*.15)}
 if(H==='nemesStripe'){cap('#e0c060',0,'#2f5f98')}
 if(H==='cap')cap(sh(L.cloth,-.1),0,L.trim);
 if(H==='band'){ln(g,[c[0]-r,c[1]-r*.25],[c[0]+r,c[1]-r*.25],L.trim,r*.2);if(L.cls==='noble'||L.cls==='priest')ball(g,[c[0]+fx*r*.6,c[1]-r*.25],r*.18,'#d8a838',{rim:0})}
 if(H==='turban'){for(let i=0;i<3;i++){g.fillStyle=i%2?sh(L.trim,-.1):L.trim;g.beginPath();g.ellipse(c[0],c[1]-r*(.3+i*.25),r*(1.12-i*.18),r*(.45-i*.05),0,0,TAU);g.fill();g.strokeStyle='rgba(20,12,6,.4)';g.lineWidth=r*.05;g.stroke()}}
 if(H==='fez'){g.fillStyle=sh(L.trim,-.1);g.beginPath();g.moveTo(c[0]-r*.85,c[1]-r*.3);g.lineTo(c[0]-r*.7,c[1]-r*1.3);g.ellipse(c[0],c[1]-r*1.3,r*.7,r*.25,0,Math.PI,TAU);g.lineTo(c[0]+r*.85,c[1]-r*.3);g.closePath();g.fill();g.strokeStyle='rgba(20,12,6,.5)';g.stroke();ln(g,[c[0]-r*.85,c[1]-r*.35],[c[0]+r*.85,c[1]-r*.35],'#d8a838',r*.15)}
 if(H==='tall'){const tc=L.civ==='hi'?'#c8b07a':'#efe8d6';g.fillStyle=tc;g.beginPath();g.moveTo(c[0]-r*.85,c[1]-r*.35);g.quadraticCurveTo(c[0]-r*.6,c[1]-r*2.2,c[0]+r*.15,c[1]-r*2.6);g.quadraticCurveTo(c[0]+r*.7,c[1]-r*1.8,c[0]+r*.85,c[1]-r*.35);g.closePath();g.fill();g.strokeStyle='rgba(20,12,6,.5)';g.lineWidth=r*.06;g.stroke();for(let i=1;i<4;i++)ln(g,[c[0]-r*(.8-i*.12),c[1]-r*(.35+i*.45)],[c[0]+r*(.8-i*.15),c[1]-r*(.35+i*.45)],sh(tc,-.2),r*.06)}
 if(H==='helm'){const hc=L.civ==='ba'?'#b07a3a':'#a07840';g.fillStyle=hc;g.beginPath();g.ellipse(c[0],c[1]-r*.2,r*1.12,r*1.05,0,Math.PI*.95,TAU*1.02);g.closePath();g.fill();const gr=g.createRadialGradient(c[0]-r*.4,c[1]-r*.8,1,c[0],c[1]-r*.2,r*1.2);gr.addColorStop(0,'rgba(255,240,190,.6)');gr.addColorStop(1,'rgba(0,0,0,.25)');g.fillStyle=gr;g.fill();g.strokeStyle='rgba(20,12,6,.6)';g.lineWidth=r*.07;g.stroke();if(L.civ==='hi'){ln(g,[c[0],c[1]-r*1.2],[c[0]-fx*r*.4,c[1]-r*1.9],'#b03a2a',r*.25)}}
 if(H==='cone'){g.fillStyle='#a8865a';g.beginPath();g.moveTo(c[0]-r*1.1,c[1]-r*.15);g.quadraticCurveTo(c[0]-r*.8,c[1]-r*1.6,c[0],c[1]-r*2.3);g.quadraticCurveTo(c[0]+r*.8,c[1]-r*1.6,c[0]+r*1.1,c[1]-r*.15);g.closePath();const cg=g.createLinearGradient(c[0]-r,0,c[0]+r,0);cg.addColorStop(0,'#e8c890');cg.addColorStop(.4,'#b08a50');cg.addColorStop(1,'#5a4020');g.fillStyle=cg;g.fill();g.strokeStyle='rgba(20,12,6,.6)';g.lineWidth=r*.07;g.stroke();ln(g,[c[0]-r*1.1,c[1]-r*.2],[c[0]+r*1.1,c[1]-r*.2],'#6a4a20',r*.14);if(L.civ==='mt')ln(g,[c[0],c[1]-r*2.2],[c[0]-r*.5,c[1]-r*2.7],'#c83a2a',r*.15)}
 if(H==='boar'){g.fillStyle='#e8dcc0';g.beginPath();g.ellipse(c[0],c[1]-r*.25,r*1.12,r*1.05,0,Math.PI*.95,TAU*1.02);g.closePath();g.fill();g.strokeStyle='#8a7a60';g.lineWidth=r*.05;for(let i=0;i<4;i++){g.beginPath();g.ellipse(c[0],c[1]-r*.25,r*1.1,r*(.2+i*.22),0,Math.PI,TAU);g.stroke()}}
 if(H==='veil'){g.fillStyle=sh(L.cloth,.05);g.globalAlpha=.95;g.beginPath();g.ellipse(c[0],c[1]-r*.1,r*1.2,r*1.15,0,Math.PI*.9,TAU*1.05);g.lineTo(c[0]+r*1.3,c[1]+r*1.5);g.lineTo(c[0]-r*1.3,c[1]+r*1.5);g.closePath();g.fill();g.globalAlpha=1;g.strokeStyle='rgba(20,12,6,.35)';g.lineWidth=r*.05;g.stroke();ln(g,[c[0]-r*1.15,c[1]-r*.3],[c[0]+r*1.15,c[1]-r*.3],L.trim,r*.12)}
 if(fy<=-.2)hairBack();
}
function drawTool(g,t,W,k){const pr=v=>P(v,ORG);const a=pr(W.rot(t.a)),b=pr(W.rot(t.b||t.a));const T=t.k;
 if(T==='bow'){const m=pr(W.rot(t.a)),u=pr(W.rot(t.b)),d=pr(W.rot(t.c)),s=pr(W.rot(t.s));g.strokeStyle='#5a3418';g.lineWidth=k*.04;g.lineCap='round';g.beginPath();g.moveTo(u[0],u[1]);g.quadraticCurveTo(m[0]*2-(u[0]+d[0])/2+(m[0]-s[0])*.3,m[1]*2-(u[1]+d[1])/2+(m[1]-s[1])*.3,d[0],d[1]);g.stroke();g.strokeStyle='rgba(240,230,200,.9)';g.lineWidth=k*.01;g.beginPath();g.moveTo(u[0],u[1]);g.lineTo(s[0],s[1]);g.lineTo(d[0],d[1]);g.stroke();if(t.arrow){const ah=pr(W.rot(t.arrow));ln(g,s,ah,'#8a6a3a',k*.018);ball(g,ah,k*.022,'#c08a4a',{rim:0})}return}
 if(T==='shield'){const c=pr(W.rot(t.a));const r=k*.24;g.save();g.translate(c[0],c[1]);g.scale(1,t.sq||.9);const gr=g.createRadialGradient(-r*.3,-r*.3,1,0,0,r);gr.addColorStop(0,'#d8a868');gr.addColorStop(1,'#6a4220');g.fillStyle=gr;g.beginPath();if(t.shape==='8'){g.ellipse(0,-r*.45,r*.7,r*.55,0,0,TAU);g.ellipse(0,r*.45,r*.7,r*.55,0,0,TAU)}else g.ellipse(0,0,r*.75,r,0,0,TAU);g.fill();g.strokeStyle='#3a2410';g.lineWidth=k*.025;g.stroke();g.fillStyle='#e8dcc0';for(let i=0;i<6;i++){g.beginPath();g.arc(Math.cos(i)*r*.4,Math.sin(i*1.7)*r*.6,r*.1,0,TAU);g.fill()}ball(g,[0,0],r*.16,'#c89a48');g.restore();return}
 ln(g,a,b,'#3a2410',k*.05);ln(g,a,b,'#8a5a30',k*.032);
 const dir=[b[0]-a[0],b[1]-a[1]],dl=Math.hypot(dir[0],dir[1])||1,u=[dir[0]/dl,dir[1]/dl],n=[-u[1],u[0]];
 if(k>220&&T!=='tongs'){for(let q=0;q<5;q++){const px=b[0]-u[0]*k*(.05+q*.015),py=b[1]-u[1]*k*(.05+q*.015);ln(g,[px-n[0]*k*.022,py-n[1]*k*.022],[px+n[0]*k*.022,py+n[1]*k*.022],'#c8b080',k*.007)}for(let q=0;q<6;q++){const px=a[0]+u[0]*k*(.03+q*.02),py=a[1]+u[1]*k*(.03+q*.02);ln(g,[px-n[0]*k*.018,py-n[1]*k*.018],[px+n[0]*k*.018,py+n[1]*k*.018],'#5a3a1a',k*.006)}}
 if(T==='axe'){poly(g,[[b[0]-u[0]*k*.04,b[1]-u[1]*k*.04],[b[0]+n[0]*k*.16-u[0]*k*.1,b[1]+n[1]*k*.16-u[1]*k*.1],[b[0]+n[0]*k*.18+u[0]*k*.06,b[1]+n[1]*k*.18+u[1]*k*.06],[b[0]+u[0]*k*.03,b[1]+u[1]*k*.03]],'#c48a48','#3a2410',k*.015)}
 if(T==='pick'){ln(g,[b[0]-n[0]*k*.2,b[1]-n[1]*k*.2],[b[0]+n[0]*k*.2,b[1]+n[1]*k*.2],'#3a2a1a',k*.06);ln(g,[b[0]-n[0]*k*.19,b[1]-n[1]*k*.19],[b[0]+n[0]*k*.19,b[1]+n[1]*k*.19],'#a8784a',k*.035)}
 if(T==='hammer'){capsule(g,[b[0]-n[0]*k*.07,b[1]-n[1]*k*.07],[b[0]+n[0]*k*.07,b[1]+n[1]*k*.07],k*.045,k*.045,'#7a6a5a')}
 if(T==='hoe'){poly(g,[[b[0],b[1]],[b[0]+n[0]*k*.03+u[0]*k*.03,b[1]+n[1]*k*.03+u[1]*k*.03],[b[0]+n[0]*k*.03-u[0]*k*.14,b[1]+n[1]*k*.03-u[1]*k*.14]],'#b07a40','#3a2410',k*.03)}
 if(T==='spear'){poly(g,[[b[0]+u[0]*k*.2,b[1]+u[1]*k*.2],[b[0]+n[0]*k*.04,b[1]+n[1]*k*.04],[b[0]-n[0]*k*.04,b[1]-n[1]*k*.04]],'#d0a060','#3a2410',k*.012)}
 if(T==='sword'){ln(g,a,b,'#3a2410',k*.05);g.strokeStyle='#c8a060';g.lineWidth=k*.035;g.beginPath();g.moveTo(b[0],b[1]);g.quadraticCurveTo(b[0]+u[0]*k*.2,b[1]+u[1]*k*.2,b[0]+u[0]*k*.25+n[0]*k*.12,b[1]+u[1]*k*.25+n[1]*k*.12);g.stroke()}
 if(T==='tongs'){ln(g,a,b,'#3a3a3a',k*.02)}
}
// ======================= animations (p in [0,1)) =======================
const S_=Math.sin,C_=Math.cos;
function gait(p,amp,lift,bob){const t=p*TAU,z=base();z.fL=[-.11,amp*S_(t),lift*Math.max(0,C_(t))];z.fR=[.11,-amp*S_(t),lift*Math.max(0,-C_(t))];z.hip=[.012*S_(t),0,.9-bob*Math.abs(C_(t))+bob*.5];z.twist=.08*S_(t)*amp/.22;return z}
const AN={
 idle:p=>{const z=base(),t=p*TAU;z.breath=S_(t*2);z.hip=[.035*S_(t),0,.92-.004*S_(t*2)];z.fR=[.15,.04,0];z.fL=[-.1,-.02,0];z.head=.35*S_(t);z.roll=-.03*S_(t);return z},
 walk:p=>{const z=gait(p,.24,.1,.03),t=p*TAU;z.hL=[-.26,-.17*S_(t)+.02,.64];z.hR=[.26,.17*S_(t)+.02,.64];z.vel=1;z.lean=.04;return z},
 run:p=>{const z=gait(p,.42,.24,.07),t=p*TAU;z.lean=.22;z.hip[2]=.88+.04*Math.abs(S_(t));z.hL=[-.24,-.3*S_(t)+.12,.98+.1*S_(t)];z.hR=[.24,.3*S_(t)+.12,.98-.1*S_(t)];z.elL=[-.3,-1,0];z.elR=[.3,-1,0];z.vel=2;return z},
 carry:p=>{const z=gait(p,.18,.07,.035);z.lean=.06;z.hL=[-.1,.2,1.68];z.hR=[.12,.2,1.66];z.elL=[-1,0,.2];z.elR=[1,0,.2];z.vel=.8;z.held=[{at:[0,.12,1.72],d:.2,fn:(g,c,k)=>{drawJar(g,c,k)}}];z.breath=1;return z},
 chop:p=>{const z=base();const th=swing(p,[[0,1.95],[.5,-.75,'io'],[.62,2.05,'in'],[.75,1.95],[1,1.95]]);const m_=Math.max(0,th-1);const C=[.06,.2+.15*m_,1.2-.5*m_];const d=nrm([.12,S_(th),C_(th)]);z.tool={k:'axe',a:sub(C,mul(d,.2)),b:add(C,mul(d,.6))};z.hR=C;z.hL=sub(C,mul(d,.17));z.lean=swing(p,[[0,.25],[.5,-.08],[.62,.32],[1,.25]]);z.fL=[-.16,.12,0];z.fR=[.16,-.12,0];z.hip=[0,0,.86];z.twist=swing(p,[[0,0],[.5,.25],[.62,-.05],[1,0]]);z.elL=[-.6,-.3,-.6];z.elR=[.7,-.2,-.5];return z},
 mine:p=>{const z=AN.chop(p);z.tool.k='pick';z.lean+=.12;z.hip[2]=.8;z.fL=[-.2,.18,0];z.fR=[.2,-.18,0];return z},
 hammer:p=>{const z=base();const th=swing(p,[[0,1.6],[.45,.1,'io'],[.58,1.75,'in'],[.7,1.55],[1,1.6]]);const C=[.2,.32,1.08];const d=nrm([0,S_(th),C_(th)]);z.tool={k:'hammer',a:sub(C,mul(d,.05)),b:add(C,mul(d,.3))};z.hR=C;z.hL=[-.12,.48,.86];z.held=[{at:[-.06,.56,.82],d:.1,fn:(g,c,k)=>{ln(g,[c[0]-k*.1,c[1]+k*.05],c,'#3a3a3a',k*.02);ball(g,c,k*.03,'#ff8a30',{ol:0,rim:0})}}];z.lean=.18;z.fL=[-.15,.06,0];z.fR=[.16,-.1,0];z.elR=[1,-.2,0];z.breath=S_(p*TAU);return z},
 hoe:p=>{const z=base();const th=swing(p,[[0,.6],[.35,.0,'io'],[.5,2.5,'in'],[.8,2.25],[1,.6]]);const C=[.04,.22+swing(p,[[0,.05],[.5,.15],[.8,-.05],[1,.05]]),1.05];const d=nrm([0,S_(th),C_(th)]);z.tool={k:'hoe',a:sub(C,mul(d,.25)),b:add(C,mul(d,.6))};z.hR=C;z.hL=sub(C,mul(d,.2));z.lean=.3;z.hip=[0,-.05,.86];z.fL=[-.14,.1,0];z.fR=[.14,-.15,0];return z},
 sleep:p=>{const z=base();z.pitch=-1.52;z.pivot=[0,0,0];z.hip=[0,0,.92];z.breath=S_(p*TAU);z.fL=[-.1,0,0];z.fR=[.12,.02,0];z.hL=[-.24,.12,.7];z.hR=[.08,.1,1.2];z.head=.6;z.noShadow=1;z.lift=.1;return z},
 sit:p=>{const z=base(),t=p*TAU;z.hip=[0,0,.2];z.fL=[.16,.3,0];z.fR=[-.16,.34,0];z.kpL=[-1,.4,.5];z.kpR=[1,.4,.5];z.lean=.08;const bite=swing(p,[[0,0],[.25,1,'io'],[.4,1],[.6,0,'io'],[1,0]]);z.hR=lerp3([.16,.32,.5],[.05,.16,.86],bite);z.hL=[-.1,.32,.46];z.elR=[.8,-.3,-.3];z.elL=[-.8,-.2,-.4];z.held=[{at:[-.04,.36,.44],d:.15,fn:(g,c,k)=>drawBowl(g,c,k)}];z.head=0;z.breath=S_(t);return z},
 pray:p=>{const z=base(),t=p*TAU;const bow=swing(p,[[0,0],[.3,0],[.55,1,'io'],[.75,1],[1,0,'io']]);z.hip=[0,-.08,.52-.05*bow];z.fL=[-.13,-.42,0];z.fR=[.13,-.42,0];z.knee=1;z.lean=lerp(.05,1.15,bow);z.hL=lerp3([-.2,.25,1.85],[-.2,.62,.12],bow);z.hR=lerp3([.2,.25,1.85],[.2,.62,.12],bow);z.elL=[-1,0,0];z.elR=[1,0,0];z.breath=S_(t);return z},
 spear:p=>{const z=base();const th=swing(p,[[0,0],[.3,-.25,'io'],[.45,.55,'in'],[.6,.55],[1,0,'io']]);z.hip=[0,th*.2,.84];z.fL=[-.14,.35,0];z.fR=[.16,-.3,0];z.lean=.1+th*.25;const g=[.12,.15+th*.55,1.18];z.tool={k:'spear',a:sub(g,[0,.7,.08]),b:add(g,[0,.95,.04])};z.hR=sub(g,[0,.32,.04]);z.hL=add(g,[-.05,.15,0]);z.elR=[.8,-.5,-.3];z.elL=[-.8,0,-.4];z.twist=-.2+th*.25;z.held=[{at:[-.3,.15,1.2],d:-.02,fn:()=>0}];return z},
 bow:p=>{const z=base();const dr=swing(p,[[0,.1],[.15,.1],[.6,1,'io'],[.72,1],[.74,.05,'in'],[1,.1]]);z.twist=-1.1;z.fL=[-.08,.22,0];z.fR=[.12,-.2,0];z.hip=[0,0,.9];z.breath=S_(p*TAU);const bowH=[-.04,.66,1.4];z.hL=bowH;const str=[.0,lerp(.56,.02,dr),1.43];z.hR=str;z.elR=[1,-.4,.4];z.head=-.9;
  z.tool={k:'bow',a:bowH,b:add(bowH,[0,-.08*dr,.44]),c:add(bowH,[0,-.08*dr,-.44]),s:[str[0],str[1],str[2]],arrow:dr>.08?[str[0],str[1]+.72,str[2]]:null,d:.05};return z},
 block:p=>{const z=base();const hit=swing(p,[[0,0],[.4,0],[.46,1,'in'],[.7,.1,'out'],[1,0]]);z.hip=[0,-hit*.08,.84];z.lean=.12-hit*.15;z.fL=[-.16,.22,0];z.fR=[.16,-.22,0];z.hL=[-.12,.38-hit*.06,1.22];z.elL=[-1,-.3,0];z.hR=[.3,-.05,1.15];z.elR=[1,-.2,-.6];z.tool={k:'shield',a:[-.04,.46-hit*.06,1.2],d:.2,shape:'8'};z.held=[{at:[.3,-.05,1.15],d:.01,fn:(g,c,k)=>{ln(g,c,[c[0]+k*.08,c[1]-k*.4],'#c8a060',k*.035)}}];return z},
 death:p=>{const z=base();const f1=swing(p,[[0,0],[.12,.3,'out'],[.5,1,'in'],[.55,.97],[.6,1],[1,1]]);z.hip=[0,.05*f1,.92-.3*Math.min(1,f1*1.6)];z.fL=[-.12,-.1*f1,0];z.fR=[.12,.1*f1,0];z.pitch=f1*1.5;z.pivot=[0,0,.1];z.hL=[-.3-.15*f1,.25*f1,.62+.4*f1];z.hR=[.3+.2*f1,.1,.62+.6*f1];z.lean=.2*f1;z.lift=.2*f1;return z},
};
const ANIMS=Object.keys(AN);
// props
function drawJar(g,c,k){const r=k*.11;blob(g,c[0],c[1]+r*.2,r,r*.6,.2,2);ball(g,[c[0],c[1]-r*.3],r,'#b8683a');g.fillStyle='#3a2414';g.beginPath();g.ellipse(c[0],c[1]-r*1.05,r*.45,r*.22,0,0,TAU);g.fill();ln(g,[c[0]-r*.9,c[1]-r*.2],[c[0]+r*.9,c[1]-r*.2],'#2a1a10',r*.12)}
function drawBowl(g,c,k){const r=k*.08;g.fillStyle='#9a5a30';g.beginPath();g.ellipse(c[0],c[1],r,r*.55,0,0,TAU);g.fill();g.fillStyle='#e0c070';g.beginPath();g.ellipse(c[0],c[1]-r*.1,r*.75,r*.35,0,0,TAU);g.fill()}
function propBefore(g,name,o,f,k,p){const pr=v=>P(L2W(v,f,[0,0,0]),o);
 if(name==='chop'){const c=pr([.1,.56,0]);blob(g,c[0],c[1]+k*.03,k*.2,k*.09,.35,3);capsule(g,[c[0]-k*.18,c[1]],[c[0]+k*.18,c[1]],k*.09,k*.09,'#7a5030');g.fillStyle='#d8b07a';g.beginPath();g.ellipse(c[0]+k*.18,c[1],k*.06,k*.085,0,0,TAU);g.fill();g.strokeStyle='#a87a4a';g.beginPath();g.arc(c[0]+k*.18,c[1],k*.035,0,TAU);g.stroke();if(p>.6&&p<.8){for(let i=0;i<5;i++){ball(g,[c[0]+R(-1,1)*k*.25,c[1]-k*.08-R(0,1)*k*.25*(p-.6)*5],k*.02,'#e8c890',{ol:0,rim:0})}}}
 if(name==='mine'){const c=pr([.04,.8,0]);blob(g,c[0],c[1]+k*.05,k*.3,k*.14,.4,4);poly(g,[[c[0]-k*.3,c[1]+k*.05],[c[0]-k*.2,c[1]-k*.2],[c[0]+k*.05,c[1]-k*.28],[c[0]+k*.28,c[1]-k*.1],[c[0]+k*.3,c[1]+k*.06]],'#8a8478','#3a342c',k*.02);poly(g,[[c[0]-k*.2,c[1]-k*.2],[c[0]+k*.05,c[1]-k*.28],[c[0]+k*.1,c[1]-k*.05],[c[0]-k*.1,c[1]-k*.02]],'#a8a296');g.fillStyle='#3a8a6a';g.beginPath();g.arc(c[0]+k*.12,c[1]-k*.12,k*.03,0,TAU);g.arc(c[0]-k*.08,c[1]-k*.06,k*.025,0,TAU);g.fill();if(p>.62&&p<.85)for(let i=0;i<6;i++){g.fillStyle='rgba(255,220,140,'+(1-(p-.62)*4)+')';g.fillRect(c[0]+R(-1,1)*k*.2,c[1]-k*.2-R(0,1)*k*.2,2,2)}}
 if(name==='hammer'){const c=pr([0,.52,0]);blob(g,c[0],c[1]+k*.04,k*.22,k*.1,.4,3);capsule(g,[c[0],c[1]],[c[0],c[1]-k*.35],k*.1,k*.09,'#6a4a2a');poly(g,[[c[0]-k*.2,c[1]-k*.42],[c[0]+k*.24,c[1]-k*.42],[c[0]+k*.12,c[1]-k*.34],[c[0]-k*.12,c[1]-k*.34]],'#4a4a50','#1a1a1e',k*.015);poly(g,[[c[0]-k*.2,c[1]-k*.48],[c[0]+k*.24,c[1]-k*.48],[c[0]+k*.24,c[1]-k*.42],[c[0]-k*.2,c[1]-k*.42]],'#6a6a72');if(p>.56&&p<.7)for(let i=0;i<10;i++){g.fillStyle='rgba(255,'+(160+i*8)+',60,.9)';g.fillRect(c[0]+R(-1,1)*k*.3,c[1]-k*.5-R(0,1)*k*.25,2,2)}}
 if(name==='hoe'){const c=pr([0,.75,0]);for(let i=-2;i<=2;i++){g.fillStyle=i%2?'#6a4a2c':'#7a5634';g.beginPath();g.ellipse(c[0]+i*k*.06,c[1]+i*k*.12,k*.5,k*.05,0,0,TAU);g.fill()}for(let i=0;i<4;i++){ln(g,[c[0]-k*.3+i*k*.2,c[1]-k*.25],[c[0]-k*.32+i*k*.2,c[1]-k*.35],'#5a8a3a',k*.02)}}
 if(name==='sleep'){const c=pr([0,-.1,0]);drawBed(g,c,k,f)}
 if(name==='sit'){const c=pr([0,.08,0]);blob(g,c[0],c[1]+k*.03,k*.36,k*.16,.35,4);g.fillStyle='#8a3a2a';g.beginPath();g.ellipse(c[0],c[1],k*.34,k*.2,0,0,TAU);g.fill();g.strokeStyle='#d8a838';g.lineWidth=k*.02;g.beginPath();g.ellipse(c[0],c[1],k*.28,k*.15,0,0,TAU);g.stroke();for(let i=0;i<4;i++){const a=i/4*TAU+.8;ball(g,[c[0]+Math.cos(a)*k*.34,c[1]+Math.sin(a)*k*.2],k*.03,'#d8a838',{ol:0,rim:0})}}
 if(name==='pray'){const c=pr([0,.85,0]);blob(g,c[0],c[1],k*.15,k*.07,.4,2);capsule(g,[c[0],c[1]],[c[0],c[1]-k*.3],k*.08,k*.07,'#b0a090');ball(g,[c[0],c[1]-k*.36],k*.08,'#c8b8a0');for(let i=0;i<3;i++){g.fillStyle='rgba(220,210,200,'+(.3-i*.08)+')';g.beginPath();g.arc(c[0]+S_(p*TAU+i)*k*.05,c[1]-k*(.5+i*.15+p*.1),k*(.05+i*.02),0,TAU);g.fill()}}
}
function drawBed(g,c,k,f){blob(g,c[0],c[1]+k*.05,k*.5,k*.4,.35,4);const w=k*.36,h=k*1.0;g.save();g.translate(c[0],c[1]+k*.25);g.fillStyle='#6a4426';g.fillRect(-w,-h,2*w,h*1.15);g.fillStyle='#8a5a32';g.fillRect(-w+3,-h+3,2*w-6,h*1.15-6);g.fillStyle='#d8c8a0';g.fillRect(-w+5,-h+5,2*w-10,h*1.15-10);g.fillStyle='#e8dcc0';g.beginPath();g.ellipse(0,-h*.82,w*.6,k*.08,0,0,TAU);g.fill();g.restore()}
function drawBlanket(g,c,k,b){const w=k*.34,h=k*.66;g.save();g.translate(c[0],c[1]+k*.25);const gr=g.createLinearGradient(-w,0,w,0);gr.addColorStop(0,'#a83a2a');gr.addColorStop(1,'#6a2018');g.fillStyle=gr;g.beginPath();g.moveTo(-w,-h*.95+b);g.quadraticCurveTo(0,-h*1.05+b*2,w,-h*.95+b);g.lineTo(w,k*.12);g.lineTo(-w,k*.12);g.closePath();g.fill();g.strokeStyle='#e0c070';g.lineWidth=2;for(let i=1;i<4;i++){g.beginPath();g.moveTo(-w,-h*.95+i*h*.28);g.lineTo(w,-h*.95+i*h*.28);g.stroke()}g.restore()}
function actor(g,L,name,f,o,p,opts){opts=opts||{};SEED=(Math.floor(p*40)+3)|0;const k=SC*L.h;
 if(name==='sleep'){if(!opts.noProp)drawBed(g,P(L2W([0,-.55,0],f,[0,0,0]),o),k,f);const z=AN.sleep(p);drawPerson(g,L,z,f,o,p);drawBlanket(g,P(L2W([0,-.55,0],f,[0,0,0]),o),k,S_(p*TAU)*1.5);return}
 if(!opts.noProp)propBefore(g,name,o,f,k,p);
 drawPerson(g,L,AN[name](p),f,o,p)}
let ORG=[0,0];

function hull(p){p=p.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo=[],up=[];for(const q of p){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q)}for(const q of p.reverse()){while(up.length>1&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q)}return lo.slice(0,-1).concat(up.slice(0,-1))}
