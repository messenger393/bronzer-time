// ======================= terrain =======================
function vnoise(w,h,sc,seed){SEED=seed;const gw=Math.round(w/sc),gh=Math.round(h/sc),G=new Float32Array(gw*gh).map(()=>rnd());const out=new Float32Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const fx=x/sc,fy=y/sc,ix=Math.floor(fx),iy=Math.floor(fy),tx=fx-ix,ty=fy-iy,sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty);const X1=(ix+1)%gw,Y1=(iy+1)%gh,X0=ix%gw,Y0=iy%gh;const a=G[Y0*gw+X0],b=G[Y0*gw+X1],c=G[Y1*gw+X0],d=G[Y1*gw+X1];out[y*w+x]=lerp(lerp(a,b,sx),lerp(c,d,sx),sy)}return out}
function fbm(w,h,seed,scs){const o=new Float32Array(w*h);let tot=0;scs.forEach((s,i)=>{const n=vnoise(w,h,s,seed+i*17),a=1/(i+1);tot+=a;for(let j=0;j<o.length;j++)o[j]+=n[j]*a});for(let j=0;j<o.length;j++)o[j]/=tot;return o}
const TEX={};
const PAL={grass:['#4f6a2a','#6c8a36','#8aa046'],dirt:['#6e5236','#8a6a46','#a2855a'],sand:['#c2a06a','#d8bc84','#e8d2a0'],stone:['#77736a','#938e82','#aca698'],floor:['#7a5e40','#8e7050','#a08460'],plank:['#6a4628','#86603a','#9a7448'],mud:['#5a4a36','#6e5a42','#7e6a4e']};
function texCanvas(kind){if(TEX[kind])return TEX[kind];const S=256,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d'),id=g.createImageData(S,S),pal=PAL[kind].map(hx);
 const n=fbm(S,S,kind.length*31,[64,32,8,4]);
 for(let i=0;i<S*S;i++){let v=n[i];if(kind==='sand'){const y=Math.floor(i/S),x=i%S;v=v*.7+.3*(.5+.5*Math.sin((y+n[i]*60)*TAU*16/256))}const t=clamp((v-.3)*2.2,0,1),a=t<.5?pal[0]:pal[1],b=t<.5?pal[1]:pal[2],u=t<.5?t*2:(t-.5)*2;const j=(rnd()-.5)*14;for(let k=0;k<3;k++)id.data[i*4+k]=clamp(a[k]+(b[k]-a[k])*u+j,0,255);id.data[i*4+3]=255}
 g.putImageData(id,0,0);SEED=kind.length*7+1;
 // tile-safe details: draw each detail with wrap
 const W=(fn)=>{for(const dx of[-S,0,S])for(const dy of[-S,0,S]){g.save();g.translate(dx,dy);fn();g.restore()}};
 if(kind==='grass'){const bl=[];for(let i=0;i<1400;i++)bl.push([rnd()*S,rnd()*S,R(-.5,.5),R(3,7),rnd()]);W(()=>bl.forEach(b=>{g.strokeStyle=b[4]<.5?'rgba(150,180,80,.5)':'rgba(40,60,20,.45)';g.lineWidth=1;g.beginPath();g.moveTo(b[0],b[1]);g.lineTo(b[0]+b[2]*b[3],b[1]-b[3]);g.stroke()}));const fl=[];for(let i=0;i<14;i++)fl.push([rnd()*S,rnd()*S,pick(['#e8d860','#f0f0e0','#c86a8a'])]);W(()=>fl.forEach(f=>{g.fillStyle=f[2];g.fillRect(f[0],f[1],2,2)}))}
 if(kind==='dirt'||kind==='mud'){const pb=[];for(let i=0;i<160;i++)pb.push([rnd()*S,rnd()*S,R(1,3),rnd()]);W(()=>pb.forEach(p=>{g.fillStyle='rgba(30,20,10,.35)';g.beginPath();g.ellipse(p[0]+.7,p[1]+.8,p[2],p[2]*.7,0,0,TAU);g.fill();g.fillStyle=p[3]<.5?'#a89070':'#8a7458';g.beginPath();g.ellipse(p[0],p[1],p[2],p[2]*.7,0,0,TAU);g.fill()}))}
 if(kind==='stone'){const n2=vnoise(S,S,32,99);// flagstones via voronoi
  const pts=[];for(let i=0;i<22;i++)pts.push([rnd()*S,rnd()*S]);const id2=g.getImageData(0,0,S,S);for(let y=0;y<S;y++)for(let x=0;x<S;x++){let d1=1e9,d2=1e9,bi=0;for(let q=0;q<pts.length;q++)for(const ox of[-S,0,S])for(const oy of[-S,0,S]){const d=Math.hypot(x-pts[q][0]-ox,y-pts[q][1]-oy);if(d<d1){d2=d1;d1=d;bi=q}else if(d<d2)d2=d}const e=d2-d1,i=(y*S+x)*4,sh_=e<2?.45:e<4?.8:1+(((bi*37)%10)-5)/60;for(let k=0;k<3;k++)id2.data[i+k]=clamp(id2.data[i+k]*sh_+(e>=2&&e<3.5?18:0),0,255)}g.putImageData(id2,0,0)}
 if(kind==='plank'){for(let y=0;y<S;y+=16){g.fillStyle='rgba(30,15,5,.6)';g.fillRect(0,y,S,1.5);g.fillStyle='rgba(255,220,170,.12)';g.fillRect(0,y+2,S,1);const o=(y*7)%S;g.fillStyle='rgba(30,15,5,.5)';g.fillRect(o,y,1.5,16);g.fillRect((o+128)%S,y,1.5,16)}}
 if(kind==='floor'){g.strokeStyle='rgba(60,40,20,.25)';for(let i=0;i<40;i++){g.beginPath();g.arc(rnd()*S,rnd()*S,R(4,20),0,R(1,3));g.stroke()}}
 TEX[kind]=c;return c}
