const {app,BrowserWindow,ipcMain,Menu}=require('electron');const path=require('path'),fs=require('fs');
const dir=path.join(process.env.PORTABLE_EXECUTABLE_DIR||app.getPath('userData'),'BronzeAndBlood-saves'),file=path.join(dir,'saves.json');
function readAll(){try{return JSON.parse(fs.readFileSync(file,'utf8'))}catch(e){return {}}}
ipcMain.on('saves-read',e=>{e.returnValue=readAll()});
ipcMain.on('saves-write',(e,k,v)=>{try{fs.mkdirSync(dir,{recursive:true});const d=readAll();if(v===null)delete d[k];else d[k]=v;fs.writeFileSync(file+'.tmp',JSON.stringify(d));fs.renameSync(file+'.tmp',file);e.returnValue=true}catch(err){e.returnValue=false}});
Menu.setApplicationMenu(null);
app.whenReady().then(()=>{const w=new BrowserWindow({width:1280,height:800,title:'Bronze and Blood',autoHideMenuBar:true,backgroundColor:'#0a0705',webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:false,sandbox:false}});
 w.on('page-title-updated',ev=>ev.preventDefault());w.webContents.on('before-input-event',(ev,i)=>{if(i.type==='keyDown'&&i.key==='F11'){w.setFullScreen(!w.isFullScreen());ev.preventDefault()}});
 w.loadFile(path.join(__dirname,'app','index.html'))});
app.on('window-all-closed',()=>app.quit());
