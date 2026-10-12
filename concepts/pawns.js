// ===================== pawn layers =====================
const OL='#1b130c';
const BODY={thin:{sw:.25,bw:.21,h:.6},average:{sw:.29,bw:.25,h:.62},hulk:{sw:.36,bw:.27,h:.66},fat:{sw:.3,bw:.33,h:.62,belly:1},female:{sw:.25,bw:.28,h:.6,waist:1}};
function bodyPath(g,b,fc,s){const B=BODY[b],k=fc==='E'?.72:1,sw=B.sw*s*k,bw=B.bw*s*k,h=B.h*s,t=-h/2,bt=h/2;g.beginPath();
 g.moveTo(-sw*.55,t);g.quadraticCurveTo(-sw,t,-sw,t+h*.22);
 if(B.waist)g.quadraticCurveTo(-sw*.82,t+h*.5,-bw,t+h*.75);else if(B.belly)g.quadraticCurveTo(-bw*1.15,t+h*.55,-bw,t+h*.8);else g.lineTo(-bw,t+h*.75);
 g.quadraticCurveTo(-bw,bt,-bw*.5,bt);g.lineTo(bw*.5,bt);g.quadraticCurveTo(bw,bt,bw,t+h*.75);
 if(B.waist)g.quadraticCurveTo(sw*.82,t+h*.5,sw,t+h*.22);else if(B.belly)g.quadraticCurveTo(bw*1.15,t+h*.55,sw,t+h*.22);else g.lineTo(sw,t+h*.22);
 g.quadraticCurveTo(sw,t,sw*.55,t);g.closePath();return{sw,bw,h,t,bt}}
function shade(g,x,y,w,h,s){const gr=g.createLinearGradient(x-w,y,x+w,y);gr.addColorStop(0,'rgba(255,245,220,.16)');gr.addColorStop(.45,'rgba(255,255,255,0)');gr.addColorStop(1,'rgba(0,0,0,.22)');g.fillStyle=gr;g.fillRect(x-w*1.5,y-h,w*3,h*2);const g2=g.createLinearGradient(0,y+h*.2,0,y+h*.5);g2.addColorStop(0,'rgba(0,0,0,0)');g2.addColorStop(1,'rgba(0,0,0,.15)');g.fillStyle=g2;g.fillRect(x-w*1.5,y-h,w*3,h*2)}
function apparel(g,a,d,fc,s){const{sw,bw,h,t,bt}=d,W=Math.max(sw,bw)*1.3,c=a.c,lw=Math.max(1,s*.025);
 const band=(y0,y1,col)=>{g.fillStyle=col;g.fillRect(-W,t+h*y0,W*2,h*(y1-y0))};
 const hl=(y,col,w)=>{g.strokeStyle=col;g.lineWidth=w||lw;g.beginPath();g.moveTo(-W,t+h*y);g.lineTo(W,t+h*y);g.stroke()};
 switch(a.k){
 case'kilt':band(.55,1.05,c);hl(.55,a.t||sh(c,-.3),lw*1.6);if(fc!=='N'){g.fillStyle=sh(c,-.12);g.beginPath();g.moveTo(-sw*.1,t+h*.57);g.lineTo(sw*.25,bt);g.lineTo(-sw*.05,bt);g.closePath();g.fill()}break;
 case'shirt':band(-.1,.6,c);if(a.t)hl(.6,a.t,lw*1.5);break;
 case'tunic':band(-.1,1.05,c);if(a.t){hl(.95,a.t,lw*2);g.strokeStyle=a.t;g.lineWidth=lw*1.5;if(fc==='S'){g.beginPath();g.arc(0,t,sw*.45,.15*Math.PI,.85*Math.PI);g.stroke()}}break;
 case'robe':band(-.1,1.1,c);for(let i=-2;i<=2;i++){g.strokeStyle='rgba(0,0,0,.12)';g.lineWidth=lw;g.beginPath();g.moveTo(i*W*.25,t+h*.35);g.lineTo(i*W*.3,bt);g.stroke()}if(a.t)hl(.97,a.t,lw*2.4);break;
 case'stripes':for(let i=0;i<5;i++)hl(.3+i*.14,i%2?a.c:a.t,lw*2.2);break;
 case'fringe':g.strokeStyle=a.c;g.lineWidth=lw*.8;for(let x=-W;x<W;x+=s*.035){g.beginPath();g.moveTo(x,t+h*(a.y||.9));g.lineTo(x,t+h*(a.y||.9)+h*.1);g.stroke()}hl(a.y||.9,a.c,lw*1.6);break;
 case'shawl':if(fc==='N'||fc==='S'){g.fillStyle=c;g.beginPath();g.moveTo(-W,t+h*.05);g.lineTo(-W,t+h*.3);g.lineTo(W,t+h*.75);g.lineTo(W,t+h*.45);g.closePath();g.fill();g.strokeStyle=a.t||sh(c,-.3);g.lineWidth=lw;g.stroke()}else band(.05,.5,c);if(a.spots){g.fillStyle='#3a2410';for(let i=0;i<9;i++){g.beginPath();g.arc(-W+i*W*.22,t+h*(.15+i*.065),s*.018,0,TAU);g.fill()}}break;
 case'collar':if(fc!=='N'){for(let i=3;i>=1;i--){g.strokeStyle=[a.t||'#2f6fa8',a.c,'#c8902c'][i-1];g.lineWidth=lw*1.7;g.beginPath();g.ellipse(0,t-h*.02,sw*(.45+i*.12),h*(.12+i*.07),0,.08*Math.PI,.92*Math.PI);g.stroke()}}else hl(.02,a.c,lw*2);break;
 case'scale':{const yy0=t+h*(a.y0||-.05),yy1=t+h*(a.y1||.62);g.fillStyle=c;g.fillRect(-W,yy0,W*2,yy1-yy0);const r=s*.032;let row=0;for(let y=yy0;y<yy1;y+=r*1.2,row++)for(let x=-W+(row%2)*r;x<W;x+=r*2){g.fillStyle=sh(c,(row%2?-.08:.06));g.beginPath();g.arc(x,y,r,0,Math.PI);g.fill();g.strokeStyle=sh(c,-.45);g.lineWidth=Math.max(.6,s*.008);g.stroke()}hl((yy1-t)/h,sh(c,-.4),lw*1.5);break}
 case'belt':hl(a.y||.55,c,lw*2.2);if(fc==='S'&&a.b){g.fillStyle=a.b;g.fillRect(-s*.035,t+h*(a.y||.55)-s*.025,s*.07,s*.05)}break;
 case'flounce':for(let i=0;i<4;i++){band(.5+i*.13,.63+i*.13,i%2?c:a.t);}hl(1.02,OL,lw);break;
 case'sash':g.strokeStyle=c;g.lineWidth=lw*3;g.beginPath();g.moveTo(-W*.8,t);g.lineTo(W*.8,t+h*.6);g.stroke();break;
 }}
