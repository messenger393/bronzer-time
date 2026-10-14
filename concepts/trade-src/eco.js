/*ECO START*/
// ===== Trading update: stead economy loop (tithe, Holding, crafters, merchants, spoilage). No regional trade/caravans yet. =====
// Design source: concepts/econsim-report.md (validated in the simulator). One "tithe year" = ECO_YD game days (no seasons yet).
const ECO_YD=6,ECO_K=10;
const EIT={grain:{n:'Grain',v:.01,rot:.00004,food:1,c:'#d8b850'},fish:{n:'Dried fish',v:.012,rot:.00025,food:1,c:'#7aa8c0'},dairy:{n:'Cheese & milk',v:.02,rot:.00015,food:1,c:'#f0e8c8'},
 wool:{n:'Wool',v:.03,rot:.000005,c:'#e8e0d0'},flax:{n:'Flax',v:.025,rot:.00001,c:'#7aa860'},timber:{n:'Timber',v:.012,rot:0,c:'#8a6038'},clay:{n:'Clay',v:.008,rot:0,c:'#b06a40'},
 pottery:{n:'Pottery',v:.06,rot:0,c:'#c87a48',cr:1},cloth:{n:'Linen & cloth',v:.09,rot:.000005,c:'#e8d8f0',cr:1},tools:{n:'Tools & furniture',v:.1,rot:0,c:'#a08060',cr:1},bronzeware:{n:'Bronzeware',v:.2,rot:0,c:'#d89040',cr:1},beer:{n:'Beer',v:.03,rot:.0002,c:'#c8a040',cr:1}};
const LAND={river:{n:'River bottom',out:{grain:1.0,fish:.35,flax:.2},sk:['brewer','weaver']},plain:{n:'Open plain',out:{grain:.95,dairy:.2,flax:.1},sk:['brewer','carpenter']},
 hills:{n:'Hill pasture',out:{wool:.35,dairy:.35,grain:.4},sk:['weaver','smith']},forest:{n:'Forest edge',out:{timber:.7,grain:.4,dairy:.15},sk:['carpenter','smith']},clay:{n:'Clay banks',out:{clay:.8,grain:.45,fish:.15},sk:['potter','brewer']}};
const CRAFT={potter:{n:'Potter',g:'pottery',need:'clay',fx:'storage jars: Holding spoilage −8% each (max −40%)'},weaver:{n:'Weaver',g:'cloth',need:'wool',fx:'+1 happiness each (max +5)'},
 carpenter:{n:'Carpenter',g:'tools',need:'timber',fx:'+3% wood output each (max +30%)'},smith:{n:'Bronzesmith',g:'bronzeware',need:'ore',fx:'buys royal copper & tin for silver; valuable goods'},brewer:{n:'Brewer',g:'beer',need:'grain',fx:'+1 happiness each (max +4)'}};
const ECOFOOD=['fish','dairy','grain'],ECOWAGE=['clay','timber','flax','wool','pottery','tools','cloth','beer','bronzeware','grain','dairy','fish'];
function ecoLed(){return{tithe:0,spoil:0,wages:0,patron:0,sIn:0,sOut:0,sold:0,mtax:0,food:0,ore:0,risers:0,merch:0,born:0,arrived:0,arrears:0,starve:0,left:0}}
function ecoNew(){return{v:1,tithe:20,mtax:20,charters:4,autoCh:1,sell:80,patron:15,house:1,drill:0,mineL:0,storL:0,autoStead:1,yr:1,yt:0,steads:[],cr:[],mh:[],pet:[],car:[],hold:{},mkt:{},silver:0,led:ecoLed(),last:null,hist:[],sid:0,unpaid:0,popArmy:1,riseY:{}}}
function ecoMigrate(){if(!S.eco){const e=ecoNew();e.tithe={low:15,normal:20,high:30}[S.tax||'normal']||20;S.tax='normal';e.popArmy=0;S.eco=e}const E=S.eco,d=ecoNew();for(const k in d)if(E[k]==null)E[k]=d[k];
 if(!E.popArmy){E.popArmy=1;const n=soldN();if(n)S.pop+=n}E._sol=soldN();ECOF=null}