function terrainFill(g,x,y,w,h,kind){const p=g.createPattern(texCanvas(kind),'repeat');g.save();g.fillStyle=p;g.translate(x,y);g.fillRect(0,0,w,h);g.restore()}
// blend B over A with soft noisy mask (no hard squares)
function terrainBlend(g,x,y,w,h,kA,kB,maskFn){terrainFill(g,x,y,w,h,kA);const c=document.createElement('canvas');c.width=w;c.height=h;const cg=c.getContext('2d');terrainFill(cg,0,0,w,h,kB);const m=cg.getImageData(0,0,w,h),n=fbm(w,h,5,[w/Math.round(w/48),w/Math.round(w/12),4].map(v=>v));for(let j=0;j<h;j++)for(let i=0;i<w;i++){const v=maskFn(i/w,j/h)+(n[j*w+i]-.5)*.55;m.data[(j*w+i)*4+3]=clamp((v-.45)*6,0,1)*255}cg.putImageData(m,0,0);g.drawImage(c,x,y)}
// ======================= trees =======================
const TREES=['date palm','olive','cedar','oak','tamarisk','fig','sycamore fig','cypress'];
const SEAS={spring:{k:.12,bl:1},summer:{k:0},autumn:{k:-.05,au:1},winter:{k:-.15,bare:1}};
const DECID={oak:1,fig:1};
function leafBall(g,x,y,r,col,dots){const gr=g.createRadialGradient(x-r*.35,y-r*.45,r*.1,x,y,r);gr.addColorStop(0,sh(col,.3));gr.addColorStop(.55,col);gr.addColorStop(1,sh(col,-.4));g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();if(dots){for(let i=0;i<dots;i++){const a=rnd()*TAU,d=Math.sqrt(rnd())*r*.9;g.fillStyle=rnd()<.5?'rgba(255,255,200,.16)':'rgba(10,25,5,.2)';g.beginPath();g.arc(x+Math.cos(a)*d,y+Math.sin(a)*d,r*R(.06,.13),0,TAU);g.fill()}}}
function trunk(g,x,y,h,w0,w1,col,bend){const top=[x+bend,y-h];capsule(g,[x,y],top,w0,w1,col,{rim:1});g.strokeStyle='rgba(30,20,10,.25)';g.lineWidth=1;for(let i=0;i<6;i++){const t=rnd();g.beginPath();g.moveTo(x+bend*t+R(-w0*.5,w0*.5),y-h*t);g.lineTo(x+bend*(t+.08)+R(-w0*.5,w0*.5),y-h*(t+.08));g.stroke()}return top}
function tree(g,sp,x,y,s,t,season,state){SEED=Math.floor(x*13+y*7)+3;const S=SEAS[season]||SEAS.summer,wind=Math.sin(t*TAU+x*.01)*s*.04,bare=S.bare&&DECID[sp],k=s;
 // shadow (soft, offset by sun)
 const shR={'date palm':.55,cypress:.25,cedar:.75,'sycamore fig':.85}[sp]||.6;
 if(state==='stump'){blob(g,x+4,y+3,k*.16,k*.08,.35,3);capsule(g,[x,y],[x,y-k*.1],k*.11,k*.11,'#6a4a2c');g.fillStyle='#d8b07a';g.beginPath();g.ellipse(x,y-k*.1,k*.11,k*.06,0,0,TAU);g.fill();g.strokeStyle='#a8784a';for(let i=1;i<4;i++){g.beginPath();g.ellipse(x,y-k*.1,k*.03*i,k*.017*i,0,0,TAU);g.stroke()}for(let i=0;i<5;i++)ball(g,[x+R(-1,1)*k*.3,y+R(-.3,.4)*k*.2],k*.015,'#c8a070',{ol:0,rim:0});return}
 if(state==='felled'){blob(g,x+6,y+4,k*.55,k*.1,.35,3);capsule(g,[x-k*.5,y],[x+k*.45,y-k*.05],k*.1,k*.075,sp==='olive'?'#7a7060':'#6a4a2c');g.fillStyle='#d8b07a';g.beginPath();g.ellipse(x-k*.5,y,k*.05,k*.1,0,0,TAU);g.fill();g.strokeStyle='#a8784a';g.beginPath();g.ellipse(x-k*.5,y,k*.025,k*.05,0,0,TAU);g.stroke();for(let i=0;i<4;i++){const bx=x-k*.2+i*k*.18;ln(g,[bx,y-k*.04],[bx+k*.1,y-k*.18-rnd()*k*.1],'#5a3c22',k*.025);leafBall(g,bx+k*.12,y-k*.22,k*.08,'#5f7a2e',6)}return}
 if(state==='sapling'){blob(g,x+3,y+2,k*.1,k*.05,.3,2);ln(g,[x+k*.06,y],[x+k*.06,y-k*.35],'#8a6a40',2);ln(g,[x,y],[x+wind*.3,y-k*.3],'#6a4a2c',k*.025);const lc=sp==='date palm'?'#6a8a3a':'#6a9a3a';if(sp==='date palm'){for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*.5;ln(g,[x+wind*.3,y-k*.3],[x+wind*.3+Math.cos(a)*k*.18,y-k*.3+Math.sin(a)*k*.12],lc,k*.03)}}else{leafBall(g,x+wind*.3,y-k*.33,k*.09,lc,5);leafBall(g,x+wind*.3-k*.06,y-k*.27,k*.06,sh(lc,-.1),3)}return}
 blob(g,x+k*.25,y+k*.06,k*shR,k*shR*.45,.33,k*.06);
 if(sp==='date palm'){const top=trunk(g,x,y,k*1.25,k*.07,k*.055,'#8a6a46',wind*1.5+k*.12);for(let i=0;i<14;i++){const yy=y-k*1.25*i/14;ln(g,[x+(top[0]-x)*i/14-k*.06,yy],[x+(top[0]-x)*i/14+k*.06,yy-2],'rgba(50,35,20,.45)',1.5)}
  const fr=[];for(let i=0;i<13;i++)fr.push([i/13*TAU+rnd()*.2,R(.45,.6)*k,rnd()]);fr.sort((a,b)=>Math.sin(a[0])-Math.sin(b[0]));
  if(S.k>-1)for(let i=0;i<5;i++)ball(g,[top[0]+R(-1,1)*k*.08,top[1]+k*.06+rnd()*k*.05],k*.03,'#c8701a',{rim:0});
  fr.forEach(([a,L,r])=>{const ex=top[0]+Math.cos(a)*L+wind,ey=top[1]+Math.sin(a)*L*.5+L*.25,mx=(top[0]+ex)/2,my=Math.min(top[1],ey)-L*.25;const col=mixc('#4a6a28','#7a9a3a',(Math.sin(a)+1)/2);g.strokeStyle=sh(col,-.3);g.lineWidth=k*.02;g.beginPath();g.moveTo(top[0],top[1]);g.quadraticCurveTo(mx,my,ex,ey);g.stroke();for(let j=1;j<12;j++){const u=j/12,px=(1-u)*(1-u)*top[0]+2*(1-u)*u*mx+u*u*ex,py=(1-u)*(1-u)*top[1]+2*(1-u)*u*my+u*u*ey,ll=k*.1*(1-u*.6);ln(g,[px,py],[px-Math.sin(a)*ll*.6,py+ll*.7],col,k*.022);ln(g,[px,py],[px+Math.sin(a)*ll*.6,py+ll*.7],sh(col,.15),k*.022)}});ball(g,top,k*.05,'#6a5a2a');return}
 if(sp==='cypress'){trunk(g,x,y,k*.25,k*.05,k*.04,'#6a4a2c',0);const col=mixc('#24401e','#2e4a22',.5);for(let i=0;i<14;i++){const u=i/14,w=k*.2*Math.sin(Math.PI*(.15+u*.8))*(1-u*.4),yy=y-k*.15-u*k*1.6;leafBall(g,x+wind*u*1.8+R(-2,2),yy,w*.9+2,sh(col,(u-.5)*.25),8)}return}
 if(sp==='cedar'){trunk(g,x,y,k*1.1,k*.11,k*.04,'#6a4a32',wind*.6);for(let i=0;i<4;i++){const u=i/4,yy=y-k*(.35+u*.75),w=k*(.85-u*.55);const cx=x+wind*u*1.4;blob(g,cx+6,yy+10,w*.95,w*.2,.3,4);for(let j=0;j<9;j++){const a=j/9*TAU;const px=cx+Math.cos(a)*w*.55,py=yy+Math.sin(a)*w*.16;g.save();g.translate(px,py);g.scale(1,.35);leafBall(g,0,0,w*.42,i%2?'#2f4f2c':'#3a5e34',9);g.restore()}g.save();g.translate(cx,yy-2);g.scale(1,.32);leafBall(g,0,0,w*.6,'#41663a',12);g.restore()}return}
 if(sp==='olive'){trunk(g,x-k*.05,y,k*.45,k*.06,k*.04,'#7a7260',-k*.08);trunk(g,x+k*.05,y,k*.5,k*.06,k*.04,'#857c68',k*.1);for(let i=0;i<16;i++){const a=rnd()*TAU,d=Math.sqrt(rnd())*k*.42;leafBall(g,x+Math.cos(a)*d+wind,y-k*.7+Math.sin(a)*d*.6,k*R(.12,.18),rnd()<.5?'#7a8a5e':'#8f9c72',9)}for(let i=0;i<30;i++){g.fillStyle='rgba(225,235,215,.35)';g.fillRect(x+R(-.5,.5)*k+wind,y-k*.7+R(-.3,.3)*k,2,1)}return}
 if(sp==='tamarisk'){trunk(g,x,y,k*.55,k*.06,k*.035,'#7a5a40',wind*.5);const col=S.bl?'#c890a0':'#7a906a';for(let i=0;i<120;i++){const a=rnd()*TAU,d=Math.sqrt(rnd())*k*.5,bx=x+Math.cos(a)*d+wind*(1+rnd()),by=y-k*.8+Math.sin(a)*d*.55;g.strokeStyle=rnd()<.5?sh(col,-.25):sh(col,.12);g.lineWidth=k*.018;g.beginPath();g.moveTo(bx,by);g.quadraticCurveTo(bx+k*.04,by+k*.06,bx+k*.02,by+k*.13);g.stroke()}return}
 // broadleaf: oak, fig, sycamore fig
 const cfg={oak:{h:.8,r:.55,col:'#3f5f26',tr:'#5a4230',tw:.1},fig:{h:.5,r:.5,col:'#4a7a2a',tr:'#8a8070',tw:.08},'sycamore fig':{h:.6,r:.8,col:'#4f6f2c',tr:'#9a8a6a',tw:.15}}[sp];
 let col=cfg.col;if(S.au&&sp==='oak')col='#9a6a24';if(S.bl)col=sh(col,.12);
 const top=trunk(g,x,y,k*cfg.h,k*cfg.tw,k*cfg.tw*.6,cfg.tr,wind*.4);
 const br=[];for(let i=0;i<6;i++){const a=-Math.PI/2+(i-2.5)*.42;br.push([top[0]+Math.cos(a)*k*cfg.r*.75+wind,top[1]+Math.sin(a)*k*cfg.r*.45])}
 br.forEach(b=>ln(g,top,b,cfg.tr,k*.03));
 if(bare){br.forEach(b=>{for(let i=0;i<3;i++)ln(g,b,[b[0]+R(-1,1)*k*.15,b[1]-rnd()*k*.15],sh(cfg.tr,-.1),k*.012)});return}
 const n=sp==='sycamore fig'?22:16;const cl=[];for(let i=0;i<n;i++){const a=rnd()*TAU,d=Math.sqrt(rnd());cl.push([top[0]+Math.cos(a)*d*k*cfg.r+wind*(1+d*.4),top[1]-k*cfg.r*.2+Math.sin(a)*d*k*cfg.r*.55,k*R(.13,.2)*(sp==='sycamore fig'?1.2:1)])}cl.sort((a,b)=>a[1]-b[1]);
 cl.forEach((c,i)=>leafBall(g,c[0],c[1],c[2],sh(col,(rnd()-.5)*.15+(c[1]<top[1]-k*cfg.r*.3?.08:-.05)),10));
 if(sp==='fig'){for(let i=0;i<14;i++){const c=pick(cl);const lx=c[0]+R(-1,1)*c[2],ly=c[1]+R(-1,1)*c[2]*.7,r=k*.05;g.fillStyle=sh(col,.18);g.beginPath();for(let j=0;j<5;j++){const a=j/5*TAU+rnd();g.arc(lx+Math.cos(a)*r*.6,ly+Math.sin(a)*r*.6,r*.5,0,TAU)}g.fill()}}
 if(S.bl&&sp!=='oak')for(let i=0;i<20;i++){const c=pick(cl);g.fillStyle='rgba(250,240,230,.8)';g.fillRect(c[0]+R(-1,1)*c[2]*.8,c[1]+R(-1,1)*c[2]*.6,2,2)}
 if(sp==='sycamore fig'||(sp==='fig'&&season==='summer'))for(let i=0;i<10;i++){const c=pick(cl);ball(g,[c[0]+R(-.7,.7)*c[2],c[1]+R(-.5,.6)*c[2]],k*.018,'#a8586a',{ol:0,rim:0})}
}
// ======================= animals =======================
const SP={
 deer:{L:.85,H:.9,g:.2,col:'#a06a38',bel:'#ead8b4',neck:.42,hd:.13,legs:.9,horn:'antler',tail:'short',ear:1},
 gazelle:{L:.62,H:.72,g:.15,col:'#c8975a',bel:'#f2e6cc',neck:.36,hd:.1,legs:.95,horn:'lyre',tail:'short',stripe:'#5a3a1e',ear:1},
 boar:{L:.75,H:.55,g:.25,col:'#4a3a2e',bel:'#5a4a3a',neck:.12,hd:.17,legs:.6,horn:'tusk',tail:'thin',bristle:1,snout:1},
 ibex:{L:.72,H:.75,g:.2,col:'#9a7a54',bel:'#d8c8a8',neck:.3,hd:.12,legs:.85,horn:'ibex',tail:'short',beard:1,ear:.6},
 onager:{L:.95,H:1.0,g:.22,col:'#b39470',bel:'#ece0c8',neck:.45,hd:.17,legs:.9,mane:'#4a3a2a',tail:'tuft',ear:1.6,dorsal:'#5a4630'},
 lion:{L:1.0,H:.9,g:.24,col:'#c8a060',bel:'#e0c890',neck:.25,hd:.17,legs:.8,maneBig:'#6a4020',tail:'tuft',ear:.6,cat:1},
 wolf:{L:.75,H:.72,g:.17,col:'#7a7268',bel:'#c8c0b0',neck:.25,hd:.13,legs:.85,tail:'bush',ear:1,snout:1},
 sheep:{L:.65,H:.62,g:.26,col:'#e8e0cc',bel:'#d8d0bc',neck:.22,hd:.11,legs:.7,face:'#3a3028',wool:1,tail:'short',ear:.8},
 goat:{L:.62,H:.68,g:.19,col:'#5a4a3a',bel:'#8a7a66',neck:.28,hd:.11,legs:.82,horn:'goat',beard:1,tail:'up',ear:.9},
 cattle:{L:1.15,H:1.15,g:.34,col:'#7a4a2a',bel:'#9a6a4a',neck:.3,hd:.2,legs:.75,horn:'cow',tail:'tuft',ear:.8,patch:'#efe6d6'},
 donkey:{L:.8,H:.9,g:.22,col:'#8a8078',bel:'#d8d0c8',neck:.38,hd:.17,legs:.85,mane:'#3a3430',tail:'tuft',ear:2,dorsal:'#4a4440',muzzle:'#e0d8d0',pack:1},
 horse:{L:1.05,H:1.3,g:.25,col:'#7a4426',bel:'#8a5432',neck:.55,hd:.2,legs:.95,mane:'#1a1410',tail:'horse',ear:.9,blaze:1}};