function cloak(g,c,d,fc,s){const{sw,h,t}=d;g.fillStyle=c;g.strokeStyle=OL;g.lineWidth=Math.max(1,s*.03);g.beginPath();if(fc==='N'){g.moveTo(-sw*1.08,t+h*.05);g.quadraticCurveTo(-sw*1.25,t+h*1.05,0,t+h*1.12);g.quadraticCurveTo(sw*1.25,t+h*1.05,sw*1.08,t+h*.05);g.quadraticCurveTo(0,t-h*.08,-sw*1.08,t+h*.05)}else{g.moveTo(-sw*1.1,t+h*.02);g.quadraticCurveTo(-sw*1.3,t+h*.7,-sw*1.05,t+h*1.05);g.lineTo(sw*1.05,t+h*1.05);g.quadraticCurveTo(sw*1.3,t+h*.7,sw*1.1,t+h*.02);g.closePath()}g.fill();g.stroke()}
// head
const HEAD={w:.27,h:.29};
function headPath(g,fc,s){const w=HEAD.w*s*(fc==='E'?.92:1),h=HEAD.h*s;g.beginPath();if(fc==='E'){g.moveTo(-w,0);g.bezierCurveTo(-w,-h*1.05,w*.9,-h*1.1,w*.95,-h*.1);g.quadraticCurveTo(w*1.08,h*.2,w*.85,h*.5);g.bezierCurveTo(w*.6,h*1.05,-w,h*1.1,-w,0)}else g.ellipse(0,0,w,h,0,0,TAU);g.closePath();return{w,h}}
function drawHead(g,P,fc,s){const hd=headPath(g,fc,s),lw=Math.max(1,s*.03);g.fillStyle=P.skin;g.fill();g.save();g.clip();const gr=g.createRadialGradient(-hd.w*.35,-hd.h*.4,1,0,0,hd.w*1.3);gr.addColorStop(0,'rgba(255,240,220,.22)');gr.addColorStop(.6,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.25)');g.fillStyle=gr;g.fillRect(-hd.w*2,-hd.h*2,hd.w*4,hd.h*4);g.restore();headPath(g,fc,s);g.strokeStyle=OL;g.lineWidth=lw*1.2;g.stroke();
 const ey=hd.h*.12,e=Math.max(1.2,s*.028);g.fillStyle=OL;
 if(fc==='S'){[-1,1].forEach(sd=>{g.beginPath();g.ellipse(sd*hd.w*.36,ey,e*.8,e,0,0,TAU);g.fill();if(P.kohl){g.strokeStyle=OL;g.lineWidth=e*.6;g.beginPath();g.moveTo(sd*hd.w*.36,ey);g.lineTo(sd*hd.w*.62,ey-e*.4);g.stroke()}g.strokeStyle=P.brow||sh(P.hairC,-.2);g.lineWidth=e*.7;g.beginPath();g.moveTo(sd*hd.w*.2,ey-e*2.3);g.lineTo(sd*hd.w*.52,ey-e*2.6+(P.mood?sd*e:0));g.stroke()});if(s>60){g.strokeStyle=sh(P.skin,-.35);g.lineWidth=e*.5;g.beginPath();g.moveTo(-hd.w*.12,hd.h*.52);g.quadraticCurveTo(0,hd.h*.58,hd.w*.12,hd.h*.52);g.stroke()}}
 if(fc==='E'){g.beginPath();g.ellipse(hd.w*.5,ey,e*.8,e,0,0,TAU);g.fill();g.strokeStyle=P.brow||sh(P.hairC,-.2);g.lineWidth=e*.7;g.beginPath();g.moveTo(hd.w*.32,ey-e*2.4);g.lineTo(hd.w*.68,ey-e*2.5);g.stroke();if(P.kohl){g.lineWidth=e*.6;g.strokeStyle=OL;g.beginPath();g.moveTo(hd.w*.5,ey);g.lineTo(hd.w*.25,ey-e*.3);g.stroke()}}
 return hd}
function hairShape(g,st,fc,hd,front){const w=hd.w,h=hd.h;g.beginPath();
 if(st==='bald')return false;
 if(fc==='N'){if(st==='short'||st==='crop'){g.ellipse(0,-h*.05,w*1.03,h*1.0,0,0,TAU)}else{g.moveTo(-w*1.08,-h*.1);g.ellipse(0,-h*.1,w*1.08,h*1.02,0,Math.PI,TAU);g.lineTo(w*1.1,h*(st==='long'||st==='curls'?1.5:.9));g.quadraticCurveTo(0,h*(st==='long'||st==='curls'?1.8:1.1),-w*1.1,h*(st==='long'||st==='curls'?1.5:.9));g.closePath()}return true}
 if(fc==='S'){if(st==='crop'){g.ellipse(0,-h*.35,w*.98,h*.7,0,Math.PI*1.05,Math.PI*1.95);g.closePath();return true}
  g.moveTo(-w*1.05,st==='short'?-h*.05:h*.2);g.bezierCurveTo(-w*1.15,-h*1.3,w*1.15,-h*1.3,w*1.05,st==='short'?-h*.05:h*.2);
  if(st==='long'||st==='curls'||st==='wig'){g.lineTo(w*1.15,h*1.25);g.lineTo(w*.72,h*1.2);g.lineTo(w*.78,-h*.3);g.quadraticCurveTo(0,-h*.48,-w*.78,-h*.3);g.lineTo(-w*.72,h*1.2);g.lineTo(-w*1.15,h*1.25)}else{g.quadraticCurveTo(w*.6,-h*.5,0,-h*.52);g.quadraticCurveTo(-w*.6,-h*.5,-w*1.05,-h*.05)}g.closePath();return true}
 // East
 g.moveTo(w*.8,-h*.45);g.bezierCurveTo(w*.6,-h*1.25,-w*1.25,-h*1.15,-w*1.05,st==='short'||st==='crop'?h*.1:h*(st==='long'||st==='curls'||st==='wig'?1.3:.6));
 if(st==='long'||st==='curls'||st==='wig')g.lineTo(-w*.2,h*1.3);g.quadraticCurveTo(-w*.1,-h*.1,w*.2,-h*.45);g.closePath();return true}