const soldN=()=>{let n=0;for(const c of S.companies||[])if(!c.merc)n+=c.men;return n};
const serfN=()=>{let n=0;if(S.eco)for(const s of S.eco.steads)n+=s.n;return n};
const townN=()=>{let n=0;if(S.eco){for(const c of S.eco.cr)n+=c.n;for(const m of S.eco.mh)n+=m.n}return n};
const ecoBusy=()=>S&&S.eco?serfN()+townN()+soldN():0;
const holdB=()=>S.bl.find(b=>b.t==='holding');
const ecoOn=()=>!!(S.eco&&holdB());
const crN=c=>S.eco?S.eco.cr.filter(x=>x.c===c).length:0;
const holdTot=()=>{let t=0;for(const g in S.eco.hold)t+=S.eco.hold[g];return t};
const holdVal=()=>{let t=0;for(const g in S.eco.hold)t+=S.eco.hold[g]*EIT[g].v;return t};
const holdCap=()=>20000+S.eco.storL*15000+cnt('granary')*2000+cnt('storehouse')*1500;
const spoilF=()=>(1/(1+.5*S.eco.storL+.1*cnt('granary')+.06*cnt('storehouse')))*(1-Math.min(.4,crN('potter')*.08));
const mineF=()=>S.eco?(1+.25*S.eco.mineL)*(S.eco.unpaid?.65:1):1;
const yearLen=()=>ECO_YD*DAYLEN;
const fmtS=v=>v>=1000?(v/1000).toFixed(1)+'k':v>=10?Math.round(v)+'':v.toFixed(1);
function ecoHousing(){return S.eco?serfN()+townN()+soldN():0}
let ECOF=null;function ecoFields(){if(ECOF&&ECOF.length===MW*MH)return ECOF;ECOF=new Uint8Array(MW*MH);if(S.eco)for(const s of S.eco.steads)for(const i of s.f)ECOF[i]=1;return ECOF}
// ---- procedural stead layout ----
function steadScan(x,y,F){const c={w:0,f:0,h:0,s:0,g:0},cand=[];for(let dy=-6;dy<=7;dy++)for(let dx=-6;dx<=7;dx++){const X=x+dx,Y=y+dy;if(X<1||Y<1||X>=MW-1||Y>=MH-1)continue;const d=Math.hypot(dx-.5,(dy-.5)*1.1);if(d>6.2)continue;const i=Y*MW+X,t=TER[i];
  if(t===T_WATER){c.w++;continue}if(t===T_FOREST){c.f++;continue}if(t===T_CU||t===T_SN||t===T_ROCK)continue;if(t===T_HILL)c.h++;else if(t===T_SAND)c.s++;else c.g++;
  if(dx>=-1&&dx<=2&&dy>=-1&&dy<=2)continue;if(occ[i]||roadSet[i]||F[i]||(CLIFF&&CLIFF[i]))continue;cand.push([d+hsh(X,Y,41)*.6,i])}
 cand.sort((a,b)=>a[0]-b[0]);const fields=cand.slice(0,34).map(q=>q[1]);
 const land=c.s>=8&&c.w>=3?'clay':c.w>=6?'river':c.f>=14?'forest':c.h>=14?'hills':c.s>=10?'clay':'plain';return{land,fields,free:fields.length,water:c.w}}
function steadFree(x,y,F){for(let yy=y-1;yy<=y+2;yy++)for(let xx=x-1;xx<=x+2;xx++){if(xx<1||yy<1||xx>=MW-1||yy>=MH-1)return false;const i=yy*MW+xx,t=TER[i];if(t===T_WATER||t===T_FOREST||occ[i]||F[i]||(CLIFF&&CLIFF[i]))return false;if(yy>=y&&yy<=y+1&&xx>=x&&xx<=x+1&&(roadSet[i]||t===T_CU||t===T_SN||t===T_ROCK))return false}return true}
function steadSite(){const E=S.eco,c=S.center,R0=RAD[S.tier]+2,F=ecoFields();let best=null,bs=-1e9;const span=16+Math.sqrt(E.steads.length)*9;
 for(let k=0;k<160;k++){const a=Math.random()*Math.PI*2,r=R0+Math.random()*span,x=Math.round(c.x+Math.cos(a)*r),y=Math.round(c.y+Math.sin(a)*r);if(x<8||y<8||x>MW-9||y>MH-9)continue;if(!steadFree(x,y,F))continue;
  let near=0;for(const s of E.steads){const d=Math.abs(s.x-x)+Math.abs(s.y-y);if(d<9){near=1;break}}if(near)continue;const L=steadScan(x,y,F);if(L.free<16)continue;
  const sc=L.free+Math.min(10,L.water)*1.5-r*.25+Math.random()*5;if(sc>bs){bs=sc;best={x,y,L}}}return best}
function foundStead(n,why){const E=S.eco,st=steadSite();if(!st)return null;const b={t:'stead',l:1,x:st.x,y:st.y};S.bl.push(b);rebuildOcc();try{autoRoadFor(b)}catch(e){}
 const s={id:++E.sid,x:st.x,y:st.y,land:st.L.land,f:st.L.fields,n,main:'auto',st:{grain:n*400},sv:5,sk:{},don:0,cart:0,hap:60,ow:0,away:0,an:0,prod:0,hun:0};const F=ecoFields();for(const i of s.f)F[i]=1;E.steads.push(s);E._wc=1;ECOFC.delete(s.id);return s}
