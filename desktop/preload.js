// Mirror save keys between localStorage and a JSON file next to the exe
const {ipcRenderer}=require('electron');const KEYS=['bronzeAndBloodSave','bronzerTimeSave','bnbAudio'];
window.addEventListener('DOMContentLoaded',()=>{},{once:true});
try{const d=ipcRenderer.sendSync('saves-read')||{};for(const k of KEYS){if(d[k]!=null)localStorage.setItem(k,d[k])}
 const set=Storage.prototype.setItem,rem=Storage.prototype.removeItem;
 Storage.prototype.setItem=function(k,v){set.call(this,k,v);if(this===localStorage&&KEYS.includes(k))try{ipcRenderer.sendSync('saves-write',k,String(v))}catch(e){}};
 Storage.prototype.removeItem=function(k){rem.call(this,k);if(this===localStorage&&KEYS.includes(k))try{ipcRenderer.sendSync('saves-write',k,null)}catch(e){}};
}catch(e){/* fall back to plain localStorage */}
