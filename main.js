const electron = require('electron');
const { app, BrowserWindow, ipcMain, dialog,Menu } = electron;
const url = require('url');
const path = require('path');
const fs = require('fs');

let win;
let filepath = undefined;

app.on('ready',()=>{
    win = new BrowserWindow({
        width:1300,
        height:800,
        webPreferences:{
            nodeIntegration:true
        }
    });
    win.loadURL(url.format({
        pathname: path.join(__dirname,'index.html'),
        protocol:'file:',
        slashes:true
    }));
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
    win.on('closed',()=>{
        app.quit();
    });
});
app.on('window-all-closed',()=>{
    if(process.platform !== 'darwin')
        app.quit();
});
app.on('activate',()=>{
    if(BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
});

ipcMain.on('savetext',(event,text)=>{
    if(filepath === undefined){
        dialog.showSaveDialog(win,{
            defaultPath:'filename.txt'
        }).then((canceled,filePath)=>{
            if(canceled.filePath){
                filepath = canceled.filePath;
                writeToFile(filepath,text);
            }
        })
        .catch(err=>console.log(err));
    }
    else{
        writeToFile(filepath,text);
    }
});

function writeToFile(filepath,text){
    fs.writeFile(filepath,text,(err)=>{
        if(err)
            console.log('There was an error',err);
        else 
            console.log('File has been saved');
        win.webContents.send('saved','success');
    });
}


const menuTemplate = [
    {
        label:'File',
        submenu:[
            {
                label:'Save',
                accelerator: process.platform == 'darwin' ? 'Command+S' : 'Ctrl+S',
                click() {
                    win.webContents.send('save-clicked');
                }
            },
            {
                label:'Save As',
                accelerator: process.platform == 'darwin' ? 'Command+Shift+S' : 'Ctrl+Shift+S',
                click() {
                    filepath = undefined;
                    win.webContents.send('save-clicked');
                }
            },
            {
                label:'Exit',
                accelerator:process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    },
    {role:'editMenu'}
];
if(process.platform === 'darwin'){
    menuTemplate.unshift({
        label: app.getName(),
        submenu: [
          { role: 'about' }
        ]
      })
}