// ---- tick ----
function ecoTick(){if(!S.eco)return;const E=S.eco;
 {const sn=soldN();if(E._sol!=null&&sn<E._sol)S.pop=Math.max(1,S.pop-(E._sol-sn));E._sol=sn}
 if(S.t%ECO_K)return;if(!ecoOn())return;const k=ECO_K,EM=evMods(),hm=Math.max(.6,Math.min(1.2,hapMul())),led=E.led;
 if(S.t%60===0)ecoSync();
 // steads produce & eat (families use everything on their land except ore)
 for(const s of E.steads){const kids=Math.floor(s.n*.35),w=Math.max(1,s.n-kids),aw=s.away>S.t?Math.min(w-.5,s.an):0,fr=Math.min(1,s.f.length/(8+w*5));
  const lab=(w-aw)*hm*(.5+.5*fr)*k*(s.ow>0?.95:1),L=LAND[s.land].out;for(const g in L){const q=L[g]*lab*(g==='grain'||g==='flax'?EM.farm:1);s.st[g]=(s.st[g]||0)+q;s.prod+=q*EIT[g].v}
  let need=s.n*.4*k;for(const g of ECOFOOD){const h=s.st[g]||0,u=Math.min(h,need*(g==='grain'?1:.5));s.st[g]=h-u;need-=u}if(need>0){const h=s.st.grain||0,u=Math.min(h,need);s.st.grain=h-u;need-=u}if(need>.01)s.hun+=need;
  for(const g of['wool','flax','timber','clay'])if(s.st[g])s.st[g]-=Math.min(s.st[g],s.n*.025*k);
  for(const g in s.st){const r=EIT[g].rot;if(r)s.st[g]*=1-r*1.4*k}}
 // tithe carriers arrive at the Holding
 if(E.car.length){const now=S.t;E.car=E.car.filter(c=>{if(c.eta>now)return true;for(const g in c.g){E.hold[g]=(E.hold[g]||0)+c.g[g];led.tithe+=c.g[g]*EIT[g].v}return false})}
 // crafters (town households)
 const crowd=townCrowd();for(const c of E.cr){const C=CRAFT[c.c];let out=.2*k*(.6+c.sk*.12)*crowd*(c.ref?.85:1)*hm;
  if(C.need==='ore'){const u=Math.min(S.res.copper||0,out*.3),t=Math.min(S.res.tin||0,out*.15);if(u>=out*.3*.99&&t>=out*.15*.99&&c.ag>(u+t)*.05){S.res.copper-=u;S.res.tin-=t;c.ag-=(u+t)*.05;E.silver+=(u+t)*.05;led.sIn+=(u+t)*.05;led.ore+=(u+t)*.05}else out*=.25}
  else{const nd=out*.5,src=(E.mkt[C.need]||0)>=nd?E.mkt:E.hold;if((src[C.need]||0)>=nd){src[C.need]-=nd;if(src===E.hold){const pz=nd*EIT[C.need].v;c.ag-=pz;E.silver+=pz;led.sIn+=pz}}else out*=.3}
  c.stk=(c.stk||0)+out;c.made=(c.made||0)+out;
  const fd=c.n*.4*k,fv=fd*EIT.grain.v,mk=Math.min(E.mkt.grain||0,fd);if(mk>0){E.mkt.grain-=mk;c.ag-=mk*EIT.grain.v*.8}const rest=fd-mk;if(rest>0){const p=rest*EIT.grain.v;if(c.ag>=p){c.ag-=p;E.silver+=p;led.sIn+=p;led.food+=p}else c.hun+=k}
  if(c.ag<0)c.ag=0}
 // royal wages paid in tithe goods (soldiers, royal miners, household, drill)
 {const W=soldN()+(S.jobs.coppermin||0)+(S.jobs.tinmin||0)+E.house*6+(E.drill?soldN()*.5:0);let due=W*.0012*k;const due0=due;for(const g of ECOWAGE){if(due<=0)break;const h=E.hold[g]||0;if(!h)continue;const u=Math.min(h,due/EIT[g].v);E.hold[g]=h-u;due-=u*EIT[g].v}led.wages+=due0-Math.max(0,due);if(due>due0*.25&&W>0)E.unpd=(E.unpd||0)+k;else E.unpd=Math.max(0,(E.unpd||0)-k);E.unpaid=E.unpd>DAYLEN*.5?1:0;
  if(E.drill&&!E.unpaid&&S.t%DAYLEN===0)for(const c of S.companies)if(!c.merc&&c.xp<70)c.xp=Math.min(70,c.xp+2)}
 // royal granary: Holding feeds the city stores (tithe pays for army upkeep)
 {const C=cap();if(S.res.food<C*.7){let want=C*.7-S.res.food;for(const g of['fish','dairy','grain']){const h=E.hold[g]||0,u=Math.min(h,want);if(u>0){E.hold[g]=h-u;S.res.food+=u;want-=u}}}
  if(S.res.wood<C*.5&&E.hold.timber>0){const u=Math.min(E.hold.timber,C*.5-S.res.wood);E.hold.timber-=u;S.res.wood+=u}}
 // spoilage everywhere (slowed by proper storage)
 {const sf=spoilF(),cp=holdCap(),tot=holdTot(),over=tot>cp?(tot-cp)/tot:0;for(const g in E.hold){const h=E.hold[g];if(h<=0){delete E.hold[g];continue}const r=EIT[g].rot*sf*k+over*.0006*k;if(r>0){const l=h*Math.min(.5,r);E.hold[g]=h-l;led.spoil+=l*EIT[g].v}}
  for(const g in E.mkt){const r=EIT[g].rot*2.2*k;if(r){const l=E.mkt[g]*r;E.mkt[g]-=l;led.spoil+=l*EIT[g].v}}
  const fr=.000025*k/(1+cnt('granary')*.5+cnt('storehouse')*.2);const fl=S.res.food*fr;S.res.food-=fl;led.spoil+=fl*EIT.grain.v}
 // auto-grant steads to idle families
 if(E.autoStead&&S.t%(DAYLEN/3|0)<k&&S.pop-employed()>=4&&S.tier>=1){if(foundStead(3,'idle'))log('A stead was granted to an idle family. They will farm it and bring the tithe each year.')}
 if(E._wc){E._wc=0;worldChanged()}
 E.yt+=k;if(E.yt>=yearLen()){E.yt=0;ecoYear()}
 if(E._qv&&E._qv.length){for(let j=0;j<2&&E._qv.length;j++)ecoSpawnVis(E._qv.shift())}}
function townCrowd(){const E=S.eco,n=E.cr.length+E.mh.length,cap=Math.max(6,(cnt('palace')?24:12)+cnt('market')*4+cnt('storehouse')*2+cnt('barracks')*2+S.tier*6);E._tcap=cap;return n>cap*.85?Math.max(.5,1-(n/cap-.85)):1}
function ecoSync(){const E=S.eco,K=new Set(),C=new Set();for(const b of S.bl){if(b.t==='stead')K.add(b.x+','+b.y);else if(b.t==='craft')C.add(b.x+','+b.y)}
 const ns=E.steads.filter(s=>K.has(s.x+','+s.y));if(ns.length!==E.steads.length){E.steads=ns;ECOF=null;log('A stead was lost; the family moved back to town.')}
 const nc=E.cr.filter(c=>C.has(c.x+','+c.y)),nm=E.mh.filter(c=>C.has(c.x+','+c.y));if(nc.length!==E.cr.length||nm.length!==E.mh.length){E.cr=nc;E.mh=nm}
 while(employed()>S.pop&&E.steads.some(s=>s.n>1)){const s=E.steads.filter(s=>s.n>1).sort((a,b)=>b.n-a.n)[0];s.n--}}
