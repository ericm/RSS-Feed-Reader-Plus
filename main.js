// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, Tray, Menu, shell, nativeImage, Notification} = require('electron');
const parser = require('./js/feedparse.js');
const sorting = require('./js/sorting.js');
const main_cron = require('./js/main_cron.js');
const editUpdater = require('./js/editUpdater.js');
const fs = require('fs');
const notifier = require('node-notifier');
const settings = require('electron-settings');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.


let mainWindow = null;
let tray = null;
let settingsOpen = false;
let settingsWindow = null;
let addOpen = false;
let addWindow = null;
let unseen;


global.sharedObj = {title: 'RSS FEED READER PLUS'};

//Check OS Type
let desktopImg = nativeImage.createFromPath('./img/64.ico');;
let desktopImgNew = nativeImage.createFromPath('./img/64n.ico');

if (process.platform == 'linux') {

  desktopImg = nativeImage.createFromPath('./img/64.png');
  desktopImgNew = nativeImage.createFromPath('./img/64n.png');

}



function createWindow () {
  
  mainWindow = new BrowserWindow({width: 1200, height: 600, frame: false, minWidth: 800, minHeight: 400, transparent: true, icon: desktopImg});

  mainWindow.setMenu(null);

  mainWindow.loadFile('html/index.html');

  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null
  });
}


