 music(){this.trk=(+(localStorage.getItem('bnbTrack')||0))%MTRACKS.length;this.playTrack(this.trk)},
 nextTrack(){if(!this.ctx){this.trk=((this.trk||0)+1)%MTRACKS.length;localStorage.setItem('bnbTrack',this.trk);return}this.playTrack((this.trk+1)%MTRACKS.length)},
 trackName(){return MTRACKS[(this.trk||0)%MTRACKS.length].n},
 playTrack(n){const c=this.ctx;this.trk=n;localStorage.setItem('bnbTrack',n);const T=MTRACKS[n];const old=this.tg;if(old){old.gain.setTargetAtTime(0,c.currentTime,1.2);setTimeout(()=>{try{old.disconnect();(old._o||[]).forEach(o=>o.stop())}catch(e){}},6000)}
  const G=c.createGain();G.gain.value=0;G.gain.setTargetAtTime(1,c.currentTime+.2,1.5);G.connect(this.Mu);G._o=[];this.tg=G;
  // drone (tanbur/bagpipe-like fifth) with slow filter breathing
  for(const[iv,g]of T.drone){const o=c.createOscillator(),fl=c.createBiquadFilter(),g2=c.createGain(),lf=c.createOscillator(),lg=c.createGain();o.type='sawtooth';o.frequency.value=T.root*Math.pow(2,iv/12)/2;o.detune.value=(Math.random()-.5)*8;fl.type='lowpass';fl.frequency.value=380;fl.Q.value=.7;lf.frequency.value=.05+Math.random()*.05;lg.gain.value=140;lf.connect(lg);lg.connect(fl.frequency);g2.gain.value=g;o.connect(fl);fl.connect(g2);g2.connect(G);o.start();lf.start();G._o.push(o,lf)}
  // compose: seeded motifs in the track's mode, phrase form A A' B A
  let sd=T.seed;const R=()=>{sd=(sd*16807)%2147483647;return sd/2147483647};const sc=T.scale,N=sc.length;
  const motif=()=>{let i=Math.floor(N/2),m=[];for(let k=0;k<8;k++){i=Math.max(0,Math.min(N-1,i+Math.round((R()-.5)*3.2)));m.push(R()<T.rest?-1:i)}m[7]=R()<.5?0:2;return m};
  const A=motif(),B=motif(),A2=A.map((x,k)=>k>4&&x>=0?Math.max(0,x-1):x),form=[A,A2,B,A,B.map(x=>x>=0?Math.min(N-1,x+2):x),A2,A,A];
  const beat=60/T.bpm/2;let st=0,t0=c.currentTime+.4;const total=form.length*8;const len=T.dur;this._tt0=c.currentTime;
  const play=()=>{if(this.tg!==G)return;const now=c.currentTime;while(t0<now+.6){const bt=BV?beat*.8:beat,ph=form[Math.floor(st/8)%form.length],i=ph[st%8];
    if(i>=0){const f=T.root*Math.pow(2,sc[i]/12),acc=st%8===0;this.inst(T.lead,f,t0,bt*(T.lead==='pipe'?2:1),acc?1.15:1,G);if(T.second&&st%2===0&&R()<.5)this.inst(T.second,T.root*Math.pow(2,sc[Math.max(0,i-2)]/12)/2,t0+bt*.5,bt,.7,G)}
    const dc=T.drum[st%T.drum.length];if(dc!=='.')this.drum(dc,t0,G,BV?1.3:1);st++;t0+=bt;if(st%total===0&&R()<.5)st=0}
   if(c.currentTime-this._tt0>len){this.playTrack((n+1)%MTRACKS.length);return}setTimeout(play,150)};play()},
 inst(k,f,t,d,a,G){const c=this.ctx;
  if(k==='lyre'){this.tone(f,2.2,.13*a,'triangle',t,G);this.tone(f*2.002,1.3,.05*a,'sine',t,G);this.tone(f*3,.6,.025*a,'sine',t,G);this.noise(.03,f*5,3,.04*a,'bandpass',t,G)}
  else if(k==='oud'){const o=c.createOscillator(),fl=c.createBiquadFilter(),g=c.createGain();o.type='sawtooth';o.frequency.setValueAtTime(f*.985,t);o.frequency.exponentialRampToValueAtTime(f,t+.05);fl.type='lowpass';fl.frequency.setValueAtTime(f*7,t);fl.frequency.exponentialRampToValueAtTime(f*1.5,t+.5);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.11*a,t+.004);g.gain.exponentialRampToValueAtTime(.0005,t+1.1);o.connect(fl);fl.connect(g);g.connect(G);o.start(t);o.stop(t+1.2);this.noise(.02,2500,2,.03*a,'bandpass',t,G)}
  else if(k==='pipe'){for(const dt of[-6,7]){const o=c.createOscillator(),fl=c.createBiquadFilter(),g=c.createGain(),v=c.createOscillator(),vg=c.createGain();o.type='square';o.frequency.value=f;o.detune.value=dt;v.frequency.value=5.2;vg.gain.value=f*.012;v.connect(vg);vg.connect(o.frequency);fl.type='bandpass';fl.frequency.value=f*2.2;fl.Q.value=1.4;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05*a,t+.06);g.gain.setValueAtTime(.045*a,t+d*.8);g.gain.exponentialRampToValueAtTime(.0005,t+d*1.15);o.connect(fl);fl.connect(g);g.connect(G);o.start(t);v.start(t);o.stop(t+d*1.2);v.stop(t+d*1.2)}this.noise(d*.9,f*3,1,.012*a,'bandpass',t,G)}},
 drum(k,t,G,a){if(k==='D'){this.tone(95,.35,.32*a,'sine',t,G,48);this.noise(.12,180,1,.12*a,'lowpass',t,G)}else if(k==='k'){this.tone(210,.12,.12*a,'sine',t,G,150);this.noise(.06,900,1.5,.1*a,'bandpass',t,G)}else if(k==='t'){this.noise(.04,3200,2,.08*a,'bandpass',t,G)}},