function ecoMainItem(s){if(s.main!=='auto'&&LAND[s.land].out[s.main])return s.main;let b='grain',bv=-1;const L=LAND[s.land].out;for(const g in L){const v=L[g]*EIT[g].v;if(v>bv){bv=v;b=g}}return b}
// ---- the tithe year ----
function ecoYear(){const E=S.eco,led=E.led,T=E.tithe/100,hb=holdB(),hd=hb?doorOf(hb):hubT();
 E._qv=[];let shown=0;
 for(const s of E.steads){let owe=T*s.prod+s.ow;const load={};const pay=g=>{const h=s.st[g]||0;if(h<=0||owe<=0)return;const u=Math.min(h,owe/EIT[g].v);s.st[g]=h-u;load[g]=(load[g]||0)+u;owe-=u*EIT[g].v};
  const m=ecoMainItem(s);pay(m);// keep 2 days of food when paying with other goods
  const res=s.n*.4*DAYLEN*2;for(const g of Object.keys(s.st).sort((a,b)=>EIT[b].v-EIT[a].v)){if(g===m)continue;if(EIT[g].food){const h=s.st[g];if(h>res){const keep=s.st[g];s.st[g]=h-res;pay(g);s.st[g]+=Math.min(res,keep)}}else pay(g)}
  s.ow=owe>.01?owe*.5:0;if(s.ow)led.arrears+=owe;
  let units=0;for(const g in load)units+=load[g];if(units>0){const capP=1500*(s.cart?4:s.don?2.2:1),kids=Math.floor(s.n*.35),w=Math.max(1,s.n-kids),car=Math.min(w,Math.max(1,Math.ceil(units/capP))),d=Math.hypot(s.x-hd.x,s.y-hd.y),eta=Math.max(40,Math.round(d*1.45/.9));
   s.away=S.t+eta*2;s.an=car;E.car.push({s:s.id,g:load,eta:S.t+eta});if(shown<50){shown++;E._qv.push({x:s.x+1,y:s.y+2,tx:hd.x,ty:hd.y,n:Math.min(3,car),don:s.cart?2:s.don?1:0})}s.lastT=Math.round(units)}
  // wages = what is left: surplus bartered at the market into savings
  const res2=s.n*.4*DAYLEN*1.5;let sv=0;for(const g in s.st){const keep=EIT[g].food?res2*(g==='grain'?1:.3):s.n*40,ex=s.st[g]-keep;if(ex>0){s.st[g]-=ex;sv+=ex*EIT[g].v*.7;E.mkt[g]=(E.mkt[g]||0)+ex*.6}}
  s.sv=s.sv*.92+sv;s.wage=sv;
  if(!s.don&&s.sv>=30){s.don=1;s.sv-=30}else if(s.don&&!s.cart&&s.sv>=70){s.cart=1;s.sv-=70}
  const hungry=s.hun>s.n*.4*DAYLEN*.5;s.hap=Math.max(5,Math.min(95,62-(E.tithe-20)*1.3-(hungry?22:0)-(s.ow?8:0)+(s.don?3:0)+(s.cart?2:0)+Math.min(8,s.sv/12)));
  if(hungry){if(s.n>2&&Math.random()<.6){s.n--;S.pop=Math.max(1,S.pop-1);led.starve++}}else if(s.n<8&&Math.random()<.5*(s.hap/60)){s.n++;S.pop++;led.born++}
  // skill growth: basic homestead skills, one craft leaning by land
  const aff=LAND[s.land].sk;for(const c of aff)s.sk[c]=(s.sk[c]||1)+(.3+Math.min(.7,s.sv/60))*Math.random()*(c===aff[0]?1.3:.8);
  s.hun=0;s.prod=0}
 // risers: one per craft per year from the best-qualified stead
 E.riseY={};for(const c in CRAFT){const cand=E.steads.filter(s=>s.n>=5&&s.sv>=20&&(s.sk[c]||0)>=3&&s.hap>35).sort((a,b)=>(b.sk[c]+b.sv/20)-(a.sk[c]+a.sv/20))[0];if(!cand)continue;
  const t=ecoTown();if(!t)break;const b={t:'craft',l:1,x:t.X,y:t.Y};S.bl.push(b);rebuildOcc();try{autoRoadFor(b)}catch(e){}E._wc=1;
  cand.n--;const ag=cand.sv*.5;cand.sv-=ag;E.cr.push({id:++E.sid,c,n:2,sk:Math.min(5,cand.sk[c]),ag,stk:0,x:t.X,y:t.Y,hun:0,ref:0,from:cand.id});cand.sk[c]=1;S.pop++;led.risers++;E.riseY[c]=1;log('A skilled '+CRAFT[c].n.toLowerCase()+' left a stead and set up a household in town.')}
 // town markets: serfs and crafters buy crafted goods; crown patronage at a premium
 let demand=0;for(const s of E.steads){const sp=s.sv*.25;demand+=sp;s.sv-=sp}for(const c of E.cr)c.sk=Math.min(9,c.sk+.25);
 let supV=0;for(const c of E.cr)supV+=c.stk*EIT[CRAFT[c.c].g].v;
 if(supV>0){const pr=Math.min(1,E.patron/100),pv=supV*pr;let paidV=0,dueV=pv*1.5;for(const g of['grain','dairy','fish','timber','clay','flax','wool']){if(dueV<=0)break;const h=E.hold[g]||0,u=Math.min(h,dueV/EIT[g].v);E.hold[g]=h-u;dueV-=u*EIT[g].v;paidV+=u*EIT[g].v}const got=paidV/1.5/(pv||1);led.patron+=paidV;
  const sellV=supV*(1-pr*Math.min(1,got)),mf=Math.min(1,(demand+E.mh.length*20)/Math.max(1,sellV));
  for(const c of E.cr){const g=CRAFT[c.c].g,v=c.stk*EIT[g].v;const toC=c.stk*pr*Math.min(1,got);E.hold[g]=(E.hold[g]||0)+toC;c.ag+=toC*EIT[g].v*1.5;const rest=(c.stk-toC);c.ag+=rest*EIT[g].v*mf;c.sold=rest*mf;c.stk=rest*(1-mf)*.5}
  E._goods=Math.min(1,demand>0?Math.min(sellV,demand)/Math.max(1,demand):0)}
 // crafters: hunger, refused charters leave, petitions for a merchant charter
 E.cr=E.cr.filter(c=>{if(c.hun>yearLen()*.4||(c.ref&&Math.random()<.3)){S.pop=Math.max(1,S.pop-c.n);led.left++;ecoRemoveB(c);log('A '+CRAFT[c.c].n.toLowerCase()+' household left the city'+(c.ref?' after their charter was refused.':' — they could not afford food.'));return false}c.hun=0;
  if(!c.ref&&c.ag>=60&&c.sk>=4.5&&!E.pet.includes(c.id))E.pet.push(c.id);return true});
 if(E.autoCh)for(const id of E.pet.slice()){if(E.mh.length>=E.charters)break;grantCharter(id)}
 // merchant houses: buy Holding surplus for silver, resell in town, pay merchant tax
 const cp=holdCap();let surplus=0;if(E.sell<100){surplus=Math.max(0,holdTot()-cp*E.sell/100)}
 for(const m of E.mh){let spent=0;if(surplus>0){const bud=m.ag*.6;for(const g of Object.keys(E.hold).sort((a,b)=>EIT[a].rot-EIT[b].rot).reverse()){if(surplus<=0||spent>=bud)break;const h=E.hold[g],u=Math.min(h,surplus,(bud-spent)/(EIT[g].v*.8));if(u<=0)continue;E.hold[g]=h-u;surplus-=u;spent+=u*EIT[g].v*.8}}
  m.ag-=spent;E.silver+=spent;led.sIn+=spent;led.sold+=spent;
  const dem=demand*.15+E.cr.reduce((a,c)=>a+c.ag*.08,0)/Math.max(1,E.mh.length)+25,rev=Math.min(spent*1.18+12,dem+spent*.9),profit=rev-spent;
  for(const c of E.cr)c.ag-=c.ag*.08/Math.max(1,E.mh.length)*Math.min(1,rev/Math.max(1,dem));
  m.ag+=rev;let tax=Math.max(0,profit)*E.mtax/100;if(E.mtax>30)tax*=1-Math.min(.6,(E.mtax-30)/40);m.ag-=tax;E.silver+=tax;led.sIn+=tax;led.mtax+=tax;m.last={spent,rev,tax};
  if(E.mtax>30&&Math.random()<(E.mtax-30)/80){m.gone=1}}
 E.mh=E.mh.filter(m=>{if(!m.gone)return true;S.pop=Math.max(1,S.pop-m.n);ecoRemoveB(m);led.left++;log('A merchant house left the region over the merchant tax, taking its silver.');return false});
 // markets are built by the people
 if(E.mh.length&&cnt('market')<Math.ceil(E.mh.length/2)&&S.tier>=1){const hb2=holdB();if(autoPlace('market',1,true,hb2?hb2.x+1:undefined,hb2?hb2.y+1:undefined)){E._wc=1;log('The merchant houses built a market.')}}
 // landless families arrive and ask for land (prosperity draws migrants)
 const H=S.hap||50;if(E.autoStead&&H>45&&E.tithe<=32){const k2=Math.min(6,1+Math.floor(E.steads.length/8));let a=0;for(let i=0;i<k2;i++)if(Math.random()<(H-40)/45&&foundStead(3+(Math.random()<.4?1:0),'mig')){a++;const s=E.steads[E.steads.length-1];S.pop+=s.n;led.arrived+=s.n}if(a)log(a+' landless famil'+(a>1?'ies':'y')+' arrived and received steads.')}
 // mercenaries are paid in silver once a year
 for(const c of S.companies)if(c.merc){const due=c.men*1.5;if(E.silver>=due){E.silver-=due;led.sOut+=due}else{c.men=Math.floor(c.men/2);log('Unpaid mercenaries deserted ('+c.name+').')}}S.companies=S.companies.filter(c=>c.men>0);E._sol=soldN();
 const rec={yr:E.yr,tithe:Math.round(led.tithe),spoil:Math.round(led.spoil),silver:Math.round(E.silver),hold:Math.round(holdVal()),steads:E.steads.length,serfs:serfN(),cr:E.cr.length,mh:E.mh.length,pop:S.pop,hap:Math.round(S.hap||50)};E.hist.push(rec);if(E.hist.length>20)E.hist.shift();
 E.last=Object.assign({},led,{yr:E.yr});E.led=ecoLed();
 log('Tithe Day, year '+E.yr+': '+E.steads.length+' steads sent their tithe (worth '+fmtS(led.tithe)+' silver) to the Imperial Holding. Spoiled this year: '+fmtS(led.spoil)+'.');E.yr++;try{AU.sfx('chime')}catch(e){}}