function drawHair(g,P,fc,hd,s){if(!hairShape(g,P.hair,fc,hd))return;g.fillStyle=P.hairC;g.fill();g.save();g.clip();g.strokeStyle=sh(P.hairC,.18);g.lineWidth=Math.max(.8,s*.012);for(let i=-4;i<=4;i++){g.beginPath();g.moveTo(i*hd.w*.18,-hd.h*1.1);g.quadraticCurveTo(i*hd.w*.3,-hd.h*.2,i*hd.w*.28,hd.h*1.4);g.stroke()}if(P.hair==='curls'||P.hair==='wig'){g.fillStyle=sh(P.hairC,.12);for(let y=-1;y<1.3;y+=.25)for(let x=-1.1;x<1.1;x+=.25){g.beginPath();g.arc(x*hd.w+(y*4%2)*.1*hd.w,y*hd.h,s*.016,0,TAU);g.fill()}}g.restore();hairShape(g,P.hair,fc,hd);g.strokeStyle=OL;g.lineWidth=Math.max(1,s*.03);g.stroke()}
function drawBeard(g,P,fc,hd,s){if(!P.beard||fc==='N')return;const w=hd.w,h=hd.h,L=P.beard==='long'?1.25:P.beard==='full'?.95:.75;g.beginPath();if(fc==='S'){g.moveTo(-w*.95,h*.05);g.quadraticCurveTo(-w*.5,h*.35,0,h*.3);g.quadraticCurveTo(w*.5,h*.35,w*.95,h*.05);g.quadraticCurveTo(w*.85,h*L,0,h*(L+.15));g.quadraticCurveTo(-w*.85,h*L,-w*.95,h*.05)}else{g.moveTo(-w*.1,h*.15);g.quadraticCurveTo(w*.5,h*.4,w*.9,h*.35);g.quadraticCurveTo(w*.7,h*(L+.1),w*.1,h*(L+.05));g.quadraticCurveTo(-w*.3,h*.6,-w*.1,h*.15)}g.closePath();g.fillStyle=P.hairC;g.fill();if(P.beard==='long'&&s>40){g.save();g.clip();g.strokeStyle=sh(P.hairC,.25);g.lineWidth=Math.max(.8,s*.012);for(let r=0;r<5;r++)for(let i=-3;i<=3;i++){g.beginPath();g.arc(i*w*.22+(fc==='E'?w*.4:0),h*(.45+r*.2),s*.014,0,Math.PI*1.5);g.stroke()}g.restore()}g.strokeStyle=OL;g.lineWidth=Math.max(1,s*.025);g.stroke();if(fc==='S'){g.fillStyle=sh(P.skin,-.3);g.fillRect(-w*.12,h*.48,w*.24,h*.05)}}
function drawHat(g,P,fc,hd,s){const H=P.hat;if(!H)return;const w=hd.w,h=hd.h,lw=Math.max(1,s*.03),c=H.c,E=fc==='E';g.strokeStyle=OL;g.lineWidth=lw;const st=()=>{g.fill();g.stroke()};
 const dome=(ext,ry)=>{g.beginPath();g.ellipse(E?-w*.05:0,-h*.12,w*ext,h*(ry||1),0,Math.PI,TAU);g.lineTo(w*ext+(E?-w*.05:0),-h*.05);g.quadraticCurveTo(0,h*.05,-w*ext+(E?-w*.05:0),-h*.05);g.closePath()};
 switch(H.k){
 case'cap':g.fillStyle=c;dome(1.06,.95);st();if(H.t){g.strokeStyle=H.t;g.lineWidth=lw*1.6;g.beginPath();g.moveTo(-w*1.04,-h*.1);g.lineTo(w*1.04,-h*.1);g.stroke()}break;
 case'band':g.strokeStyle=c;g.lineWidth=lw*2.5;g.beginPath();g.ellipse(0,-h*.35,w*1.04,h*.25,0,E?Math.PI*.2:0,E?Math.PI*.95:Math.PI);g.stroke();if(H.g&&fc==='S'){g.fillStyle=H.g;g.beginPath();g.arc(0,-h*.12,s*.025,0,TAU);g.fill()}break;
 case'nemes':g.fillStyle=c;g.beginPath();g.moveTo(-w*1.1,-h*.2);g.bezierCurveTo(-w*1.2,-h*1.35,w*1.2,-h*1.35,w*1.1,-h*.2);if(fc!=='N'){g.lineTo(w*1.35,h*1.2);g.lineTo(w*.8,h*1.1);g.lineTo(w*.8,-h*.3);g.lineTo(-w*.8,-h*.3);g.lineTo(-w*.8,h*1.1);g.lineTo(-w*1.35,h*1.2)}else{g.lineTo(w*1.3,h*1.2);g.lineTo(-w*1.3,h*1.2)}g.closePath();g.fill();g.save();g.clip();g.strokeStyle=H.t;g.lineWidth=lw*1.3;for(let y=-1.2;y<1.3;y+=.22){g.beginPath();g.moveTo(-w*1.5,y*h);g.lineTo(w*1.5,y*h);g.stroke()}g.restore();g.strokeStyle=OL;g.lineWidth=lw;g.stroke();break;
 case'cone':g.fillStyle=c;g.beginPath();g.moveTo(-w*1.08,-h*.2);g.quadraticCurveTo(-w*.6,-h*1.4,(E?w*.15:0),-h*(H.tall||2.1));g.quadraticCurveTo(w*.6,-h*1.4,w*1.08,-h*.2);g.quadraticCurveTo(0,-h*.05,-w*1.08,-h*.2);g.closePath();st();g.save();g.clip();g.fillStyle='rgba(255,240,200,.25)';g.fillRect(-w,-h*3,w*.6,h*3);g.restore();if(H.t){g.strokeStyle=H.t;g.lineWidth=lw*2;g.beginPath();g.moveTo(-w*1.05,-h*.28);g.quadraticCurveTo(0,-h*.12,w*1.05,-h*.28);g.stroke()}break;
 case'tall':g.fillStyle=c;g.beginPath();g.moveTo(-w*.95,-h*.3);g.lineTo(-w*.8,-h*(H.tall||1.9));g.quadraticCurveTo(0,-h*((H.tall||1.9)+.25),w*.8,-h*(H.tall||1.9));g.lineTo(w*.95,-h*.3);g.quadraticCurveTo(0,-h*.12,-w*.95,-h*.3);g.closePath();st();if(H.t){g.strokeStyle=H.t;g.lineWidth=lw*1.4;for(let i=1;i<4;i++){const yy=-h*(.3+i*.38);g.beginPath();g.moveTo(-w*.9,yy);g.lineTo(w*.9,yy);g.stroke()}}if(H.horns){g.strokeStyle='#d8a838';g.lineWidth=lw*1.4;for(let i=0;i<3;i++){g.beginPath();g.arc(0,-h*(.6+i*.45),w*.75,Math.PI*1.1,Math.PI*1.9);g.stroke()}}break;
 case'turban':for(let i=0;i<3;i++){g.fillStyle=i%2?sh(c,-.12):c;g.beginPath();g.ellipse(E?-w*.05:0,-h*(.35+i*.28),w*(1.12-i*.16),h*(.42-i*.06),0,0,TAU);st()}break;
 case'fez':g.fillStyle=c;g.beginPath();g.moveTo(-w*.85,-h*.25);g.lineTo(-w*.75,-h*1.35);g.quadraticCurveTo(0,-h*1.5,w*.75,-h*1.35);g.lineTo(w*.85,-h*.25);g.quadraticCurveTo(0,-h*.1,-w*.85,-h*.25);g.closePath();st();if(H.t){g.strokeStyle=H.t;g.lineWidth=lw*1.8;g.beginPath();g.moveTo(-w*.82,-h*.45);g.lineTo(w*.82,-h*.45);g.stroke();g.beginPath();g.moveTo(-w*.77,-h*1.05);g.lineTo(w*.77,-h*1.05);g.stroke()}break;
 case'helm':g.fillStyle=c;dome(1.1,1.02);st();g.save();dome(1.1,1.02);g.clip();g.fillStyle='rgba(255,240,190,.3)';g.beginPath();g.ellipse(-w*.4,-h*.8,w*.35,h*.18,-.4,0,TAU);g.fill();g.restore();if(H.crest){g.strokeStyle=H.crest;g.lineWidth=lw*3.2;g.lineCap='round';g.beginPath();if(fc==='E'){g.moveTo(w*.3,-h*1.1);g.quadraticCurveTo(-w*.4,-h*1.6,-w*1.3,-h*.6)}else{g.moveTo(0,-h*1.15);g.lineTo(0,-h*1.6)}g.stroke()}if(H.cheek&&fc!=='N'){g.fillStyle=c;g.strokeStyle=OL;g.lineWidth=lw;[-1,1].forEach(sd=>{if(E&&sd<0)return;g.beginPath();g.rect((E?w*.05:sd*w*1.0-w*.15),-h*.1,w*.3,h*.6);st()})}break;
 case'boar':g.fillStyle='#ece2c8';dome(1.1,1.05);st();g.save();dome(1.1,1.05);g.clip();g.strokeStyle='#8a7a5a';g.lineWidth=lw*.9;for(let i=0;i<4;i++){g.beginPath();g.moveTo(-w*1.2,-h*(.25+i*.22));g.lineTo(w*1.2,-h*(.25+i*.22));g.stroke();for(let x=-1.1;x<1.1;x+=.22){g.beginPath();g.moveTo(x*w+(i%2)*.11*w,-h*(.25+i*.22));g.lineTo(x*w+(i%2)*.11*w+w*.05,-h*(.47+i*.22));g.stroke()}}g.restore();break;
 case'veil':g.fillStyle=c;g.beginPath();g.moveTo(-w*1.1,-h*.1);g.bezierCurveTo(-w*1.2,-h*1.35,w*1.2,-h*1.35,w*1.1,-h*.1);g.lineTo(w*1.3,h*1.4);g.lineTo(-w*1.3,h*1.4);g.closePath();if(fc!=='N'){g.moveTo((E?w*.25:0)+w*.75,h*.1);g.ellipse(E?w*.25:0,h*.1,w*.75,h*.85,0,0,TAU,true)}g.fill('evenodd');g.stroke();if(H.t){g.strokeStyle=H.t;g.lineWidth=lw*1.5;g.beginPath();g.moveTo(-w*1.08,-h*.55);g.quadraticCurveTo(0,-h*.8,w*1.08,-h*.55);g.stroke()}break;
 case'diadem':g.strokeStyle=c;g.lineWidth=lw*1.8;g.beginPath();g.ellipse(0,-h*.42,w*1.0,h*.25,0,E?Math.PI*.2:0,E?Math.PI*.95:Math.PI);g.stroke();if(fc==='S'){for(let i=-2;i<=2;i++){g.fillStyle=i?c:'#2f6fa8';g.beginPath();g.arc(i*w*.3,-h*.22+Math.abs(i)*h*.06-h*.08,s*.02,0,TAU);g.fill()}}break;
 }}
