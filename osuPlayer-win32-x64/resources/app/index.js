const parser=require('osu-parser');
const path=require('path');
const fs=require('fs');
const {app,BrowserWindow,ipcMain,Menu}=require('electron');
const url=require('url');
var setting=require('./settings.json');
var osudir=setting.osupath;
if(!osudir){
    osudir=setting.osupath=path.join(process.env.APPDATA,'../local/osu!/Songs');
    console.log(setting.osupath);
    fs.writeFile('./settings.json',JSON.stringify(setting),err=>{
        if(err)return;
    });
}

var win,sender;
function load(){
    fs.readdir(osudir,(err,dirs)=>{//beatmaps
        if(err)return;
        var list=[];
        console.log('total: '+dirs.length);
        var start=Date.now();
        var cnt=0;
        dirs.forEach(d=>{
            var p=path.join(osudir,d);
            fs.stat(p,(err,stats)=>{
                if(stats.isDirectory()){
                    fs.readdir(p,(err,dirss)=>{//osu files
                        if(err)return;
                        for(var i=0;i<dirss.length;i++){
                            if(dirss[i].endsWith('.osu')){
                                var sp=path.join(p,dirss[i]);
                                parser.parseFile(sp,(err,bm)=>{
                                    if(err)return;
                                    list.push({
                                        title: bm.TitleUnicode||bm.Title,
                                        orititle: bm.Title,
                                        mp3: path.join(p,bm.AudioFilename),
                                        artist: bm.Artist,
                                        id: d.split(' ')[0],
                                        bg: path.join(p,bm.bgFilename||'0')
                                    });
                                    cnt++;
                                    if(cnt%100==0){
                                        console.log('processing: '+cnt);
                                    }
                                    if(cnt==dirs.length){//end
                                        var data=JSON.stringify(list);
                                        endload(data,start);
                                        fs.writeFile('list.json',data,err=>{
                                            if(err)return;
                                        });
                                    }
                                });
                                break;
                            }
                        }
                    }); 
                }
            });
        });
    });
}
function endload(data,start){
    console.log('end loading');
    console.log(Date.now()-start+' ms');
    sender.send('load',data);
}
app.on('ready',createWindow);
app.on('window-all-closed',()=>{
    app.quit()
});
app.on('activate',()=>{
    if(win===null){
        createWindow()
    }
});
ipcMain.on('start',(e,data)=>{
    sender=e.sender;
    console.log('start loading');
    var list=require('./list.json');
    if(list.length==0)load(e);
    else endload(JSON.stringify(list),Date.now());
});
ipcMain.on('reload',(e,data)=>{
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
});
function createWindow () {
    win=new BrowserWindow({width: 400, height: 600,resizable: false});
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
    var menu=Menu.buildFromTemplate(require('./meumTemplate.js')({process,win}));
    Menu.setApplicationMenu(menu);
    win.on('closed', () => {
        win=null
    });
}