function ecoRemoveB(c){const i=S.bl.findIndex(b=>b.t==='craft'&&b.x===c.x&&b.y===c.y);if(i>=0){S.bl.splice(i,1);S.eco._wc=1}}
function ecoTown(){const a=S.bl.find(b=>b.t==='palace')||holdB()||S.bl.find(b=>b.t==='barracks')||hubB();const sv=CURFP;CURFP=null;try{const c={x:a?a.x+1:S.center.x,y:a?a.y+1:S.center.y},R=RAD[S.tier]+1;let best=null,bs=-1e9;
 const anchors=S.bl.filter(b=>b.t==='palace'||b.t==='holding'||b.t==='barracks'||b.t==='storehouse'||b.t==='granary'||b.t==='market'||b.t==='craft');
 for(let k=0;k<220;k++){const X=c.x+Math.round((Math.random()-.5)*2*R),Y=c.y+Math.round((Math.random()-.5)*2*R);if(placeErr('craft',X,Y,true))continue;if(!gapOk(X,Y,2))continue;let dm=1e9;for(const b of anchors)dm=Math.min(dm,Math.abs(b.x-X)+Math.abs(b.y-Y));const sc=-dm*1.2-Math.hypot(X-c.x,Y-c.y)*.3+Math.random()*2+(touchXY(X,Y,2)?3:0);if(sc>bs){bs=sc;best={X,Y}}}return best}finally{CURFP=sv}}