app.on('ready', () => {

  app.setAppUserModelId("RSS FEED READER PLUS");

  //check / create folders
  let rssDir = app.getPath('userData') + "/rss-feeds";
  if (!fs.existsSync(rssDir)) {
    fs.mkdirSync(rssDir);
    console.log('added folder');
  }
  
  let obj = JSON.stringify({
    feeds: []
  });
  
  let data = app.getPath('userData') + "/data.json";
  if (!fs.existsSync(data)) {
    fs.writeFile(data, obj, (err) => {
      if (err) {
        console.log(err);
      }
    });
    console.log('added new datafile');
  }

  let lw = app.getPath('userData') + "/last_written.txt";
  let dl = (new Date()).toString();
  if (!fs.existsSync(lw)) {
    fs.writeFile(lw, dl, (err) => {
      if (err) {
        console.log(err);
      }
    });
    console.log('added new last_written');
  }

  let rulesDir = app.getPath('userData') + "/rules";
  if (!fs.existsSync(rulesDir)) {
    fs.mkdirSync(rulesDir);
    console.log('added rules folder');
  }

  //default settings
  if (!settings.has('main')) {

    settings.set('main', {

      refresh: 30,
      theme: 'default',
      launch_start: true,
      start_tray: true,
      opacity: 96,
      notifications: true,
      shadows: true

    });

  }

  if (!settings.has('articles')) {

    settings.set('articles', {

      unseen: 0

    });

  }

  if (!settings.has('silent')) {

    settings.set('silent', false);

  }

  if (!settings.has('rules')) {

    settings.set('rules', []);

  }

  unseen = settings.get('articles.unseen');

  //settings.delete('main');

  //Set global settings

  global.settings = settings.getAll();

  tray = new Tray(desktopImg);
  const contextMenu = Menu.buildFromTemplate([
    {label: 'Show Latest', click() {
      if (mainWindow == null) {
        createWindow();
      } else {
        mainWindow.focus();
      }
    }},
    {type: 'separator'},
    {label: 'Silent Mode', type:'checkbox', checked: settings.get('silent'), click() {

      if (settings.get('silent')) {
        settings.set('silent', false);
      } else {
        settings.set('silent', true);
      }

    }},
    {type: 'separator'},
    {label: 'Add Feed', click() {

      if (!addOpen) {
        addOpen = true;
        console.log('opened add'); 
        
        addWindow = new BrowserWindow({width: 500, height: 400, frame: false, minWidth: 500, minHeight: 400, transparent: true, icon: desktopImg});
    
        addWindow.setMenu(null);
    
        addWindow.loadFile('html/addfeed.html');
    
        // Open the DevTools.
        //addWindow.webContents.openDevTools();
        addWindow.on('closed', () => {
          addWindow = null;
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
        
        settingsWindow = new BrowserWindow({width: 800, height: 700, frame: false, minWidth: 800, minHeight: 400, transparent: true, icon: desktopImg});
    
        settingsWindow.setMenu(null);
    
        settingsWindow.loadFile('html/settings.html');
    
        // Open the DevTools.
        settingsWindow.webContents.openDevTools();
        settingsWindow.on('closed', () => {
          settingsWindow = null;
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

  if (unseen > 0) {

    tray.setImage(nativeImage.createFromPath('./img/64n.ico'));

  }

  if(!settings.get('main.start_tray')) {

    createWindow();

  }

  console.log('\033[0;36mThe app is now running.\033[0m');

  let cron = main_cron.start();
  cron.then( (arg) => {}).catch( (reason) => {
    console.log(reason);
  });
  let nowCron = main_cron.now();
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
    createWindow();
  }
});



ipcMain.on('settings-page', (event, arg) => {
  if (!settingsOpen) {

    settingsOpen = true;
    console.log('opened settings'); 
    
    settingsWindow = new BrowserWindow({width: 800, height: 700, frame: false, minWidth: 800, minHeight: 400, transparent: true, icon: desktopImg});

    settingsWindow.setMenu(null);

    settingsWindow.loadFile('html/settings.html');

    // Open the DevTools.
    //settingsWindow.webContents.openDevTools();
    settingsWindow.on('closed', () => {
      settingsWindow = null;
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
    
    addWindow = new BrowserWindow({width: 500, height: 400, frame: false, minWidth: 500, minHeight: 400, transparent: true, icon: desktopImg});

    addWindow.setMenu(null);

    addWindow.loadFile('html/addfeed.html');

    // Open the DevTools.
    addWindow.webContents.openDevTools();
    addWindow.on('closed', () => {
      addWindow = null;
      addOpen = false;
    });
  } else {

    addWindow.focus();

  }
  
});

let editing;

ipcMain.on('add-link', (event, arg) => {

  let feed = parser.feed(arg, 0);
  feed.then( (res) => {

    console.log(res.feed.items.length);
    event.sender.send('link-reply', true);

    let write = parser.writeData(arg, res.feed.items);
    write.then( (response) => {

      let save = parser.saveData(response, arg, res.feed.head);

      save.then( (saveRes) => {

        if (saveRes) {

          console.log('datafile written');
          editing = response;
          setTimeout(() => addWindow.close(), 1500);

          setTimeout(() => {
            let editWindow = new BrowserWindow({width: 600, height: 600, frame: false, minWidth: 700, minHeight: 400, transparent: true, icon: desktopImg});

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

      if (reason === 'exists') {
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

ipcMain.on('edit', (event, arg) => {

  let readHead = parser.readHeads();
  readHead.then( (res) => {

    editing = res[arg].name;

    let editWindow = new BrowserWindow({width: 600, height: 600, frame: false, minWidth: 700, minHeight: 400, transparent: true, icon: desktopImg});

    editWindow.setMenu(null);
  
    editWindow.loadFile('html/edit.html');
  
    // Open the DevTools.
    editWindow.webContents.openDevTools();
    editWindow.on('closed', () => {
      editWindow  = null
    });

  }).catch( (reas) => {

    console.log(reas);

  });
  

});

ipcMain.on('editing', (event) => {

  console.log('editing ' + editing);

  let getData = parser.readData(editing, 0);

  let theFeedObj;

  getData.then( (response) => {
    
    theFeedObj = response;

    let heads = parser.readHeads();

    heads.then( (resp) => {
      mainWindow.webContents.send('refreshed-new', resp);
    }).catch( (reason) => {
      if (reason === 'restart') {
        console.log(reason);
      }
    });

    event.sender.send('edit_this', theFeedObj);

  }).catch(  (reason) => {
    if (reason === 'restart') {
      console.log(reason);
    }
    if (reason === 'noExist') {
      console.log(reason);


      let feed = parser.feed(arg, 0);
      feed.then( (res) => {

        console.log(res.feed.items.length);
        event.sender.send('link-reply', true);

        let write = parser.writeData(arg, res.feed.items);
        write.then( (response) => {
          console.log('fixed ' + response);
        }).catch( (reasonSave) => {
          console.log(reasonSave);
        });

      console.log("re-written");
      
      }).catch( (reason) => {

        console.log(reason);

        if (reason === 'exists') {
          event.sender.send('exist-reply', true);
        }

      });
    }
  });
 
});

ipcMain.on('refresh', (event) => {

  let heads = parser.readHeads();

  heads.then( (response) => {
    event.sender.send('refreshed', response);
  }).catch( (reason) => {
    if (reason === 'restart') {
      console.log(reason);
    }
  });

});

ipcMain.on('reload', (event, arg) => {

  if (arg.get === 'latest') {

    let getHeads = parser.readHeads();

    getHeads.then ( (response) => {

      let feeds = [];
      let inc = 0;
      
      let sendIt = () => {

        console.log('Getting latest feeds');

        let articles = sorting.latest(feeds);
        articles.then ( (arts) => {
          
          console.log(arts[0].title);
          event.sender.send('reloaded', {arts: arts, num: arg.num});

        }).catch ( (err) => {
          console.log(err);
        });
        
      };

      let resolution = (feed) => {
        
        feeds.push(feed);

        //bubble sort
        for (let i = 0; i < feeds.length; i++) {
          for (let j = 0; j < feeds.length - i - 1; j++) {

            if (feeds[j].x > feeds[j + 1].x) {

              let tmp = feeds[j]; 
              feeds[j] = feeds[j + 1];
              feeds[j + 1] = tmp;

            }

          }

        }

        if (inc === response.length - 1) {
          sendIt();
        }
        inc += 1;

      };


      for (let x = 0; x < response.length; x++) {

        let name = response[x].name;

        let reader = parser.readData(name, x);

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

  if (arg.get === 'feed') {

    let getFeed = parser.readData(arg.name, arg.num);
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

  let loc = app.getPath('userData') + "/last_written.txt";
  fs.readFile(loc, 'utf8', (err, data) => {
    if (err) {
      console.log('noExist');
    } else {
        event.sender.send('latestTime', data);
    }
  });

});

ipcMain.on('reGet', () => {

  let now = main_cron.now();
  now.then( () => {
  }).catch( (error) => {
    console.log(error);
  });

});

ipcMain.on('settings', (event) => {

  let mainSet = settings.get('main');
  event.sender.send('mainSet', mainSet);

});

ipcMain.on('updateSet', (event, arg) => {

  settings.set('main', {

    refresh: arg.refresh,
    theme: arg.theme,
    launch_start: arg.launch_start,
    start_tray: arg.start_tray,
    opacity: arg.opacity,
    notifications: arg.notifications,
    shadows: arg.shadows

  });

  event.sender.send('mainSet', arg)

});


ipcMain.on('changeOrder', (event, arg) => {

  let changer = parser.changeOrder(arg.id, arg.position, arg.old);

  changer.then( (heads) => {

    event.sender.send('newList', heads);

  }).catch( (reason) => {

    throw reason;

  });

});


let trayUpdate = () => {

  settings.set('articles', {

    unseen: unseen

  });

  tray.setToolTip('(' + unseen + ') ' + global.sharedObj.title);

  if (unseen === 0) {
    tray.setImage(desktopImg);
  } else {
    tray.setImage(desktopImgNew);
  }

};

ipcMain.on('read', (event, arg) => {

  let title = arg.titleArt.replace(/U0027/g, "'").replace(/U0022/g, '"').replace(/U0060/g, '"').replace(/U0061/g, ',');
  let pubdate = arg.pubdate;
  let feed = arg.feed.replace(/U0027/g, "'").replace(/U0022/g, '"').replace(/U0060/g, '"').replace(/U0061/g, ',');
  let newArt = arg.newArt;

  let makeRead = parser.makeRead(title, pubdate, feed, newArt);
  makeRead.then ( (response) => {

    if (response) {

      unseen -= 1;

      if (unseen < 0) {
        unseen = 0;
      }

      trayUpdate();

      let addToFeed = parser.addUnseenData(feed, -1);
      addToFeed.then( (arg) => {

        if (mainWindow != null) {

          let heads = parser.readHeads();
    
          heads.then( (resp) => {
            mainWindow.webContents.send('newList', resp);
          }).catch( (reason) => {
            if (reason === 'restart') {
              console.log(reason);
            }
          });
    
        }

      }).catch( (reason) => {

        console.log(reason);

      });

      

    }

  }).catch( (err) => {

    console.log(err);

  });

});

ipcMain.on('unread', (event, arg) => {

  let title = arg.titleArt.replace(/U0027/g, "'").replace(/U0022/g, '"').replace(/U0060/g, '"').replace(/U0061/g, ',');
  let pubdate = arg.pubdate;
  let feed = arg.feed.replace(/U0027/g, "'").replace(/U0022/g, '"').replace(/U0060/g, '"').replace(/U0061/g, ',');
  
  parser.makeUnread(title, pubdate, feed).then ( () => {

    unseen += 1;

    if (unseen < 0) {
      unseen = 0;
    }

    trayUpdate();

    let addToFeed = parser.addUnseenData(feed, 1);
      addToFeed.then( () => {

        if (mainWindow != null) {

          let heads = parser.readHeads();
    
          heads.then( (resp) => {
            mainWindow.webContents.send('newList', resp);
          }).catch( (reason) => {
            if (reason === 'restart') {
              console.log(reason);
            }
          });
    
        }

      }).catch( (reason) => {

        console.log(reason);

      });

  }).catch ( (err) => {

    throw err;

  });

});

ipcMain.on('allRead', (event, arg) => {

  if (arg === 'latest') {

    let getHeads = parser.readHeads();
    getHeads.then( (heads) => {

      let final = heads.length;
      let counting = 0;

      for (let x in heads) {

        let makeRead = parser.makeFeedRead(heads[x].name);
        makeRead.then( (response) => {

          let addToFeed = parser.addUnseenDataAll(response.name);
          addToFeed.then( () => {

            counting += 1;
            if (counting === final) {

              unseen = 0;

              if (unseen < 0) {
                unseen = 0;
              }
        
              trayUpdate();
  
              mainWindow.webContents.send('readLatest', heads);

            }

          }).catch((err3) => {
            console.log(err3)
          });

        }).catch((err2) => {
          console.log(err2);
        });

      } 

    });

  } else {

    let getHeads = parser.readHeads();
    getHeads.then( (heads) => {

      for (let x in heads) {

        if (arg === heads[x].title) {

          let makeRead = parser.makeFeedRead(heads[x].name);
          makeRead.then( (response) => {

            let addToFeed = parser.addUnseenDataAll(response.name);
            addToFeed.then( () => {

              unseen -= response.take;

              if (unseen < 0) {
                unseen = 0;
              }
        
              trayUpdate();

              mainWindow.webContents.send('readFeed', {feeds: heads, name: response.name});

            }).catch((err3) => {
              console.log(err3)
            });

          }).catch((err2) => {
            console.log(err2);
          });
        }

      }

    }).catch( (err) => {

      console.log(err);

    });

  }

});

ipcMain.on('editSend', (event, arg) => {

  editUpdater.send(arg).then((res) => {
    if (res) {

      parser.readHeads().then((heads) => {

        mainWindow.webContents.send('newList', heads);

      }).catch((reason) => {

        console.log(reason);

      })

    }
  });

});

ipcMain.on('editRule', (event, arg) => {

  console.log(arg);

});

global.output = {

  latestRefresh: () => {

    if (mainWindow != null) {

      mainWindow.webContents.send('newArticles', "");

    }

  },

  notify: (title, body) => {

    unseen += 1;

    let addToFeed = parser.addUnseenData(body, 1);
    addToFeed.then( () => {

      if (mainWindow != null) {

        let heads = parser.readHeads();
  
        heads.then( (resp) => {
          mainWindow.webContents.send('newList', resp);
        }).catch( (reason) => {
          if (reason === 'restart') {
            console.log(reason);
          }
        });
  
      }

    }).catch( (reason) => {

      console.log(reason);

    });

    settings.set('articles', {

      unseen: unseen

    });

    trayUpdate();

    if (!settings.get('silent')) {
      notifier.notify({  
        title: title,
        message: "- " + body,
        icon: './img/64.png',
        sound: true,
        wait: true
      });
    }
    
  }

};