// held tools (separate sprite, pointing along +x, grip at origin)
function toolSprite(g,k,s){const lw=Math.max(1,s*.025);g.lineCap='round';g.strokeStyle=OL;const haft=(L,c)=>{g.lineWidth=s*.055;g.strokeStyle=OL;g.beginPath();g.moveTo(-s*.08,0);g.lineTo(L,0);g.stroke();g.lineWidth=s*.032;g.strokeStyle=c||'#9a6a38';g.stroke()};const bronze='#c8903c',bz=(pts)=>{poly(g,pts,bronze,OL,lw);g.save();g.clip();g.fillStyle='rgba(255,240,200,.35)';g.fillRect(-s,-s,s*2,s*.97);g.restore()};
 const L=s*.62;
 switch(k){
 case'axe':haft(L);bz([[L*.82,-s*.02],[L*.95,-s*.16],[L*1.05,-s*.15],[L*1.02,s*.06],[L*.82,s*.03]]);break;
 case'pick':haft(L);g.lineWidth=s*.07;g.strokeStyle=OL;g.beginPath();g.moveTo(L*.92,-s*.2);g.quadraticCurveTo(L*1.02,0,L*.92,s*.2);g.stroke();g.lineWidth=s*.04;g.strokeStyle=bronze;g.stroke();break;
 case'hammer':haft(L*.75);poly(g,[[L*.68,-s*.08],[L*.82,-s*.08],[L*.82,s*.08],[L*.68,s*.08]],'#8a8478',OL,lw);break;
 case'hoe':haft(L);bz([[L*.95,0],[L*.98,s*.17],[L*.88,s*.17],[L*.9,0]]);break;
 case'spear':haft(L*1.5,'#8a6438');bz([[L*1.45,-s*.045],[L*1.75,0],[L*1.45,s*.045],[L*1.4,0]]);break;
 case'khopesh':g.lineWidth=s*.06;g.strokeStyle=OL;g.beginPath();g.moveTo(-s*.06,0);g.lineTo(s*.12,0);g.stroke();g.lineWidth=s*.035;g.strokeStyle='#6a4426';g.stroke();g.lineWidth=s*.075;g.strokeStyle=OL;g.beginPath();g.moveTo(s*.12,0);g.lineTo(L*.6,0);g.quadraticCurveTo(L*.95,-s*.02,L*.95,s*.16);g.stroke();g.lineWidth=s*.045;g.strokeStyle=bronze;g.stroke();break;
 case'sword':g.lineWidth=s*.06;g.strokeStyle=OL;g.beginPath();g.moveTo(-s*.06,0);g.lineTo(L,0);g.stroke();g.lineWidth=s*.035;g.strokeStyle=bronze;g.stroke();g.strokeStyle='#6a4426';g.beginPath();g.moveTo(-s*.06,0);g.lineTo(s*.08,0);g.stroke();poly(g,[[s*.08,-s*.06],[s*.11,-s*.06],[s*.11,s*.06],[s*.08,s*.06]],'#c8903c',OL,lw*.7);break;
 case'bow':g.lineWidth=s*.05;g.strokeStyle=OL;g.beginPath();g.arc(-s*.12,0,s*.36,-1.1,1.1);g.stroke();g.lineWidth=s*.03;g.strokeStyle='#7a4a24';g.stroke();g.lineWidth=Math.max(.8,s*.008);g.strokeStyle='#e8dcc0';g.beginPath();g.moveTo(-s*.12+Math.cos(-1.1)*s*.36,Math.sin(-1.1)*s*.36);g.lineTo(-s*.12+Math.cos(1.1)*s*.36,Math.sin(1.1)*s*.36);g.stroke();break;
 case'club':g.lineWidth=s*.08;g.strokeStyle=OL;g.beginPath();g.moveTo(-s*.06,0);g.lineTo(L*.8,0);g.stroke();g.lineWidth=s*.05;g.strokeStyle='#7a5030';g.stroke();ball(g,[L*.8,0],s*.07,'#8a8478');break;
 case'shield':g.save();g.scale(.55,1);ball(g,[s*.1,0],s*.26,'#a87a44');g.restore();break;
 }}