function grantCharter(id){const E=S.eco,i=E.cr.findIndex(c=>c.id===id);E.pet=E.pet.filter(x=>x!==id);if(i<0)return;if(E.mh.length>=E.charters){log('No charters left — raise the charter limit on the Taxes page.');return}const c=E.cr.splice(i,1)[0];
 E.mh.push({id:c.id,n:3,ag:c.ag,x:c.x,y:c.y,from:c.c});S.pop++;const b=S.bl.find(b=>b.t==='craft'&&b.x===c.x&&b.y===c.y);if(b){b.l=3;b.mh=1}E.led.merch++;E._wc=1;log('Charter granted: the '+CRAFT[c.c].n.toLowerCase()+' household became a merchant house.')}
function refuseCharter(id){const E=S.eco,c=E.cr.find(c=>c.id===id);E.pet=E.pet.filter(x=>x!==id);if(c){c.ref=1;log('Charter refused. The household is resentful (−15% output) and may leave.')}}
function ecoTopTxt(){if(!S.eco||!holdB())return'';const d=Math.ceil((yearLen()-S.eco.yt)/DAYLEN);return' · Yr '+S.eco.yr+' · Tithe in '+d+'d'}
function ecoProd(p){if(!S.eco)return;const mf=mineF();p.copper*=mf;p.tin*=mf;if(p.wood>0)p.wood*=1+Math.min(.3,crN('carpenter')*.03)}
function ecoHap(add){if(!S.eco)return;const E=S.eco;add('Tithe '+E.tithe+'%',Math.max(-26,Math.min(6,(20-E.tithe)*.65)));if(!holdB())return;
 if(E.steads.length){let h=0;for(const s of E.steads)h+=s.hap;add('Serf steads content',(h/E.steads.length-50)/6)}if(E.unpaid)add('Royal wages unpaid',-6);add('Royal household',E.house*2-1);
 add('Goods in the markets',Math.min(6,E.mh.length+(E._goods||0)*3));add('Weavers & brewers',Math.min(5,crN('weaver'))+Math.min(4,crN('brewer')));if(E.mtax>35)add('Merchants grumble',-2)}
// ---- silver & tithe spending ----
const ECOBUY={
 festival:{n:'Festival',d:'+10 happiness for a while',s:40,f:()=>{S.ev.act.push({id:'festival',left:240});vis.party=8}},
 park:{n:'Public park',d:'A garden built by the crown (+desirability)',s:30,f:()=>autoPlace('garden',1,true)},
 fountain:{n:'Fancy fountain',d:'Public fountain-well (clean water, +desirability)',s:60,f:()=>autoPlace('well',1,true)},
 statue:{n:'Bronze monument',d:'A statue for the people',s:90,f:()=>autoPlace('statue',1,true)},
 mercs:{n:'Hire 8 mercenaries',d:'Spearmen for silver (1.5 silver/man/yr). Not from your people.',s:50,f:()=>{S.cid=(S.cid||0)+1;S.companies.push({id:S.cid,name:'Sea-Folk '+S.cid,type:'spear',men:8,xp:35,armor:0,slot:defSlot('spear'),merc:1});return 1}},
 store:{n:'Holding storehouses',d:'Imperial upgrade: +15k storage, slower spoilage',s:()=>80*(S.eco.storL+1),ok:()=>S.eco.storL<4,f:()=>{S.eco.storL++;return 1}},
 temple:{n:'Fancier temple',d:'Upgrade your temple one level',s:120,ok:()=>S.bl.some(b=>b.t==='temple'&&b.l<5),f:()=>{const b=S.bl.find(b=>b.t==='temple'&&b.l<5);b.l++;return 1}},
 palace:{n:'Grander palace',d:'Upgrade your palace one level',s:250,ok:()=>S.bl.some(b=>b.t==='palace'&&b.l<5),f:()=>{const b=S.bl.find(b=>b.t==='palace'&&b.l<5);b.l++;return 1}}};