function animal(g,sp,mode,f,o,p,s){const A=SP[sp];s=s||SC;const sc=v=>[v[0],v[1],v[2]];const pr=v=>{const w=L2W(v,f,[0,0,0]);return[o[0]+w[0]*s,o[1]+(w[1]*OBQ-w[2]*ZH)*s]};
 const t=p*TAU;let bodyZ=A.H*.92,pitch=0,headDown=0,amp=.12,lift=.08,offs=[0,.5,.25,.75],bob=0;
 if(mode==='walk'){amp=A.L*.22;lift=.07;bob=.015*Math.cos(2*t)}
 if(mode==='flee'){amp=A.L*.5;lift=.22;offs=[0,.08,.5,.58];bob=.06*Math.sin(t);pitch=.12*Math.sin(t)}
 if(mode==='graze'){amp=A.L*.04;lift=.03;headDown=1;bob=.005*Math.sin(t)}
 bodyZ+=bob;const hw=A.g*.55;
 const sh_=[0,A.L/2,bodyZ+pitch*A.L*.5],hp=[0,-A.L/2,bodyZ-pitch*A.L*.5];
 const legs=[['FL',-hw,A.L/2,offs[0]],['FR',hw,A.L/2,offs[1]],['HL',-hw,-A.L/2,offs[2]],['HR',hw,-A.L/2,offs[3]]];
 const it=[];const push=(d,fn)=>it.push({d:L2W(d,f,[0,0,0])[1]+d[2]*.001,fn});
 blob(g,...pr([0,0,0]),A.L*s*.75,A.g*s*.9,.33,s*.05);
 legs.forEach(([n,r,fw,off])=>{const ph=(p+off)*TAU,ft=[r,fw+amp*Math.sin(ph)+(mode==='flee'?A.L*.1:0),lift*Math.max(0,Math.cos(ph))],top=[r,fw*.92,(fw>0?sh_:hp)[2]-A.g*.3];const lg=top[2];const k=ik(top,ft,lg*.52,lg*.55,n[0]==='F'?[0,1,0]:[0,-1,0]);
  push([r,fw,0],()=>{const c=n[1]==='L'?sh(A.col,-.12):A.col;g.save();g.strokeStyle='rgba(25,15,8,.55)';g.lineCap='round';g.lineWidth=s*A.g*.24+1;g.beginPath();g.moveTo(...pr(top));g.lineTo(...pr(k.E));g.stroke();g.lineWidth=s*A.g*.16+1;g.beginPath();g.moveTo(...pr(k.E));g.lineTo(...pr(k.H));g.stroke();g.restore();capsule(g,pr(top),pr(k.E),s*A.g*.22,s*A.g*.12,c,{ol:0});capsule(g,pr(k.E),pr(k.H),s*A.g*.12,s*A.g*.08,c,{ol:0});ball(g,pr(k.H),s*A.g*.09,A.cat||sp==='wolf'?c:'#2a2018',{ol:0,rim:0})})});
 // body
 push([0,0,bodyZ],()=>{const a=pr(hp),b=pr(sh_);if(A.tail){const tb=pr([0,-A.L/2-A.g*.4,bodyZ]),sw=Math.sin(t*2)*.15,te=pr([sw,-A.L/2-A.g*.4-(A.tail==='horse'?.35:A.tail==='bush'?.35:.2),bodyZ-(A.tail==='up'?-.1:A.tail==='horse'?.45:.3)]);const tc=A.tail==='horse'?(A.mane||A.col):A.col;capsule(g,tb,te,s*(A.tail==='bush'?.07:A.tail==='horse'?.06:.025),s*(A.tail==='bush'?.05:.02),tc);if(A.tail==='tuft')ball(g,te,s*.045,A.mane||'#3a2a1a',{rim:0})}
  capsule(g,a,b,s*A.g*.92,s*A.g*(A.cat?.9:1.0),A.col);ball(g,[lerp(a[0],b[0],.12),lerp(a[1],b[1],.12)-s*A.g*.1],s*A.g*1.02,sh(A.col,-.03),{rim:1});ball(g,[lerp(a[0],b[0],.85),lerp(a[1],b[1],.85)-s*A.g*.05],s*A.g*1.08,A.col,{rim:1});{const bm=[(a[0]+b[0])/2,(a[1]+b[1])/2+s*A.g*.55];g.fillStyle=A.bel;g.globalAlpha=.55;g.beginPath();g.ellipse(bm[0],bm[1],Math.abs(b[0]-a[0])*.35+s*A.g*.3,s*A.g*.28,0,0,TAU);g.fill();g.globalAlpha=1}
  g.save();g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.lineWidth=s*A.g*.7;g.strokeStyle='rgba(0,0,0,0)';const ny=Math.max(a[1],b[1]);const bg=g.createLinearGradient(0,ny-s*A.g,0,ny+s*A.g*1.2);bg.addColorStop(0,'rgba(0,0,0,0)');bg.addColorStop(.65,'rgba(0,0,0,0)');bg.addColorStop(1,A.bel);
  if(A.dorsal)ln(g,[a[0],a[1]-s*A.g*.7],[b[0],b[1]-s*A.g*.75],A.dorsal,s*.03);
  if(A.stripe){ln(g,[a[0],a[1]+s*A.g*.35],[b[0],b[1]+s*A.g*.35],A.stripe,s*.035);ln(g,[a[0],a[1]+s*A.g*.6],[b[0],b[1]+s*A.g*.6],A.bel,s*.05)}
  if(A.patch){SEED=7;for(let i=0;i<4;i++){const u=rnd();g.fillStyle=A.patch;g.beginPath();g.globalAlpha=.85;g.ellipse(lerp(a[0],b[0],u),lerp(a[1],b[1],u)+R(-.5,.3)*s*A.g,s*A.g*.35,s*A.g*.25,rnd(),0,TAU);g.fill();g.globalAlpha=1}}
  if(A.wool){SEED=11;for(let i=0;i<26;i++){const u=rnd(),v=R(-1,1);ball(g,[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+v*s*A.g*.8-s*A.g*.1],s*A.g*.4,sh(A.col,R(-.12,.08)),{ol:0,rim:0})}}
  if(A.bristle)for(let i=0;i<8;i++){const u=i/8;ln(g,[lerp(a[0],b[0],u),lerp(a[1],b[1],u)-s*A.g*.8],[lerp(a[0],b[0],u),lerp(a[1],b[1],u)-s*A.g*1.05],'#2a2018',2)}
  if(A.pack){const c=pr([0,.05,bodyZ+A.g*.6]);g.fillStyle='#9a6a3a';g.fillRect(c[0]-s*.2,c[1]-s*.12,s*.4,s*.2);ball(g,[c[0]-s*.22,c[1]+s*.05],s*.12,'#c8a070');ball(g,[c[0]+s*.22,c[1]+s*.05],s*.12,'#c8a070')}
  g.restore()});
 // neck+head
 const hdz=headDown?lerp(bodyZ+A.neck*.6,.15+A.hd*.5,headDown):bodyZ+A.neck*.7-(mode==='flee'?.12:0),chew=headDown?Math.sin(t*4)*.02:0;
 const nb=[0,A.L/2+A.g*.2,bodyZ+A.g*.3],hc=[Math.sin(t)*.02,A.L/2+A.neck*.55+A.hd*.6,hdz+chew];
 push([0,A.L/2+.2,bodyZ+.1],()=>{if(!A.cat||true)capsule(g,pr(nb),pr(hc),s*A.g*.55,s*A.hd*.6,A.col);
  if(A.mane){g.save();g.strokeStyle=A.mane;g.lineWidth=s*.05;g.lineCap='round';g.beginPath();g.moveTo(...pr(add(nb,[0,-.05,A.g*.6])));g.lineTo(...pr(add(hc,[0,-.05,A.hd*.6])));g.stroke();g.restore()}
  if(A.maneBig){ball(g,pr(add(hc,[0,-.08,0])),s*A.hd*1.7,A.maneBig);SEED=5;for(let i=0;i<12;i++){const a=i/12*TAU;ball(g,pr(add(hc,[Math.cos(a)*A.hd*1.4,-.08,Math.sin(a)*A.hd*1.4])),s*A.hd*.45,sh(A.maneBig,R(-.15,.15)),{ol:0,rim:0})}}
  const hd=pr(hc),mz=pr(add(hc,[0,A.hd*1.1,-A.hd*.35-(headDown?.05:0)]));
  if(A.ear){[-1,1].forEach(sd=>{const e=pr(add(hc,[sd*A.hd*.6,-A.hd*.3,A.hd*(.6+A.ear*.3)]));capsule(g,pr(add(hc,[sd*A.hd*.4,-A.hd*.2,A.hd*.4])),e,s*A.hd*.2,s*A.hd*.12,sh(A.col,-.1))})}
  if(A.horn==='antler'){[-1,1].forEach(sd=>{const b0=pr(add(hc,[sd*A.hd*.3,-.02,A.hd*.6])),b1=pr(add(hc,[sd*.2,-.12,A.hd*.6+.35]));ln(g,b0,b1,'#5a4630',s*.03);for(let i=1;i<4;i++){const u=i/4,m=[lerp(b0[0],b1[0],u),lerp(b0[1],b1[1],u)];ln(g,m,[m[0]+sd*s*.06,m[1]-s*.08],'#6a5640',s*.02)}})}
  if(A.horn==='lyre'){[-1,1].forEach(sd=>{g.strokeStyle='#2a2018';g.lineWidth=s*.022;g.beginPath();const b0=pr(add(hc,[sd*A.hd*.3,0,A.hd*.6]));g.moveTo(...b0);const e=pr(add(hc,[sd*.07,-.12,A.hd+.28]));g.quadraticCurveTo(b0[0]+sd*s*.1,b0[1]-s*.15,e[0],e[1]);g.stroke()})}
  if(A.horn==='ibex'||A.horn==='goat'){[-1,1].forEach(sd=>{const r0=A.horn==='ibex'?.42:.2;g.strokeStyle='#6a5a44';g.lineWidth=s*(A.horn==='ibex'?.05:.03);g.lineCap='round';g.beginPath();const b0=pr(add(hc,[sd*A.hd*.3,0,A.hd*.6]));g.moveTo(...b0);const e=pr(add(hc,[sd*.05,-r0,A.hd*.3]));g.quadraticCurveTo(b0[0]+sd*s*.04,b0[1]-s*r0*1.2,e[0],e[1]);g.stroke();if(A.horn==='ibex'){g.strokeStyle='rgba(30,20,10,.4)';g.lineWidth=1;g.setLineDash([2,3]);g.stroke();g.setLineDash([])}})}
  if(A.horn==='cow'){[-1,1].forEach(sd=>{g.strokeStyle='#e8dcc0';g.lineWidth=s*.04;g.lineCap='round';g.beginPath();const b0=pr(add(hc,[sd*A.hd*.5,0,A.hd*.5]));g.moveTo(...b0);g.quadraticCurveTo(b0[0]+sd*s*.2,b0[1],b0[0]+sd*s*.22,b0[1]-s*.15);g.stroke()})}
  capsule(g,hd,mz,s*A.hd*.6,s*A.hd*(A.snout?.35:.42),A.face||A.col);
  if(A.muzzle)ball(g,mz,s*A.hd*.38,A.muzzle,{ol:0});if(A.blaze)ln(g,hd,mz,'#efe6d6',s*.03);
  if(A.snout)ball(g,mz,s*A.hd*.25,sp==='boar'?'#8a6a5a':'#1a1410',{ol:0,rim:0});
  if(A.horn==='tusk'){[-1,1].forEach(sd=>ln(g,[mz[0]+sd*s*.03,mz[1]],[mz[0]+sd*s*.06,mz[1]-s*.05],'#f0e8d8',s*.018))}
  if(A.beard)ln(g,mz,[mz[0],mz[1]+s*.08],sh(A.col,-.3),s*.03);
  const fy=Math.cos(f);if(fy>-.3){g.fillStyle='#120c08';[-1,1].forEach(sd=>{const e=pr(add(hc,[sd*A.hd*.45,A.hd*.3,A.hd*.15]));g.beginPath();g.arc(e[0],e[1],s*A.hd*.11,0,TAU);g.fill()})}});
 it.sort((a,b)=>a.d-b.d).forEach(i=>i.fn())}