// carried items (hauling)
function haulItem(g,k,s){if(k==='logs'){for(let i=0;i<3;i++){capsule(g,[-s*.25,-i*s*.07],[s*.25,-i*s*.07],s*.05,s*.05,'#7a5030');g.fillStyle='#d8b07a';g.beginPath();g.ellipse(s*.25,-i*s*.07,s*.03,s*.045,0,0,TAU);g.fill()}}else if(k==='stone'){ball(g,[0,0],s*.13,'#9a948a');ball(g,[s*.1,-s*.06],s*.08,'#8a8478')}else if(k==='grain'){ball(g,[0,0],s*.15,'#c8a868');g.strokeStyle=OL;g.lineWidth=1;g.beginPath();g.moveTo(-s*.05,-s*.13);g.lineTo(s*.05,-s*.13);g.stroke()}else{ball(g,[0,0],s*.13,'#b8683a');g.fillStyle=OL;g.beginPath();g.ellipse(0,-s*.11,s*.05,s*.025,0,0,TAU);g.fill()}}
// ===================== full pawn =====================
// o: {fc:'S'|'E'|'N'|'W', bob:0..1 phase, tool:{k,ang(rad, screen),swing}, haul, lying:rad, blanket}
function drawPawn(g,P,x,y,s,o){o=o||{};let fc=o.fc||'S';const mir=fc==='W';if(mir)fc='E';
 g.save();g.translate(x,y);
 // shadow
 if(!o.lying){g.save();g.filter='blur('+Math.max(1,s*.04)+'px)';g.fillStyle='rgba(10,6,2,.35)';g.beginPath();g.ellipse(0,s*.36,s*.27,s*.09,0,0,TAU);g.fill();g.restore()}
 if(o.lying)g.rotate(o.lying);
 const bob=o.bob!==undefined?-Math.abs(Math.sin(o.bob*TAU))*s*.04:0;g.translate(0,bob);
 const tool=o.tool;const toolDraw=()=>{if(!tool)return;g.save();const a=tool.ang+(tool.swing||0);g.translate(Math.cos(tool.ang)*s*(.18+(tool.push||0)),Math.sin(tool.ang)*s*(.12+(tool.push||0))+s*.05);g.rotate(a);if(tool.k!=='spoon_')toolSprite(g,tool.k,s);g.restore()};
 const toolBehind=tool&&(Math.sin(tool.ang)<-.3||fc==='N');
 if(toolBehind)toolDraw();
 g.save();if(mir)g.scale(-1,1);
 const by=s*.12;g.translate(0,by);
 const d=(()=>{g.save();const r=bodyPath(g,P.body,fc,s);g.restore();return r})();
 if(P.cloak&&fc!=='S')cloak(g,P.cloak,d,fc,s);if(P.cloak&&fc==='S'){cloak(g,P.cloak,d,fc,s)}
 bodyPath(g,P.body,fc,s);g.fillStyle=P.skin;g.fill();
 g.save();bodyPath(g,P.body,fc,s);g.clip();(P.app||[]).forEach(a=>apparel(g,a,d,fc,s));shade(g,0,0,d.sw,d.h,s);g.restore();
 bodyPath(g,P.body,fc,s);g.strokeStyle=OL;g.lineWidth=Math.max(1.2,s*.035);g.stroke();
 if(P.robeHem&&fc!=='N'){}
 g.translate(fc==='E'?s*.03:0,-d.h*.5-HEAD.h*s*.72);
 if(o.noHead){g.restore();if(!toolBehind)toolDraw();g.restore();return}
 const N=fc==='N';let hd;
 if(N){hd=headPath(g,'N',s);g.fillStyle=P.skin;g.fill();g.strokeStyle=OL;g.lineWidth=Math.max(1,s*.036);g.stroke();hd={w:HEAD.w*s,h:HEAD.h*s}}else hd=drawHead(g,P,fc,s);
 drawHair(g,P,fc,hd,s);drawBeard(g,P,fc,hd,s);drawHat(g,P,fc,hd,s);
 if(P.ear&&fc!=='N'){g.fillStyle='#d8a838';[-1,1].forEach(sd=>{if(fc==='E'&&sd>0)return;g.beginPath();g.arc(fc==='E'?-hd.w*.1:sd*hd.w*1.0,hd.h*.35,s*.02,0,TAU);g.fill()})}
 g.restore();
 if(o.haul){g.save();g.translate(0,fc==='N'?s*.02:s*.2);haulItem(g,o.haul,s);g.restore()}
 if(!toolBehind)toolDraw();
 if(o.blanket){g.fillStyle=o.blanket;g.strokeStyle=OL;g.lineWidth=Math.max(1,s*.03);g.beginPath();g.roundRect(-s*.36,-s*.08,s*.72,s*.52,s*.08);g.fill();g.stroke();g.strokeStyle='rgba(255,230,160,.6)';g.lineWidth=Math.max(1,s*.02);for(let i=1;i<3;i++){g.beginPath();g.moveTo(-s*.36,-s*.08+i*s*.17);g.lineTo(s*.36,-s*.08+i*s*.17);g.stroke()}}
 g.restore()}
// ===================== civ wardrobes =====================
const PSKIN={eg:['#a8714a','#8e5a36','#b98258','#7a4a2c'],hi:['#d0a07a','#c49470','#b8875f'],ca:['#b58560','#a97650','#c8946a'],my:['#d8aa80','#c8946a','#e0b890'],mi:['#c48a5e','#d29c70','#b87c50'],ba:['#9c6a45','#b07a50','#86593a'],as:['#a06c48','#946040','#b07a54'],mt:['#c89a70','#b88660','#d8aa80']};
const PHAIR={eg:['#14100c','#221812'],hi:['#3a2618','#5a3a20','#2b1c12'],ca:['#1e140c','#3a2410'],my:['#5a3a1a','#8a5a2a','#3a2410','#a8783a'],mi:['#140e0a','#2a160c'],ba:['#20160e','#120c08'],as:['#140e08','#1e140a'],mt:['#3a2410','#2a1a0e','#6a4220']};
const CIVN={eg:'Egyptians',hi:'Hittites',ca:'Canaanites',my:'Mycenaeans',mi:'Minoans',ba:'Babylonians',as:'Assyrians',mt:'Mitanni'};
const CIV8P=Object.keys(CIVN);
function mkPawn(civ,role,sex,seed){SEED=seed||1;const f=sex==='f',P={civ,role,sex,skin:pick(PSKIN[civ]),hairC:pick(PHAIR[civ])};
 P.body=f?'female':role==='soldier'?pick(['hulk','average']):pick(['thin','average','average','fat']);P.hair=f?pick(['long','curls']):pick(['short','crop','short']);
 P.beard=!f&&['ca','ba','as','mt','hi','my'].includes(civ)&&role!=='priest'?(civ==='as'||civ==='ba'?'long':pick(['full','short'])):null;
 const A=[];P.app=A;const W='#efe8d6';
 if(civ==='eg'){P.kohl=1;P.hair=f?'wig':'crop';if(f){A.push({k:'robe',c:W,t:'#2f6fa8'},{k:'collar',c:'#c8902c',t:'#2f6fa8'})}else{A.push({k:'kilt',c:W,t:'#c8902c'});if(role==='noble'||role==='priest')A.push({k:'collar',c:'#c8902c',t:'#2f6fa8'})}
  if(role==='soldier'){A.push({k:'belt',c:'#6a4426',y:.55},{k:'sash',c:'#b33a2a'});P.hat={k:'cap',c:'#6a4a2a',t:'#c8902c'}}
  if(role==='noble'&&!f){P.hat={k:'nemes',c:'#e0c060',t:'#2f5f98'}}if(role==='noble'&&f)P.hat={k:'diadem',c:'#d8a838'};
  if(role==='priest'){P.hair='bald';A.push({k:'shawl',c:'#c89048',spots:1})}}
 if(civ==='hi'){A.push({k:'robe',c:pick(['#7a4a33','#5f3b5a','#8a6a3a']),t:'#d8b25a'},{k:'belt',c:'#d8b25a',y:.5,b:'#c8902c'});P.hair=f?'long':'long';
  if(role==='soldier'){A.length=0;A.push({k:'tunic',c:'#8a5a33',t:'#d8b25a'},{k:'scale',c:'#b08a4a',y1:.6});P.hat={k:'helm',c:'#b08a4a',crest:'#b03a2a',cheek:1}}
  if(role==='priest'||role==='noble')P.hat=f?{k:'veil',c:'#e8dcc0',t:'#d8a838'}:{k:'tall',c:'#c8b07a',t:'#8a6a3a',tall:2.2};if(role==='peasant')P.hat={k:'cap',c:'#7a5a3a'}}
 if(civ==='ca'){const c1=pick(['#9a3b2e','#3d5a8a','#c9b48a']);A.push({k:'tunic',c:c1,t:'#e8dcc0'},{k:'stripes',c:c1,t:pick(['#e8dcc0','#2a3a5a','#c8902c'])},{k:'belt',c:'#5a3a1e',y:.5});
  P.hat=f?{k:'veil',c:'#c9b48a',t:'#9a3b2e'}:{k:'turban',c:pick(['#e8dcc0','#c83a2a','#3d5a8a'])};if(role==='soldier'){A.push({k:'scale',c:'#a07840',y1:.5});P.hat={k:'helm',c:'#a07840'}}}
 if(civ==='my'){if(f){A.push({k:'shirt',c:'#3a5a7a',t:'#c8902c'},{k:'flounce',c:'#8a3a2a',t:'#e8dcc0'})}else A.push({k:'tunic',c:pick(['#c8b48a','#8a3a2a']),t:'#1e2e4a'},{k:'belt',c:'#5a3a1e',y:.52});P.hair=f?'curls':'short';
  if(role==='soldier'){A.push({k:'scale',c:'#b08a4a',y0:-.05,y1:.7});P.hat={k:'boar'}}if(role==='noble')P.cloak='#5a2a5a',P.hat=f?{k:'diadem',c:'#d8a838'}:{k:'band',c:'#d8a838',g:'#d8a838'}}
 if(civ==='mi'){P.hair='curls';if(f){A.push({k:'shirt',c:'#2f78a8',t:'#e0b03c'},{k:'flounce',c:'#c8452e',t:'#e0b03c'})}else A.push({k:'kilt',c:pick(['#c8452e','#2f78a8']),t:'#e0b03c'},{k:'belt',c:'#e0b03c',y:.55});
  if(role==='priest')P.hat={k:'tall',c:'#e8dcc0',t:'#c8452e',tall:2};if(role==='soldier'){P.hat={k:'helm',c:'#b08a4a',crest:'#2f78a8'};A.push({k:'shawl',c:'#8a5a33'})}if(role==='noble')P.ear=1}
 if(civ==='ba'){const c1=pick(['#d9c49a','#7a3a5a','#3a5a6a']);A.push({k:'robe',c:c1,t:'#c8902c'},{k:'shawl',c:sh(c1,-.15),t:'#c8902c'},{k:'fringe',c:'#c8902c',y:.92});
  if(role==='priest'){P.hair='bald';P.beard=null}if(role==='noble')P.hat={k:'fez',c:'#7a2a3a',t:'#d8a838'};if(role==='soldier'){A.length=0;A.push({k:'tunic',c:'#d9c49a',t:'#8a5a2a'},{k:'belt',c:'#5a3a1e',y:.5});P.hat={k:'helm',c:'#b07a3a'}}if(f)P.hat={k:'veil',c:'#e8dcc0',t:'#7a3a5a'}}
 if(civ==='as'){const c1=pick(['#5a3a6a','#8a2a2a','#c8b080']);A.push({k:'robe',c:c1,t:'#d8a838'},{k:'fringe',c:'#d8a838',y:.6},{k:'fringe',c:'#d8a838',y:.92},{k:'belt',c:'#d8a838',y:.48,b:'#e8dcc0'});P.ear=1;
  if(role==='soldier'){A.length=0;A.push({k:'tunic',c:'#8a2a2a',t:'#d8a838'},{k:'scale',c:'#9a9488',y1:.62},{k:'belt',c:'#5a3a1e',y:.6});P.hat={k:'cone',c:'#b0a090',t:'#6a5a40',tall:2.3}}if(role==='noble')P.hat={k:'fez',c:'#e8dcc0',t:'#d8a838'};if(role==='priest')P.hat={k:'tall',c:'#e8dcc0',t:'#d8a838',horns:1,tall:1.9};if(f)P.hat={k:'veil',c:'#5a3a6a',t:'#d8a838'}}
 if(civ==='mt'){const c1=pick(['#3a6a5a','#a86a2a','#d8c8a0']);A.push({k:'robe',c:c1,t:'#c83a2a'},{k:'stripes',c:c1,t:'#e0c070'},{k:'belt',c:'#c83a2a',y:.48});
  if(role==='soldier'){A.length=0;A.push({k:'tunic',c:'#a86a2a',t:'#c83a2a'},{k:'scale',c:'#b08a4a',y0:-.05,y1:.95});P.hat={k:'cone',c:'#a8865a',t:'#6a4a20',tall:1.8}}else if(!f)P.hat={k:'cap',c:pick(['#c83a2a','#3a6a5a']),t:'#e0c070'};if(f)P.hat={k:'band',c:'#c83a2a'}}
 return P}