function ecoBuy(k){const B=ECOBUY[k],E=S.eco,c=typeof B.s==='function'?B.s():B.s;if(E.silver<c||(B.ok&&!B.ok()))return;const r=B.f();if(r===false){log('No room for '+B.n.toLowerCase()+'.');return}E.silver-=c;E.led.sOut+=c;worldChanged();log(B.n+' paid with '+c+' silver.')}
function mineCost(){return Math.round(150*Math.pow(S.eco.mineL+1,1.4))}
function ecoMineUp(){const E=S.eco,c=mineCost();if(E.mineL>=3||holdVal()<c)return;let due=c;for(const g of ECOWAGE){if(due<=0)break;const h=E.hold[g]||0,u=Math.min(h,due/EIT[g].v);E.hold[g]=h-u;due-=u*EIT[g].v}E.mineL++;log('Royal mines upgraded to level '+E.mineL+' (+'+E.mineL*25+'% copper & tin), paid from the tithe stores.')}
// ---- tithe carriers (visual only; deliveries are tracked in S.eco.car so saves are safe) ----
const ECOV=[];function ecoSpawnVis(q){if(typeof astar!=='function')return;const p=astar(q.x,q.y,q.tx,q.ty);if(!p||!p.length)return;for(let i=0;i<q.n;i++)ECOV.push({x:q.x+i*.3,y:q.y,route:p.map(o=>({x:o.x,y:o.y})),o:OUTFIT.farmer,dir:0,ft:i*3,idx:i,carry:'grain',don:i===0?q.don:0,role:'farmer'})}
function ecoVis(D,dt,z,inV,now){for(let j=ECOV.length-1;j>=0;j--){const m=ECOV[j];if(!m.route.length){ECOV.splice(j,1);continue}const p=m.route[0],dx=p.x-m.x,dy=p.y-m.y,d=Math.hypot(dx,dy),sp=.9*dt*(m.don?1.1:1);m.dir=dirOf(dx,dy);m.ft+=dt*7;if(d<=sp){m.x=p.x;m.y=p.y;m.route.shift()}else{m.x+=dx/d*sp;m.y+=dy/d*sp}
  if(z<.5)continue;const P=isoP(m.x,m.y);if(!inV(P.x,P.y))continue;D.push({k:P.y,f:()=>drawAgent(m,P,true,now)});if(m.don){const c={k:'donkey',x:m.x-(dx>0?.9:-.9),y:m.y+.1,dir:dx>0?1:-1,tx:p.x,ty:p.y};D.push({k:P.y-1,f:()=>{critDraw(c,now);const X=c.x*TS,Y=c.y*TS;rr(vx,X-5,Y-9,10,5,1,'#c8a860',OUTL,.6);if(m.don>1){rr(vx,X-(c.dir>0?16:-6),Y-6,10,6,1,'#8a6038',OUTL,.6);circ(vx,X-(c.dir>0?11:-11),Y+1,2.4,'#5a4028',OUTL,.6)}}})}}}
// ---- stead fields (procedural plots, cached per stead) ----
const ECOFC=new Map();const CROPC={grain:['#c8a640','#b89434','#d8b850'],flax:['#6e9a5a','#5e8a4e','#88a8d8'],wool:['#86a84e','#7a9a46','#f0ecd8'],dairy:['#7ea04a','#6e9042','#f8f0e0'],clay:['#a8683e','#8a5432','#c88454'],timber:['#7a8a3a','#6a7a32','#8a6038'],fish:['#9aa860','#8a9850','#7aa8c0']};
function steadCanvas(s){let e=ECOFC.get(s.id);if(e&&e.n===s.f.length&&e.sig===chunkSig)return e;let x0=1e9,y0=1e9,x1=-1,y1=-1;for(const i of s.f){const x=i%MW,y=i/MW|0;if(x<x0)x0=x;if(y<y0)y0=y;if(x>x1)x1=x;if(y>y1)y1=y}if(x1<0)return null;
 const P=16,[c,g]=mk((x1-x0+1)*P,(y1-y0+1)*P),set=new Set(s.f),L=LAND[s.land].out,crops=Object.keys(L).filter(k=>k!=='fish'&&k!=='timber');if(!crops.length)crops.push('grain');const wt=crops.map(k=>L[k]),tw=wt.reduce((a,b)=>a+b,0);
 const hz=hsh(s.x,s.y,5)<.5,cropAt=(x,y)=>{const u=hz?(y-y0)/(y1-y0+1):(x-x0)/(x1-x0+1);let a=0;for(let k=0;k<crops.length;k++){a+=wt[k]/tw;if(u<a+1e-6)return crops[k]}return crops[0]};
 for(const i of s.f){if(occ[i]||roadSet[i])continue;const x=i%MW,y=i/MW|0,X=(x-x0)*P,Y=(y-y0)*P,cp=cropAt(x,y),C=CROPC[cp]||CROPC.grain;g.fillStyle=C[hsh(x,y,7)<.5?0:1];g.fillRect(X,Y,P,P);g.globalAlpha=.55;g.strokeStyle=C[1];g.lineWidth=1.2;g.beginPath();
  if(cp==='grain'||cp==='flax'){for(let q=2;q<P;q+=4){if(hz){g.moveTo(X,Y+q);g.lineTo(X+P,Y+q)}else{g.moveTo(X+q,Y);g.lineTo(X+q,Y+P)}}g.stroke();if(cp==='flax'){g.fillStyle=C[2];for(let q=0;q<3;q++)g.fillRect(X+hsh(x,y,q)*14,Y+hsh(y,x,q)*14,2,2)}}
  else if(cp==='clay'){g.fillStyle=C[1];g.fillRect(X+3,Y+3,6,5);g.fillStyle=C[2];g.fillRect(X+9,Y+9,4,4)}else{g.fillStyle=C[2];if(hsh(x,y,3)<.35){g.globalAlpha=.9;g.beginPath();g.ellipse(X+8,Y+8,3,2,0,0,7);g.fill()}}g.globalAlpha=1}
 g.strokeStyle='#6a4a2a';g.lineWidth=1.5;g.beginPath();for(const i of s.f){const x=i%MW,y=i/MW|0,X=(x-x0)*P,Y=(y-y0)*P;if(!set.has(i-MW)){g.moveTo(X,Y+.75);g.lineTo(X+P,Y+.75)}if(!set.has(i+MW)){g.moveTo(X,Y+P-.75);g.lineTo(X+P,Y+P-.75)}if(!set.has(i-1)){g.moveTo(X+.75,Y);g.lineTo(X+.75,Y+P)}if(!set.has(i+1)){g.moveTo(X+P-.75,Y);g.lineTo(X+P-.75,Y+P)}}g.stroke();
 e={c,x0,y0,w:x1-x0+1,h:y1-y0+1,n:s.f.length,sig:chunkSig};ECOFC.set(s.id,e);if(ECOFC.size>160){const k=ECOFC.keys().next().value;ECOFC.delete(k)}return e}
