// Stores C check. This repo has no tests/ui_bits_check.gd.
// The old panel check looked for the string "Total food" (city stores plus a cap).
// This check does not require that string. It checks the sim getter Nisaba calls:
//   Arrivals.spare_food(g, eco) and Arrivals.town_food_days(g, eco)
// and that the city-store feed (granary trip, city spoil tooltip) is gone.
// Play shipping is root index.html. It must not gain this API.
const fs=require('fs');const path=require('path');
const root=path.resolve(__dirname,'..');
const beta=fs.readFileSync(path.join(root,'beta/index.html'),'utf8');
const play=fs.readFileSync(path.join(root,'index.html'),'utf8');
const fail=[];
const need=(ok,msg)=>{if(!ok)fail.push(msg)};
need(beta.includes('function town_food_days'),'town_food_days missing');
need(beta.includes('function spare_food'),'spare_food missing');
need(beta.includes('Arrivals={spare_food,town_food,town_food_days}'),'Arrivals export missing');
need(beta.includes('E._fv'),'Stockyard grain view missing');
need(!beta.includes('per day in city stores'),'city-store spoil tooltip still fed');
need(!beta.includes('royal granary: Stockyard feeds'),'granary trip into city stores still fed');
need(!beta.includes('buy from the town granary'),'town-granary buy still fed');
need(!beta.includes("['bread','town','grain']"),'crafter food still tries the town granary');
need(!play.includes('town_food_days')&&!play.includes('STORES_C_BEGIN'),'Play index.html was changed');
const a=beta.indexOf('const ARR_FAM_KEEP_DAYS'),b=beta.indexOf('/* STORES_C_END */');
need(a>0&&b>a,'getter block markers missing');
const src=beta.slice(a,b);
const ECOFOOD=['berries','bread','fish','dairy','meat','smeat','grain'];
const BREAD_FV=3;
function FOOD_DAY(){return 100}
function plFood(s){return s._food}
eval(src);
const g={fam:{L:[
 {st:'stead',l:1,m:[{},{},{},{}]},
 {st:'craft',l:2,m:[{},{}]},
 {st:'pend',m:[{}]}
]}};
const eco={hold:{grain:1000,bread:10,timber:50},mkt:{grain:50,beer:9},steads:[{id:1,_food:2100}],cr:[{id:2,c:'baker',gr:100,stk:20,pan:0}]};
const Sfd=Arrivals.spare_food(g,eco);
need(Sfd.crown===1030,'crown grain-worth '+Sfd.crown);
need(Sfd.mkt===50,'market grain-worth '+Sfd.mkt);
need(Sfd.fam===500,'household surplus '+Sfd.fam);
need(Sfd.food===1580,'town food '+Sfd.food);
need(Sfd.day===700,'daily eat '+Sfd.day);
need(Math.abs(Arrivals.town_food_days(g,eco)-1580/700)<1e-9,'days '+Arrivals.town_food_days(g,eco));
need(Arrivals.town_food(g,eco)===1580,'town_food wrapper');
const under={fam:{L:[{st:'stead',l:1,m:[{},{}]}]}};
const eco2={hold:{grain:0},mkt:{},steads:[{id:1,_food:100}],cr:[]};
const U=Arrivals.spare_food(under,eco2);
need(U.fam===0,'keep is not subtracted below zero');
need(U.day===200,'two members at FOOD_DAY');
const none=Arrivals.spare_food({fam:{L:[]}},{hold:{grain:100},mkt:{}});
need(none.day===100,'empty roster still has one ration in the denominator');
need(none.food/none.day===1,'days for one ration of stock');
if(fail.length){console.error(fail.join('\n'));process.exit(1)}
console.log('ui_bits_check ok',Arrivals.town_food_days(g,eco));