const ROLES=[['soldier','m'],['noble','f'],['peasant','m'],['priest','m'],['noble','m'],['peasant','f']];
// ===================== sheets =====================
const OUTP=document.getElementById('out');
function psheet(id,w,h,title,fn){const d=document.createElement('div');d.className='note';d.textContent=title;OUTP.appendChild(d);const c=document.createElement('canvas');c.id=id;c.width=w;c.height=h;OUTP.appendChild(c);fn(c.getContext('2d'),w,h)}
function lbl(g,t,x,y,sz){g.font=(sz||13)+'px Georgia';g.textAlign='center';g.fillStyle='rgba(0,0,0,.6)';g.fillText(t,x+1,y+1);g.fillStyle='#f4ead2';g.fillText(t,x,y)}
function lineupSet(c){return[[c,'soldier','m'],[c,c==='eg'||c==='as'?'priest':'noble',c==='hi'||c==='mt'?'m':'f'],[c,'peasant',c==='ca'||c==='my'?'f':'m']]}
const facingOf=(dx,dy)=>Math.abs(dx)>Math.abs(dy)?(dx>0?'E':'W'):(dy>0?'S':'N');
function chopSwing(p){return swing(p,[[0,.2],[.45,-1.5,'io'],[.58,.35,'in'],[.7,.2],[1,.2]])}
function rock(g,x,y,s,ore){SEED=Math.floor(x+y);g.save();g.filter='blur(3px)';g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(x+4,y+s*.35,s*.62,s*.25,0,0,TAU);g.fill();g.restore();const pts=[];for(let i=0;i<9;i++){const a=i/9*TAU;pts.push([x+Math.cos(a)*s*R(.45,.6),y+Math.sin(a)*s*R(.35,.45)])}poly(g,pts,'#8a8478',OL,1.5);poly(g,pts.slice(4,9).concat([[x,y]]),'#a8a296');if(ore)for(let i=0;i<5;i++){g.fillStyle=ore;g.beginPath();g.arc(x+R(-.3,.3)*s,y+R(-.2,.2)*s,s*.05,0,TAU);g.fill();g.strokeStyle=OL;g.lineWidth=1;g.stroke()}}
function bed(g,x,y,T,col){g.save();g.filter='blur(2px)';g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x+3,y+4,T*2,T);g.restore();g.fillStyle='#6a4426';g.strokeStyle=OL;g.lineWidth=1.5;g.beginPath();g.roundRect(x,y,T*2,T,3);g.fill();g.stroke();g.fillStyle='#e8dcc0';g.fillRect(x+3,y+3,T*2-6,T-6);g.fillStyle='#fff8e8';g.beginPath();g.roundRect(x+4,y+5,T*.45,T-10,4);g.fill();g.strokeStyle='rgba(0,0,0,.3)';g.stroke()}
function scene(g,W,H,t,T){T=T||32;const s=T*1.05;
 if(!scene.bg||scene.bg.width!==W){const c=document.createElement('canvas');c.width=W;c.height=H;const b=c.getContext('2d');terrainBlend(b,0,0,W,H,'grass','dirt',(u,v)=>Math.max(0,1-Math.hypot(u-.42,(v-.55)*1.4)*1.8));
  // stone outcrop area top-left
  terrainBlend(b,0,0,W*.35,H*.45,'grass','stone',(u,v)=>Math.max(0,1-Math.hypot(u-.3,v-.35)*1.6));
  // room: tiles
  const rx=24*T,ry=9*T,rw=14*T,rh=11*T;terrainFill(b,rx,ry,rw*.5,rh,'plank');terrainFill(b,rx+rw*.5,ry,rw*.5,rh,'floor');
  b.save();b.beginPath();b.rect(rx,ry,rw,rh);b.clip();b.filter='blur(8px)';b.strokeStyle='rgba(0,0,0,.45)';b.lineWidth=T*.8;b.strokeRect(rx,ry,rw,rh);b.restore();
  scene.walls=[];const wt=(cx,cy)=>scene.walls.push([cx,cy]);for(let i=0;i<=14;i++){wt(24+i,9);if(i!==9)wt(24+i,20)}for(let j=10;j<20;j++){wt(24,j);wt(38,j);if(j!==15&&j!==16)wt(31,j)}
  scene.bg=c}
 g.drawImage(scene.bg,0,0);
 const D=[];const add=(y,fn)=>D.push({y,fn});
 // walls drawn later sorted
 scene.walls.forEach(([cx,cy])=>add(cy*T+T,()=>{const x=cx*T,y=cy*T;g.fillStyle='#6a4e34';g.fillRect(x,y+T*.55,T,T*.45);g.fillStyle='#b8986a';g.fillRect(x,y-T*.25,T,T*.8);g.strokeStyle='rgba(80,55,30,.4)';g.lineWidth=1;g.strokeRect(x+.5,y-T*.25+.5,T-1,T*.4);g.strokeRect(x+.5,y+T*.15+.5,T-1,T*.4);g.strokeStyle=OL;g.strokeRect(x,y-T*.25,T,T*1.25)}));
 // furniture
 const rx=24*T,ry=9*T;
 [[25.3,10.5],[25.3,13],[25.3,15.5]].forEach(([bx,by],i)=>{add(by*T+T,()=>{bed(g,bx*T,by*T,T);if(i<2){drawPawn(g,PW.sleep[i],bx*T+T*.95,by*T+T*.5,s,{lying:-Math.PI/2,blanket:i?'#3d5a8a':'#a83a2a',fc:'S'});g.font='bold '+(T*.35)+'px Georgia';g.fillStyle='rgba(255,255,255,'+(.5+.4*Math.sin(t*TAU*2+i))+')';g.fillText('z',bx*T+T*.3,by*T-T*.1-((t*2+i*.5)%1)*T*.4)}})});
 add(18*T,()=>{g.fillStyle='#7a5030';g.strokeStyle=OL;g.lineWidth=1.5;g.beginPath();g.roundRect(rx+9*T,ry+5*T,3*T,1.6*T,3);g.fill();g.stroke();[0,1,2].forEach(i=>{g.fillStyle='#9a5a30';g.beginPath();g.ellipse(rx+9.5*T+i*T,ry+5.8*T,T*.2,T*.13,0,0,TAU);g.fill();g.fillStyle='#e0c070';g.beginPath();g.ellipse(rx+9.5*T+i*T,ry+5.75*T,T*.13,T*.07,0,0,TAU);g.fill()})});
 PW.eat.forEach((p,i)=>{const pos=[[rx+9.5*T,ry+4.6*T,'S'],[rx+11.5*T,ry+4.6*T,'S'],[rx+10.5*T,ry+7.4*T,'N']][i];add(pos[1]+(pos[2]==='N'?T:0),()=>drawPawn(g,p,pos[0],pos[1],s,{fc:pos[2],tool:{k:'spoon_',ang:0},bob:0}))});
 // hearth in room
 add(ry+2*T,()=>{const x=rx+11*T,y=ry+2*T;g.fillStyle='#5a5048';g.beginPath();g.arc(x,y,T*.7,0,TAU);g.fill();g.strokeStyle=OL;g.stroke();for(let i=0;i<6;i++){const ph=(t*3+i*.37)%1;g.fillStyle='rgba(255,'+Math.floor(210-ph*120)+',60,'+(1-ph)+')';g.beginPath();g.arc(x+Math.sin(i*2)*T*.2,y-ph*T*.6,T*.18*(1-ph*.5),0,TAU);g.fill()}});
 // trees + chopper
 const trees=[[4,15,'oak'],[7,18,'cedar'],[2,19.5,'olive'],[11,21,'date palm'],[16,4,'sycamore fig'],[20,22.5,'cypress']];
 trees.forEach(([x,y,sp])=>add(y*T,()=>tree(g,sp,x*T,y*T,T*2.4,t,'summer')));
 add(15*T+1,()=>drawPawn(g,PW.chop,5.2*T,15.0*T-T*.3,s,{fc:'W',tool:{k:'axe',ang:Math.PI,swing:-chopSwing((t*2)%1)}}));
 add(14*T,()=>{tree(g,'oak',5.2*T,14*T,T*2.4,t,'summer','felled')});
 // mining
 add(5*T,()=>{rock(g,4*T,5*T,T*2.2,'#3a8a6a');rock(g,6.5*T,6.5*T,T*1.6,'#c87a3a')});
 add(6.6*T,()=>drawPawn(g,PW.mine,5.6*T,6.3*T,s,{fc:'W',tool:{k:'pick',ang:Math.PI*1.05,swing:-chopSwing((t*2+.3)%1)}}));
 // hauler gliding between felled tree and stockpile
 const hp=(t*1)%1,pp=hp<.5?hp*2:2-hp*2,ax=7*T,ay=16*T,bx=22*T,by=14*T,hx=lerp(ax,bx,ease(pp)),hy=lerp(ay,by,ease(pp));
 add(by-T*3,()=>{g.fillStyle='rgba(200,180,120,.25)';g.fillRect(21*T,12*T,3*T,3*T);g.setLineDash([4,4]);g.strokeStyle='rgba(255,240,180,.6)';g.strokeRect(21*T,12*T,3*T,3*T);g.setLineDash([]);for(let i=0;i<4;i++)haulItem(g,'logs',T*1.1),g.translate(0,0);});
 add(13*T,()=>{for(let i=0;i<3;i++){g.save();g.translate(21.6*T+i*T*.9,12.6*T);haulItem(g,i<2?'logs':'stone',T*1.1);g.restore()}});
 add(hy,()=>drawPawn(g,PW.haul,hx,hy,s,{fc:hp<.5?facingOf(bx-ax,by-ay):facingOf(ax-bx,ay-by),bob:hp*8,haul:hp<.5?'logs':null}));
 // walker
 const wp=t,wx=lerp(13*T,30*T,wp),wy=22.3*T;add(wy,()=>drawPawn(g,PW.walk,wx,wy,s,{fc:'E',bob:wp*10}));
 // farmer with hoe
 add(19*T,()=>{for(let i=0;i<4;i++){g.fillStyle=i%2?'#5a4026':'#6a4a2c';g.fillRect(13*T,(16.5+i*.6)*T,6*T,T*.4)}for(let i=0;i<8;i++){g.strokeStyle='#6a9a3a';g.lineWidth=2;g.beginPath();g.moveTo((13.4+i*.7)*T,16.9*T);g.lineTo((13.4+i*.7)*T,16.5*T);g.stroke()}});
 add(18.4*T,()=>drawPawn(g,PW.farm,16*T,18.6*T,s,{fc:'N',tool:{k:'hoe',ang:-Math.PI/2,swing:chopSwing((t*2+.6)%1)*.8}}));
 // fight: two allies vs raiders
 const ft=(t*3)%1;
 add(4*T,()=>drawPawn(g,PW.f1,12*T,4*T,s,{fc:'E',tool:{k:'spear',ang:-.05,push:swing(ft,[[0,0],[.3,-.12,'io'],[.45,.35,'in'],[.6,.35],[1,0]])}}));
 add(5.5*T,()=>drawPawn(g,PW.f2,12.4*T,5.6*T,s,{fc:'E',tool:{k:'khopesh',ang:.1,swing:-chopSwing((t*3+.5)%1)}}));
 add(4*T,()=>drawPawn(g,PW.e1,14*T,4.1*T+Math.sin(ft*TAU)*2,s,{fc:'W',tool:{k:'sword',ang:Math.PI,swing:chopSwing((t*3+.2)%1)*.8}}));
 add(5.6*T,()=>drawPawn(g,PW.e2,14.5*T,5.7*T,s,{fc:'W',tool:{k:'club',ang:Math.PI,swing:-chopSwing((t*3+.7)%1)}}));
 add(3*T,()=>drawPawn(g,PW.archer,16.5*T,3*T,s,{fc:'W',tool:{k:'bow',ang:Math.PI}}));
 if(ft>.44&&ft<.6)add(6*T,()=>{g.fillStyle='rgba(255,240,180,.9)';for(let i=0;i<5;i++){g.beginPath();g.arc(13.4*T+R(-6,6),4.2*T+R(-6,6),1.6,0,TAU);g.fill()}});
 // arrow in flight
 add(2*T,()=>{const u=(t*3)%1,x=lerp(16.2*T,9*T,u),y=3*T-Math.sin(u*Math.PI)*T*.8;g.strokeStyle=OL;g.lineWidth=2;g.beginPath();g.moveTo(x,y);g.lineTo(x+T*.5,y+ (Math.cos(u*Math.PI))*T*.1);g.stroke()});
 // animals
 add(10*T,()=>{animal(g,'sheep','graze',Math.PI/2,[18*T,10*T],t,T*.9);animal(g,'goat','walk',-Math.PI/2,[20*T-t*T*2,11.4*T],(t*3)%1,T*.85)});
 D.sort((a,b)=>a.y-b.y).forEach(d=>d.fn());
 // labels
 g.font='bold 13px Georgia';[['Chopping',5*T,17*T],['Mining',5*T,8*T],['Hauling → stockpile',22.5*T,15.8*T],['Fighting',13.5*T,7*T],['Farming',16*T,20.2*T],['Bedroom: sleeping',27.5*T,19.5*T],['Dining hall: eating',34.5*T,19.5*T]].forEach(([s_,x,y])=>{g.textAlign='center';g.fillStyle='rgba(0,0,0,.6)';g.fillRect(x-g.measureText(s_).width/2-5,y-13,g.measureText(s_).width+10,18);g.fillStyle='#f4e2b8';g.fillText(s_,x,y)})}
