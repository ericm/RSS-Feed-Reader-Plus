// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, Tray, Menu, shell} = require('electron');
const parser = require('./js/feedparse.js');
const fs = require('fs');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.


let mainWindow = null;
let tray = null;
var settingsOpen = false;
let settingsWindow = null;
var addOpen = false;
let addWindow = null;


global.sharedObj = {title: 'RSS FEED READER PLUS'};

function createWindow () {
  
  mainWindow = new BrowserWindow({width: 1200, height: 600, frame: false, minWidth: 800, minHeight: 400, transparent: true, icon: './img/64.ico'});

  mainWindow.setMenu(null);

  mainWindow.loadFile('html/index.html');

  mainWindow.webContents.openDevTools();

  //check / create folders
  var rssDir = app.getPath('userData') + "/rss-feeds";
  if (!fs.existsSync(rssDir)) {
    fs.mkdirSync(rssDir);
    console.log('added folder')
  }
  
  var obj = JSON.stringify({
    feeds: []
  });
  
  var data = app.getPath('userData') + "/data.json";
  if (!fs.existsSync(data)) {
    fs.writeFile(data, obj, (err) => {
      if (err) {
        console.log(err);
      }
    });
    console.log('added new datafile');
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  });
}


app.on('ready', () => {
  tray = new Tray('./img/64.ico');
  const contextMenu = Menu.buildFromTemplate([
    {label: 'Show Latest', click() {
      if (mainWindow == null) {
        createWindow();
      } else {
        mainWindow.focus();
      }
    }},
    {type: 'separator'},
    {label: 'Add Feed', click() {

      if (!addOpen) {
        addOpen = true;
        console.log('opened add'); 
        
        addWindow = new BrowserWindow({width: 500, height: 400, frame: false, minWidth: 500, minHeight: 400, transparent: true, icon: './img/64.ico'});
    
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

    }},
    {label: 'Settings', click() {
      if (!settingsOpen) {

        settingsOpen = true;
        console.log('opened settings'); 
        
        settingsWindow = new BrowserWindow({width: 800, height: 400, frame: false, minWidth: 800, minHeight: 400, transparent: true, icon: './img/64.ico'});
    
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
    }},
    {type: 'separator'},
    {label: 'Quit', click() {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    }}
  ]);
  tray.setToolTip(global.sharedObj.title);
  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    if (mainWindow == null) {
      createWindow();
    } else {
      mainWindow.focus();
    }
  });
});


app.on('window-all-closed', () => {

  if (process.platform !== 'darwin') {
    //app.quit()
  }
});

app.on('activate', () => {

  if (mainWindow === null) {
    createWindow()
  }
});



ipcMain.on('settings-page', (event, arg) => {
  if (!settingsOpen) {

    settingsOpen = true;
    console.log('opened settings'); 
    
    settingsWindow = new BrowserWindow({width: 800, height: 400, frame: false, minWidth: 800, minHeight: 400, transparent: true, icon: './img/64.ico'});

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



ipcMain.on('add-page', (event, arg) => {

  if (!addOpen) {
    addOpen = true;
    console.log('opened add'); 
    
    addWindow = new BrowserWindow({width: 500, height: 400, frame: false, minWidth: 500, minHeight: 400, transparent: true, icon: './img/64.ico'});

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

var editing;

ipcMain.on('add-link', (event, arg) => {

  var feed = parser.feed(arg);
  feed.then( (res) => {

    console.log(res.items.length);
    event.sender.send('link-reply', true);

    var write = parser.writeData(arg, res.items);
    write.then( (response) => {

      var save = parser.saveData(response, arg, res.head);

      save.then( (saveRes) => {

        if (saveRes) {

          console.log('datafile written');
          editing = response;
          setTimeout(() => addWindow.close(), 1500);

          setTimeout(() => {
            var editWindow = new BrowserWindow({width: 1000, height: 800, frame: false, minWidth: 700, minHeight: 400, transparent: true, icon: './img/64.ico'});

            editWindow.setMenu(null);
  
            editWindow.loadFile('html/edit.html');
  
            // Open the DevTools.
            editWindow.webContents.openDevTools();
            editWindow.on('closed', () => {
              editWindow  = null
            });

          }, 1500);
          
        }
      }).catch( (reasonSave) => {
        console.log(reasonSave);
      });

      console.log("written");
      
    }).catch( (reason) => {

      console.log(reason);

      if (reason == 'exists') {
        event.sender.send('exist-reply', true);
      }

      setTimeout(() => addWindow.close(), 3000);

    });
      
    
  }).catch( (reason) => {
    
    console.log(reason);
    event.sender.send('link-reply', false);
    setTimeout(() => addWindow.close(), 3000);

  });

});

ipcMain.on('editing', (event) => {

  console.log('editing ' + editing);

  var getData = parser.readData(editing);

  var theFeedObj;

  getData.then( (response) => {
    
    theFeedObj = response;

    var heads = parser.readHeads();

    heads.then( (resp) => {
      mainWindow.webContents.send('refreshed-new', resp);
    }).catch( (reason) => {
      if (reason == 'restart') {
        console.log(reason);
      }
    });

    event.sender.send('edit_this', theFeedObj);

  }).catch(  (reason) => {
    if (reason == 'restart') {
      console.log(reason);
    }
    if (reason == 'noExist') {
      console.log(reason);


      var feed = parser.feed(arg);
      feed.then( (res) => {

        console.log(res.items.length);
        event.sender.send('link-reply', true);

        var write = parser.writeData(arg, res.items);
        write.then( (response) => {
          console.log('fixed ' + response);
        }).catch( (reasonSave) => {
          console.log(reasonSave);
        });

      console.log("re-written");
      
      }).catch( (reason) => {

        console.log(reason);

        if (reason == 'exists') {
          event.sender.send('exist-reply', true);
        }

      });
    }
  });
 
});

ipcMain.on('refresh', (event) => {

  var heads = parser.readHeads();

  heads.then( (response) => {
    event.sender.send('refreshed', response);
  }).catch( (reason) => {
    if (reason == 'restart') {
      console.log(reason);
    }
  });

});

ipcMain.on('quit', () => {

  if (process.platform !== 'darwin') {
    app.quit();
  }

});

ipcMain.on('link', (event, arg) => {

  shell.openExternal(arg);

});
