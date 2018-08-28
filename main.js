// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, Tray, Menu, shell, nativeImage, Notification} = require('electron');
const parser = require('./js/feedparse.js');
const sorting = require('./js/sorting.js');
const main_cron = require('./js/main_cron.js');
const fs = require('fs');
const notifier = require('node-notifier');
const settings = require('electron-settings');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.


let mainWindow = null;
let tray = null;
var settingsOpen = false;
let settingsWindow = null;
var addOpen = false;
let addWindow = null;
var unseen;


global.sharedObj = {title: 'RSS FEED READER PLUS'};

function createWindow () {
  
  mainWindow = new BrowserWindow({width: 1200, height: 600, frame: false, minWidth: 800, minHeight: 400, transparent: true, icon: nativeImage.createFromPath('./img/64.ico')});

  mainWindow.setMenu(null);

  mainWindow.loadFile('html/index.html');

  //mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null
  });
}


app.on('ready', () => {

  app.setAppUserModelId("RSS FEED READER PLUS");

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

  var lw = app.getPath('userData') + "/last_written.txt";
  var dl = (new Date()).toString();
  if (!fs.existsSync(lw)) {
    fs.writeFile(lw, dl, (err) => {
      if (err) {
        console.log(err);
      }
    });
    console.log('added new last_written');
  }

  //default settings
  if (!settings.has('main')) {

    settings.set('main', {

      refresh: 300,
      theme: 'default',
      launch_start: true,
      start_tray: true,
      opacity: 96,
      notifications: true

    });

  }

  if (!settings.has('articles')) {

    settings.set('articles', {

      unseen: 0

    })

  }

  unseen = settings.get('articles.unseen');

  //settings.delete('main');

  tray = new Tray(nativeImage.createFromPath('./img/64.ico'));
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
        
        addWindow = new BrowserWindow({width: 500, height: 400, frame: false, minWidth: 500, minHeight: 400, transparent: true, icon: nativeImage.createFromPath('./img/64.ico')});
    
        addWindow.setMenu(null);
    
        addWindow.loadFile('html/addfeed.html');
    
        // Open the DevTools.
        //addWindow.webContents.openDevTools();
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
        
        settingsWindow = new BrowserWindow({width: 800, height: 700, frame: false, minWidth: 800, minHeight: 400, transparent: true, icon: nativeImage.createFromPath('./img/64.ico')});
    
        settingsWindow.setMenu(null);
    
        settingsWindow.loadFile('html/settings.html');
    
        // Open the DevTools.
        settingsWindow.webContents.openDevTools();
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
  tray.setToolTip('(' + unseen + ') ' + global.sharedObj.title);
  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    if (mainWindow == null) {
      createWindow();
    } else {
      mainWindow.focus();
    }
  });

  console.log('\033[0;36mThe app is now running.\033[0m');

  var cron = main_cron.start();
  cron.then( (arg) => {}).catch( (reason) => {
    console.log(reason);
  });
  var nowCron = main_cron.now();
  nowCron.then( (arg) => {}).catch( (reason) => {
    console.log(reason);
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
    
    settingsWindow = new BrowserWindow({width: 800, height: 700, frame: false, minWidth: 800, minHeight: 400, transparent: true, icon: nativeImage.createFromPath('./img/64.ico')});

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
    
    addWindow = new BrowserWindow({width: 500, height: 400, frame: false, minWidth: 500, minHeight: 400, transparent: true, icon: nativeImage.createFromPath('./img/64.ico')});

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

  var feed = parser.feed(arg, 0);
  feed.then( (res) => {

    console.log(res.feed.items.length);
    event.sender.send('link-reply', true);

    var write = parser.writeData(arg, res.feed.items);
    write.then( (response) => {

      var save = parser.saveData(response, arg, res.feed.head);

      save.then( (saveRes) => {

        if (saveRes) {

          console.log('datafile written');
          editing = response;
          setTimeout(() => addWindow.close(), 1500);

          setTimeout(() => {
            var editWindow = new BrowserWindow({width: 1000, height: 800, frame: false, minWidth: 700, minHeight: 400, transparent: true, icon: nativeImage.createFromPath('./img/64.ico')});

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

  var getData = parser.readData(editing, 0);

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


      var feed = parser.feed(arg, 0);
      feed.then( (res) => {

        console.log(res.feed.items.length);
        event.sender.send('link-reply', true);

        var write = parser.writeData(arg, res.feed.items);
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

ipcMain.on('reload', (event, arg) => {

  if (arg.get == 'latest') {

    var getHeads = parser.readHeads();

    getHeads.then ( (response) => {

      var feeds = [];
      var inc = 0;
      
      var sendIt = () => {
        console.log('Getting latest feeds');
        var articles = sorting.latest(feeds);
        articles.then ( (arts) => {
          console.log(arts[0].title);
          event.sender.send('reloaded', {arts: arts, num: arg.num});
        }).catch ( (err) => {
          console.log(err);
        });
        
        
      }

      var resolution = (feed) => {
        
        feeds.push(feed);

        //bubble sort
        for (var i = 0; i < feeds.length; i++) {
          for (var j = 0; j < feeds.length - i - 1; j++) {

            if (feeds[j].x > feeds[j + 1].x) {

              var tmp = feeds[j]; 
              feeds[j] = feeds[j + 1];
              feeds[j + 1] = tmp;

            }

          }

        }

        if (inc == response.length - 1) {
          sendIt();
        }
        inc += 1;

      }


      for (var x = 0; x < response.length; x++) {

        var name = response[x].name;

        var reader = parser.readData(name, x);

        reader.then ( (response2) => {
          resolution(response2);
        }).catch( (reason2) => {
          console.log(reason2);
        });
          
      }

    }).catch( (reason) => {
      console.log(reason);
    });
    
  }

  if (arg.get == 'feed') {

    var getFeed = parser.readData(arg.name, arg.num);
    getFeed.then( (response) => {

      event.sender.send('reloaded', {arts: response.obj.items, num: 10, title: response.head.title});

    }).catch ( (err) => {
      console.log(err);
    })

  }

});

ipcMain.on('quit', () => {

  if (process.platform !== 'darwin') {
    app.quit();
  }

});

ipcMain.on('link', (event, arg) => {

  shell.openExternal(arg);

});

ipcMain.on('getLatestTime', (event) => {

  var loc = app.getPath('userData') + "/last_written.txt";
  fs.readFile(loc, 'utf8', (err, data) => {
    if (err) {
      console.log('noExist');
    } else {
      lastTime = data;
      event.sender.send('latestTime', lastTime);
    }
  });

});

ipcMain.on('reGet', (event) => {

  var now = main_cron.now();
  now.then( () => {
  }).catch( (error) => {
    console.log(error);
  })

});

ipcMain.on('settings', (event) => {

  var mainSet = settings.get('main');
  event.sender.send('mainSet', mainSet);

});

ipcMain.on('updateSet', (event, arg) => {

  settings.set('main', {

    refresh: arg.refresh,
    theme: arg.theme,
    launch_start: arg.launch_start,
    start_tray: arg.start_tray,
    opacity: arg.opacity,
    notifications: arg.notifications

  });

  event.sender.send('mainSet', arg)

});

global.output = {

  latestRefresh: () => {

    if (mainWindow != null) {

      mainWindow.webContents.send('newArticles', "");

    }

  },

  notify: (title, body) => {

    unseen += 1;

    tray.setToolTip('(' + unseen + ') ' + global.sharedObj.title);

    notifier.notify({  
      title: title,
      message: body,
      icon: './img/64.png',
      sound: true,
      wait: true
    });

  }

}