const PW={sleep:[mkPawn('eg','peasant','m',3),mkPawn('eg','peasant','f',4)],eat:[mkPawn('ca','peasant','m',5),mkPawn('mi','noble','f',6),mkPawn('ba','noble','m',7)],chop:mkPawn('hi','peasant','m',8),mine:mkPawn('as','peasant','m',9),haul:mkPawn('my','peasant','m',10),walk:mkPawn('mt','noble','m',11),farm:mkPawn('eg','peasant','m',12),f1:mkPawn('my','soldier','m',13),f2:mkPawn('eg','soldier','m',14),e1:mkPawn('as','soldier','m',15),e2:mkPawn('mt','soldier','m',16),archer:mkPawn('hi','soldier','m',17)};
addEventListener('load',()=>{try{
 psheet('pawn-lineup',1720,760,'All 8 civilizations, 3 pawns each, south facing (s = 80 px ≈ 2.5× game zoom)',(g,w,h)=>{terrainFill(g,0,0,w,h,'dirt');CIV8P.forEach((c,ci)=>{const bx=20+(ci%4)*425,by=Math.floor(ci/4)*375;g.fillStyle='rgba(0,0,0,.25)';g.fillRect(bx,by+15,410,350);lbl(g,CIVN[c],bx+205,by+45,20);lineupSet(c).forEach((d,q)=>{const P=mkPawn(d[0],d[1],d[2],ci*10+q+1);const x=bx+75+q*130,y=by+215;drawPawn(g,P,x,y,85,{fc:'S'});lbl(g,(d[2]=='m'?'man':'woman')+' · '+d[1],x,by+330,12)})})});
 psheet('pawn-facings',1600,800,'Four facings S / E / N / W (W = mirrored E), with held tool pointing toward the target',(g,w,h)=>{terrainFill(g,0,0,w,h,'sand');const sets=[['eg','noble','m','khopesh'],['as','soldier','m','spear'],['mi','noble','f',null],['hi','soldier','m','axe'],['my','soldier','m','sword'],['ba','priest','m',null],['mt','soldier','m','bow'],['ca','peasant','f','hoe']];const ang={S:Math.PI/2,E:0,N:-Math.PI/2,W:Math.PI};sets.forEach((d,i)=>{const P=mkPawn(d[0],d[1],d[2],40+i);const col=i%4,row=Math.floor(i/4);['S','E','N','W'].forEach((fc,j)=>{drawPawn(g,P,40+col*395+j*90+30,row*400+200,72,{fc,tool:d[3]?{k:d[3],ang:ang[fc]}:null})});lbl(g,CIVN[d[0]]+' '+d[1],40+col*395+165,row*400+330,13)})});
 psheet('pawn-closeup',1720,1180,'3× zoom (s = 102 px): layer build-up, body types, one pawn per civ (south + east with tool)',(g,w,h)=>{g.fillStyle='#2a2219';g.fillRect(0,0,w,h);terrainFill(g,0,0,w,h,'floor');g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,0,w,h);const S3=102;
  const P=mkPawn('as','soldier','m',99);const steps=['body','+ apparel','+ head','+ hair','+ beard','+ headgear','+ tool'];steps.forEach((st,i)=>{const Q=JSON.parse(JSON.stringify(P));if(i<1)Q.app=[];if(i<2)Q.app=i<1?[]:Q.app;const x=90+i*150,y=170;if(i<3){Q.hair='bald';}if(i<4)Q.hair=i<3?'bald':Q.hair;if(i<5)Q.beard=null;if(i<6)Q.hat=null;if(i<2)Q.ear=0;g.save();if(i<2){/* hide head */}drawPawn(g,Q,x,y,S3,{fc:'S',tool:i>=6?{k:'sword',ang:Math.PI/2}:null,noHead:i<2});g.restore();lbl(g,st,x,y+110,14)});
  ['thin','average','hulk','fat','female'].forEach((b,i)=>{const Q=mkPawn('eg','peasant',b==='female'?'f':'m',5);Q.body=b;drawPawn(g,Q,1170+i*110,170,S3*.9,{fc:'S'});lbl(g,b,1170+i*110,280,13)});
  CIV8P.forEach((c,i)=>{const Q=mkPawn(c,i%2?'noble':'soldier',i===4?'f':'m',200+i);const x=110+i*205;drawPawn(g,Q,x-45,520,S3,{fc:'S'});drawPawn(g,Q,x+55,520,S3,{fc:'E',tool:{k:['spear','sword','axe','khopesh','bow','spear','sword','club'][i],ang:0}});lbl(g,CIVN[c],x,640,14)});
  CIV8P.forEach((c,i)=>{const Q=mkPawn(c,'peasant',i%2?'f':'m',300+i);const x=110+i*205;drawPawn(g,Q,x-45,880,S3,{fc:'S'});drawPawn(g,Q,x+55,880,S3,{fc:'N'});lbl(g,CIVN[c]+' commoner (S / N)',x,1000,13)});
  lbl(g,'Normal zoom (s = 34 px):',140,1100,14);CIV8P.forEach((c,i)=>{drawPawn(g,mkPawn(c,i%2?'peasant':'soldier',i%3?'m':'f',400+i),300+i*60,1100,34,{fc:'S'})});CIV8P.forEach((c,i)=>{drawPawn(g,mkPawn(c,'noble','m',500+i),820+i*60,1100,34,{fc:'E'})})});
 psheet('pawn-ingame',1280,768,'Normal game zoom (32 px tiles): jobs outside on terrain and inside player-built rooms',(g,w,h)=>scene(g,w,h,.3,32));
 const rc=document.createElement('canvas');rc.width=1280;rc.height=768;window.pawnFrame=t=>{scene(rc.getContext('2d'),1280,768,t,32);return rc.toDataURL('image/png')};
 window.READY=1}catch(e){window.ERR=e.stack}});
