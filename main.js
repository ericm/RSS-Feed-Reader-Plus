// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, Tray} = require('electron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
global.sharedObj = {title: 'RSS FEED READER PLUS'};

function createWindow () {
  
  mainWindow = new BrowserWindow({width: 1200, height: 600, frame: false, minWidth: 800, minHeight: 400, transparent: true});

  mainWindow.setMenu(null);

  mainWindow.loadFile('index.html');

  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {

  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {

  if (mainWindow === null) {
    createWindow()
  }
});

var settingsOpen = false;
let settingsWindow;
ipcMain.on('settings-page', (event, arg) => {
  if (!settingsOpen) {
    settingsOpen = true;
    console.log('opened settings'); 
    
    settingsWindow = new BrowserWindow({width: 800, height: 400, frame: false, minWidth: 800, minHeight: 400, transparent: true});

    settingsWindow.setMenu(null);

    settingsWindow.loadFile('html/settings.html');

    // Open the DevTools.
    //settingsWindow.webContents.openDevTools();
    settingsWindow.on('closed', () => {
      settingsWindow = null
      settingsOpen = false;
    });
  } else {
    settingsWindow.focus();
  }
  
  
});

var addOpen = false;
let addWindow;
ipcMain.on('add-page', (event, arg) => {
  if (!addOpen) {
    addOpen = true;
    console.log('opened add'); 
    
    addWindow = new BrowserWindow({width: 500, height: 400, frame: false, minWidth: 500, minHeight: 400, transparent: true});

    addWindow.setMenu(null);

    addWindow.loadFile('html/addfeed.html');

    // Open the DevTools.
    addWindow.webContents.openDevTools();
    addWindow.on('closed', () => {
      addWindow = null
      addOpen = false;
    });
  } else {
    addWindow.focus();
  }
  
  
});
ipcMain.on('add-link', (event, arg) => {
  console.log(arg);
  event.sender.send('link-reply', true)
});