function bird(g,x,y,t,s,col,sz){const fl=Math.sin(t*TAU*3);blob(g,x+s*.8,y+s*1.6,sz*.6,sz*.25,.18,3);g.save();g.translate(x,y);g.fillStyle=col;const w=sz*(1.2+.25*fl);g.beginPath();g.moveTo(0,-sz*.35);g.quadraticCurveTo(-w*.5,-sz*.2-fl*sz*.35,-w,sz*.05+fl*sz*.2);g.quadraticCurveTo(-w*.4,sz*.05,0,sz*.25);g.quadraticCurveTo(w*.4,sz*.05,w,sz*.05+fl*sz*.2);g.quadraticCurveTo(w*.5,-sz*.2-fl*sz*.35,0,-sz*.35);g.fill();ball(g,[0,-sz*.05],sz*.18,sh(col,.1),{rim:0});g.restore()}
function fish(g,x,y,a,t,sz,col){g.save();g.translate(x,y);g.rotate(a);g.globalAlpha=.75;const w=Math.sin(t*TAU*2)*.35;g.fillStyle=col;g.beginPath();g.moveTo(sz,0);g.quadraticCurveTo(sz*.3,-sz*.32,-sz*.5,w*sz*.2);g.quadraticCurveTo(sz*.3,sz*.32,sz,0);g.fill();g.beginPath();g.moveTo(-sz*.45,w*sz*.2);g.lineTo(-sz*.95,w*sz*.6-sz*.25);g.lineTo(-sz*.95,w*sz*.6+sz*.25);g.closePath();g.fill();g.globalAlpha=.5;g.fillStyle='#fff';g.fillRect(sz*.2,-sz*.06,sz*.4,sz*.06);g.restore()}
function water(g,x,y,w,h,t){g.save();g.beginPath();g.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,TAU);g.clip();const gr=g.createRadialGradient(x+w/2,y+h/2,5,x+w/2,y+h/2,w/2);gr.addColorStop(0,'#1e4a5a');gr.addColorStop(.8,'#2e6a72');gr.addColorStop(1,'#6a8a70');g.fillStyle=gr;g.fillRect(x,y,w,h);SEED=4;for(let i=0;i<5;i++){const a=t*TAU*(i%2?1:-1)/1+i,cx=x+w/2+Math.cos(a)*w*.28*(.5+i*.1),cy=y+h/2+Math.sin(a)*h*.25;fish(g,cx,cy,a+(i%2?Math.PI/2:-Math.PI/2),t*2+i*.3,14,i%3?'#6a8a8a':'#a89060')}g.strokeStyle='rgba(220,240,240,.25)';g.lineWidth=1.5;for(let i=0;i<14;i++){const px=x+((i*97+t*40)%w),py=y+(i*53)%h;g.beginPath();g.moveTo(px-8,py);g.quadraticCurveTo(px,py-3,px+8,py);g.stroke()}g.restore();g.strokeStyle='rgba(60,50,30,.5)';g.lineWidth=3;g.beginPath();g.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,TAU);g.stroke()}
// ======================= player-built room scene =======================
const WT=18,WH=34; // wall thickness & visible height (px)
function roomScene(g,W,H,night,t){t=t||0;
 terrainBlend(g,0,0,W,H,'grass','dirt',(u,v)=>1-Math.min(1,Math.hypot(u-.45,v-.5)*1.4));
 // path
 const path=document.createElement('canvas');path.width=W;path.height=H;
 // walls as player-drawn segments [x1,y1,x2,y2] (axis aligned)
 const X0=180,Y0=150,X1=1100,Y1=640,XM=560,XM2=860,YM=400;
 const rooms=[{n:'Bedroom',x:X0,y:Y0,w:XM-X0,h:Y1-Y0,fl:'plank',why:'2 beds + chest'},{n:'Kitchen / dining',x:XM,y:Y0,w:XM2-XM,h:Y1-Y0,fl:'floor',why:'hearth + table + stools'},{n:'Smithy',x:XM2,y:Y0,w:X1-XM2,h:YM-Y0,fl:'stone',why:'anvil + forge'},{n:'Storeroom',x:XM2,y:YM,w:X1-XM2,h:Y1-YM,fl:'floor',why:'shelves + jars'}];
 const walls=[[X0,Y0,X1,Y0],[X0,Y1,700,Y1],[760,Y1,X1,Y1],[X0,Y0,X0,Y1],[X1,Y0,X1,Y1],[XM,Y0,XM,330],[XM,390,XM,Y1],[XM2,Y0,XM2,260],[XM2,320,XM2,Y1],[XM2,YM,960,YM],[1020,YM,X1,YM]];
 // floors with soft AO edges
 rooms.forEach(r=>{terrainFill(g,r.x,r.y,r.w,r.h,r.fl);g.save();g.beginPath();g.rect(r.x,r.y,r.w,r.h);g.clip();g.filter='blur(10px)';g.strokeStyle='rgba(0,0,0,.45)';g.lineWidth=26;g.strokeRect(r.x,r.y,r.w,r.h);g.restore()});
 // reed mat in bedroom, rug in kitchen
 g.save();g.fillStyle='#b89a5a';g.fillRect(250,420,170,110);g.strokeStyle='rgba(90,60,30,.4)';for(let i=0;i<170;i+=6){g.beginPath();g.moveTo(250+i,420);g.lineTo(250+i,530);g.stroke()}g.restore();
 g.fillStyle='#8a2a22';g.fillRect(630,430,170,130);g.strokeStyle='#e0c070';g.lineWidth=4;g.strokeRect(640,440,150,110);g.strokeStyle='#2a3a6a';g.lineWidth=2;g.strokeRect(650,450,130,90);
 // soft sun shadows of walls (day) cast down-right
 if(!night){g.save();g.filter='blur(8px)';g.fillStyle='rgba(20,12,4,.38)';walls.forEach(w=>{const x=Math.min(w[0],w[2])-WT/2,y=Math.min(w[1],w[3])-WT/2,ww=Math.abs(w[2]-w[0])+WT,hh=Math.abs(w[3]-w[1])+WT;g.beginPath();g.moveTo(x,y);g.lineTo(x+ww,y);g.lineTo(x+ww+22,y+16);g.lineTo(x+ww+22,y+hh+16);g.lineTo(x+22,y+hh+16);g.lineTo(x,y+hh);g.closePath();g.fill()});g.restore()}
 // furniture
 const furn=[];const F=(y,fn)=>furn.push({y,fn});
 const bedAt=(x,y,occ,c)=>F(y+60,()=>{SC=90;drawBed(g,[x,y+60],90,0);if(occ){actor(g,mkLook(occ[0],occ[1],occ[2],'adult',occ[3]),'sleep',0,[x,y+60],t/3%1,{noProp:1})}else{drawBlanket(g,[x,y+60],90,0)}});
 bedAt(260,200,['eg','peasant','m',4]);bedAt(420,200,null);
 F(330,()=>{blob(g,500,330,40,18,.4,6);g.fillStyle='#6a4426';g.fillRect(465,280,70,48);g.fillStyle='#8a5a32';g.fillRect(465,270,70,14);g.strokeStyle='#d8a838';g.lineWidth=2;g.strokeRect(468,284,64,40)});
 // hearth
 const hx_=710,hy_=250;F(hy_,()=>{blob(g,hx_,hy_+8,52,24,.45,6);for(let i=0;i<10;i++){const a=i/10*TAU;ball(g,[hx_+Math.cos(a)*40,hy_+Math.sin(a)*22],11,'#8a8478')}g.fillStyle='#2a1a10';g.beginPath();g.ellipse(hx_,hy_,32,17,0,0,TAU);g.fill();for(let i=0;i<4;i++)capsule(g,[hx_-22+i*12,hy_+8],[hx_-10+i*8,hy_-8],4,4,'#5a3a1e');
  for(let i=0;i<9;i++){const ph=(t*2+i*.37)%1,fx=hx_+Math.sin(i*2.1)*12+Math.sin(t*TAU*3+i)*3,fy=hy_-4-ph*34;g.fillStyle='rgba(255,'+Math.floor(220-ph*140)+',60,'+(1-ph)*.85+')';g.beginPath();g.ellipse(fx,fy,7*(1-ph*.6),11*(1-ph*.5),0,0,TAU);g.fill()}});
 // table & stools & diners
 F(470,()=>{blob(g,715,480,85,30,.4,8);g.fillStyle='#7a5030';g.fillRect(645,440,140,50);g.fillStyle='#8f6038';g.fillRect(645,430,140,44);g.strokeStyle='rgba(30,15,5,.4)';g.strokeRect(645,430,140,44);drawBowl(g,[690,450],90);drawBowl(g,[740,448],90);drawJar(g,[770,446],60);ball(g,[715,452],7,'#d8b060')});
 const diner=(x,y,f,lk,ph)=>F(y,()=>{SC=90;actor(g,mkLook(...lk),'sit',f,[x,y],(t/3+ph)%1)});
 diner(610,455,Math.PI/2,['eg','noble','f','adult',8],0);diner(820,455,-Math.PI/2,['eg','peasant','m','child',9],.4);diner(715,560,Math.PI,['eg','peasant','m','elder',10],.7);
 // cook carrying
 F(320,()=>{SC=90;actor(g,mkLook('eg','peasant','f','adult',12),'carry',0,[815,290+((t/3)%1)*60],t/3*3%1)});
 // smithy
 const fx_=1040,fy_=200;F(fy_,()=>{blob(g,fx_,fy_+30,50,22,.45,6);g.fillStyle='#7a5a44';g.fillRect(fx_-40,fy_-20,80,50);g.fillStyle='#5a4030';g.fillRect(fx_-40,fy_-34,80,18);g.fillStyle='#ff7a20';g.beginPath();g.ellipse(fx_,fy_,22,10,0,0,TAU);g.fill();g.fillStyle='#ffd070';g.beginPath();g.ellipse(fx_,fy_,12,5,0,0,TAU);g.fill()});
 F(300,()=>{SC=90;actor(g,mkLook('ba','artisan','m','adult',14),'hammer',-.3,[950,270],(t/3*2)%1)});
 // storeroom
 F(600,()=>{for(let i=0;i<6;i++)drawJar(g,[900+i*30,600+(i%2)*8],80);g.fillStyle='#6a4426';g.fillRect(890,430,190,26);for(let i=0;i<7;i++)ball(g,[905+i*26,436],9,i%2?'#c8a050':'#a8683a')});
 // tree outside + person walking on path
 F(700,()=>tree(g,'sycamore fig',100,720,230,t/3,'summer'));F(110,()=>tree(g,'date palm',1180,110,160,t/3+.3,'summer'));
 F(690,()=>{SC=90;actor(g,mkLook('eg','soldier','m','adult',15),'walk',-Math.PI/2,[720,700],(t/3*3)%1)});
 furn.sort((a,b)=>a.y-b.y).forEach(f=>f.fn());
 // walls (drawn after floors; top face + south face for height)
 walls.slice().sort((a,b)=>Math.max(a[1],a[3])-Math.max(b[1],b[3])).forEach(w=>{const x=Math.min(w[0],w[2])-WT/2,y=Math.min(w[1],w[3])-WT/2,ww=Math.abs(w[2]-w[0])+WT,hh=Math.abs(w[3]-w[1])+WT;
  const sf=g.createLinearGradient(0,y+hh-WH,0,y+hh);sf.addColorStop(0,'#9a7a54');sf.addColorStop(1,'#6a4e34');g.fillStyle=sf;g.fillRect(x,y+hh-WH*.0,ww,WH*.55);
  g.fillStyle='#b8986a';g.fillRect(x,y-WH*.45,ww,hh);
  g.strokeStyle='rgba(80,55,30,.35)';g.lineWidth=1;for(let yy=y-WH*.45+6;yy<y-WH*.45+hh;yy+=7){for(let xx=x+((yy|0)%14?0:7);xx<x+ww;xx+=14){g.strokeRect(xx,yy,14,7)}}
  g.fillStyle='rgba(255,240,210,.25)';g.fillRect(x,y-WH*.45,ww,2);g.strokeStyle='rgba(40,25,10,.6)';g.strokeRect(x,y-WH*.45,ww,hh+WH*.55)});
 // lighting
 if(night){const lm=document.createElement('canvas');lm.width=W;lm.height=H;const lg=lm.getContext('2d');lg.fillStyle='#1c2440';lg.fillRect(0,0,W,H);
  const lights=[[hx_,hy_-10,330,'255,150,60',1+.08*Math.sin(t*TAU*4)],[fx_,fy_,260,'255,120,40',1+.1*Math.sin(t*TAU*5+1)],[330,330,170,'255,190,110',.85],[935,520,150,'255,190,110',.8]];
  const segs=[];walls.forEach(w=>{const x=Math.min(w[0],w[2])-WT/2,y=Math.min(w[1],w[3])-WT/2,ww=Math.abs(w[2]-w[0])+WT,hh=Math.abs(w[3]-w[1])+WT;segs.push([x,y,x+ww,y],[x+ww,y,x+ww,y+hh],[x+ww,y+hh,x,y+hh],[x,y+hh,x,y])});
  lights.forEach(([lx,ly,r,c,fl])=>{const tc=document.createElement('canvas');tc.width=W;tc.height=H;const tg=tc.getContext('2d');const gr=tg.createRadialGradient(lx,ly,4,lx,ly,r*fl);gr.addColorStop(0,'rgba('+c+',1)');gr.addColorStop(.35,'rgba('+c+',.55)');gr.addColorStop(1,'rgba('+c+',0)');tg.fillStyle=gr;tg.fillRect(0,0,W,H);
   tg.globalCompositeOperation='destination-out';tg.fillStyle='#000';segs.forEach(([ax,ay,bx,by])=>{const ext=(px,py)=>{const dx=px-lx,dy=py-ly,d=Math.hypot(dx,dy)||1;return[px+dx/d*2000,py+dy/d*2000]};const A2=ext(ax,ay),B2=ext(bx,by);tg.beginPath();tg.moveTo(ax,ay);tg.lineTo(bx,by);tg.lineTo(B2[0],B2[1]);tg.lineTo(A2[0],A2[1]);tg.closePath();tg.fill()});
   lg.save();lg.globalCompositeOperation='lighter';lg.filter='blur(5px)';lg.drawImage(tc,0,0);lg.restore()});
  g.save();g.globalCompositeOperation='multiply';g.drawImage(lm,0,0);g.restore();
  g.save();g.globalCompositeOperation='screen';[[hx_,hy_-14,60],[fx_,fy_,45]].forEach(([x,y,r])=>{const gr=g.createRadialGradient(x,y,2,x,y,r);gr.addColorStop(0,'rgba(255,200,120,.8)');gr.addColorStop(1,'rgba(255,120,40,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r)});g.restore();
  // moon rim on wall tops
  g.fillStyle='rgba(140,160,220,.08)';g.fillRect(0,0,W,H)}
 // labels: furniture defines room type
 rooms.forEach(r=>{g.font='bold 15px Georgia';g.textAlign='left';const tx=r.x+12,ty=r.y+r.h-14;g.fillStyle='rgba(0,0,0,.6)';g.fillRect(tx-6,ty-17,Math.max(g.measureText(r.n).width,g.measureText(r.why).width*0.8)+14,38);g.fillStyle='#f4e2b8';g.fillText(r.n,tx,ty);g.font='12px Georgia';g.fillStyle='#c8b890';g.fillText('← '+r.why,tx,ty+15)});
 SC=96}
// ======================= sheets =======================
function buildNature(){
 sheet('nature-trees',1640,980,'Trees: 8 species × seasons; growth & harvest states (sapling, mature, stump, felled log). Canopies sway (wind).',(g,w,h)=>{terrainBlend(g,0,0,w,h,'grass','sand',(u,v)=>v>.78?1:0);TREES.forEach((sp,i)=>{tree(g,sp,110+i*200,330,sp==='sycamore fig'||sp==='cedar'?150:170,.1*i,'summer');label(g,sp,110+i*200,370,14)});
  ['spring','summer','autumn','winter'].forEach((se,j)=>{['oak','fig','tamarisk','olive'].forEach((sp,i)=>{const x=110+(j*4+i)*100;tree(g,sp,x,620,120,.2,se);if(i===0)label(g,se,x+150,660,14)})});
  ['sapling','stump','felled'].forEach((st,j)=>{[['oak'],['date palm'],['cedar']].forEach((sp,i)=>{const x=170+j*520+i*160;tree(g,sp[0],x,880,170,0,'summer',st);label(g,sp[0]+' '+st,x,935,12)})})});
 sheet('nature-animals',1640,1000,'Wildlife & livestock: walk / graze / flee, same rig (4 legs IK, neck, head, tail, horns), soft contact shadows.',(g,w,h)=>{terrainBlend(g,0,0,w,h,'grass','dirt',(u,v)=>.5+.3*Math.sin(u*9));const names=Object.keys(SP);const modes=['walk','graze','flee'];names.forEach((n,i)=>{const col=i%6,row=Math.floor(i/6);modes.forEach((m,j)=>{const x=80+col*265+j*80,y=180+row*420+j*100;animal(g,n,m,Math.PI/2+(j===2?0:.25),[x+40,y],(j*.3+i*.1)%1,95)});label(g,n+' — walk / graze / flee',140+col*265,row*420+520,13)});
  for(let i=0;i<7;i++)bird(g,900+i*40+Math.sin(i)*20,60+Math.abs(i-3)*18,i*.13,40,'#3a3430',12);water(g,1340,860,260,120,.3)});
 sheet('gfx-terrain',1640,640,'Terrain textures (grass, dirt, sand, stone flags) with noisy soft blends, soft shadows & AO contact',(g,w,h)=>{const ks=['grass','dirt','sand','stone'];ks.forEach((k,i)=>{terrainFill(g,i*410,0,410,300,k);label(g,k,i*410+205,290,16)});terrainBlend(g,0,320,820,320,'grass','dirt',(u,v)=>u);const c=document.createElement('canvas');terrainBlend(g,820,320,820,320,'sand','stone',(u,v)=>Math.max(0,1-Math.hypot(u-.5,(v-.5)*.6)*2));
  blob(g,300,520,90,30,.4,10);ball(g,[290,490],40,'#8a8478');ball(g,[330,505],26,'#9a9488');tree(g,'olive',560,560,160,.2,'summer');SC=110;actor(g,mkLook('ca','peasant','m','adult',21),'hoe',.3,[1100,560],.55);actor(g,mkLook('ba','artisan','f','adult',22),'idle',0,[1250,560],.2);animal(g,'sheep','graze',Math.PI/2,[1430,570],.4,90);animal(g,'goat','walk',-Math.PI/2+.3,[1520,500],.2,80)});
 sheet('gfx-room-day',1280,800,'Player-built rooms (RimWorld / Songs of Syx style): walls drawn by player, furniture defines room type — DAY',(g,w,h)=>roomScene(g,w,h,0,.4));
 sheet('gfx-room-night',1280,800,'Same rooms at NIGHT: warm hearth/forge/lamp light with ray-cast wall shadows, cool ambient',(g,w,h)=>roomScene(g,w,h,1,.4));
 const rc=document.createElement('canvas');rc.width=1280;rc.height=720;window.reelFrame=(t)=>{reel(rc.getContext('2d'),t);return rc.toDataURL('image/png')}}
let REELBG=null;
function reel(g,t){const W=1280,H=720,u=t/3;
 if(!REELBG){REELBG=document.createElement('canvas');REELBG.width=W;REELBG.height=H;const b=REELBG.getContext('2d');terrainBlend(b,0,0,W,H,'grass','dirt',(x,y)=>y<.62?1:0);terrainFill(b,0,0,0,0,'dirt')}
 g.drawImage(REELBG,0,0);
 const lk={idle:['ba','noble','m'],walk:['mt','artisan','m'],run:['mi','peasant','m'],carry:['eg','peasant','f'],chop:['ca','peasant','m'],mine:['hi','artisan','m'],hammer:['ba','artisan','m'],hoe:['eg','peasant','m'],sleep:['mi','noble','f'],sit:['mt','peasant','f'],pray:['eg','priest','m'],spear:['ba','soldier','m'],bow:['eg','soldier','m'],block:['hi','soldier','m'],death:['ca','soldier','m']};
 const cyc={idle:1,walk:3,run:4,carry:3,chop:2,mine:2,hammer:3,hoe:2,sleep:1,sit:2,pray:1,spear:2,bow:1,block:2,death:1};
 SC=80;ANIMS.forEach((a,i)=>{const col=i%8,row=Math.floor(i/8),x=80+col*160,y=170+row*200;const L=mkLook(...lk[a],'adult',i*7+3);const f=a==='bow'||a==='block'||a==='spear'?.9:a==='sleep'?0:.35;actor(g,L,a,f,[x,y+(a==='sleep'?-30:0)],(u*cyc[a])%1);label(g,a,x,y+30,13)});
 tree(g,'date palm',1230,330,150,u,'summer');
 const an=[['deer','walk',3],['gazelle','flee',4],['boar','walk',3],['ibex','graze',1],['onager','walk',3],['lion','walk',2],['wolf','flee',4],['sheep','graze',1],['goat','walk',3],['cattle','walk',2],['donkey','walk',3],['horse','flee',4]];
 an.forEach(([n,m,c],i)=>{const x=60+i*102,y=560+(i%2)*80;animal(g,n,m,Math.PI/2,[x,y],(u*c)%1,62);label(g,n,x,y+(i%2?38:-62),11)});
 water(g,1100,600,170,100,u);
 for(let i=0;i<6;i++){const a=u*TAU+i*.5;bird(g,640+Math.cos(a)*420,330+Math.sin(a)*60+Math.abs(i-2.5)*12,u*4+i*.1,40,'#2e2a26',11)}
 g.font='bold 18px Georgia';g.textAlign='left';g.fillStyle='rgba(0,0,0,.5)';g.fillText('Bronze & Blood — character & wildlife animation concept (review)',22,32);g.fillStyle='#f4e2b8';g.fillText('Bronze & Blood — character & wildlife animation concept (review)',20,30)}