function ecoDrawFields(vl,vr,vt,vb,z){if(!S.eco||!S.eco.steads.length)return;let bud=6;for(const s of S.eco.steads){const X=(s.x-7)*TS,Y=(s.y-7)*TS;if(X>vr||X+15*TS<vl||Y>vb||Y+15*TS<vt)continue;let e=ECOFC.get(s.id);if(!e||e.n!==s.f.length||e.sig!==chunkSig){if(bud--<=0&&e){}else e=steadCanvas(s)}if(!e)continue;vx.globalAlpha=.92;vx.drawImage(e.c,e.x0*TS,e.y0*TS,e.w*TS,e.h*TS);vx.globalAlpha=1}}
// ---- inspector ----
function ecoInsp(b,d,r){const E=S.eco;if(!E)return;const ad=h=>d.insertAdjacentHTML('beforeend',h);
 if(b.t==='stead'){r.innerHTML='';const s=E.steads.find(s=>s.x===b.x&&s.y===b.y);if(!s)return;const m=ecoMainItem(s);ad('<br><b>Family of '+s.n+'</b> · '+LAND[s.land].n+' · '+s.f.length+' field tiles<br>Main tithe item: <b>'+EIT[m].n+'</b>'+(s.main==='auto'?' (auto)':'')+'<br>Stores: '+Object.keys(s.st).filter(g=>s.st[g]>1).map(g=>Math.round(s.st[g])+' '+EIT[g].n.toLowerCase()).join(', ')+'<br>Savings: '+fmtS(s.sv)+' · '+(s.cart?'donkey & cart':s.don?'a donkey':'no animals')+'<br>Mood: '+Math.round(s.hap)+'%'+(s.ow?' · <span style="color:#ff9070">owes '+fmtS(s.ow)+' tithe</span>':'')+(s.lastT?'<br>Last tithe: '+s.lastT+' goods carried':'')+'<br>Skills: homestead'+Object.keys(s.sk).map(c=>', '+CRAFT[c].n.toLowerCase()+' '+s.sk[c].toFixed(1)).join(''));
  const opts=['auto'].concat(Object.keys(LAND[s.land].out));opts.forEach(o=>r.appendChild(btn(o==='auto'?'Auto':EIT[o].n,()=>{s.main=o;showInsp()},0,s.main===o?'sel':'')))}
 else if(b.t==='craft'){r.innerHTML='';const c=E.cr.find(c=>c.x===b.x&&c.y===b.y),m=E.mh.find(c=>c.x===b.x&&c.y===b.y);if(c)ad('<br><b>'+CRAFT[c.c].n+'</b> household ('+c.n+') · skill '+c.sk.toFixed(1)+'<br>Silver: '+fmtS(c.ag)+' · makes '+EIT[CRAFT[c.c].g].n.toLowerCase()+'<br>'+CRAFT[c.c].fx+(c.ref?'<br><span style="color:#ff9070">Charter refused — resentful</span>':'')+(E.pet.includes(c.id)?'<br><b>Petitioning for a merchant charter</b>':''));
  if(m)ad('<br><b>Merchant house</b> (chartered) · silver '+fmtS(m.ag)+(m.last?'<br>Last year: bought '+fmtS(m.last.spent)+', sold '+fmtS(m.last.rev)+', tax '+fmtS(m.last.tax):''));if(c&&E.pet.includes(c.id)){r.appendChild(btn('Grant charter',()=>{grantCharter(c.id);showInsp()},E.mh.length>=E.charters));r.appendChild(btn('Refuse',()=>{refuseCharter(c.id);showInsp()}))}}
 else if(b.t==='holding'){r.innerHTML='';ad('<br>Treasury: <b>'+fmtS(E.silver)+' silver</b> + goods worth '+fmtS(holdVal())+'<br>Storage '+Math.round(holdTot())+' / '+holdCap()+(holdTot()>holdCap()?' <span style="color:#ff9070">overflowing!</span>':''));r.appendChild(btn('Open Taxes & Treasury',()=>openTab('taxes')))}}
/*ECO END*/
