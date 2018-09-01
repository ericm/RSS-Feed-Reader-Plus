const cron = require('node-cron');
const parser = require('../js/feedparse.js');
const {app} = require('electron');
const fs = require('fs');
const settings = require('electron-settings');

global.running = false;

module.exports = {

    start: () => {

        var val = settings.get('main.refresh');

        var str;
        if (val >= 60) {
            str = '* */' + val /60 + ' * * *';
        } else {
            str = '*/' + val + ' * * * *';
        }

        return new Promise( (resolve, reject) => {

            var task = cron.schedule( str, () => {

                if (!global.running) {

                    global.running = true;

                    console.log("looking for new items");

                    var getHeads = parser.readHeads();
        
                    getHeads.then( (arg1) => {

                        if (arg1.length == 0) {
                            global.running = false;
                        }
        
                        for (var x = 0; x < arg1.length; x++) {
        
                            //Compare old and new feeds      
                            //Get stored feed data ->
                            var getData = parser.readData(arg1[x].name, x);
                            getData.then ( (arg2) => {
    
                                var old_items = arg2.obj.items;
        
                                var getCurrent = parser.feed(arg1[arg2.x].link, arg2.x);
        
                                getCurrent.then( (arg3) => {
        
                                    var new_items = arg3.feed.items;
    
                                    var i = 0;
                                    var matched = false;
    
                                    while (!matched) {
    
                                        if (i >= new_items.length) {
                                            break;
                                        }
    
                                        if (typeof old_items[0] === 'undefined') {
                                            break;
                                        }
    
                                        new_items[i].new = true;
                                        new_items[i].read = false;
                                        
                                        var newD = new Date(new_items[i].pubdate).getDate();
                                        var oldD = new Date(old_items[0].pubdate).getDate();
    
                                        if (new_items[i].title == old_items[0].title && newD == oldD) {
    
                                            matched = true;
    
                                            if (i == 0) {
                                                break;
                                            }
                                            
                                            var insert_index = i;
    
                                            var add_items = new_items.slice(0, insert_index);
                    
                                            var insert = add_items.concat(old_items);
    
                                            var writer = parser.rewriteData(arg3.link, insert);
                                            writer.then ( (arg4) => {
    
                                                global.output.latestRefresh();
                                                console.log('refreshed feed: ' + arg4);
    
                                                for (var k = 0; k < add_items.length; k++) {
    
                                                    global.output.notify(add_items[k].title, arg3.feed.head.title);
        
                                                }
    
                                            }).catch( (reason4) => {
                                                reject(reason4);
                                            });
                                                
                                        } else {
    
                                            if (i == new_items.length - 1 && !matched) {
    
                                                matched = true;
    
                                                if (i == 0) {
                                                    break;
                                                }
                                                
                                                var insert_index = i;
        
                                                var add_items = new_items;
                        
                                                var insert = add_items.concat(old_items);
        
                                                var writer = parser.rewriteData(arg3.link, insert);
                                                writer.then ( (arg4) => {
        
                                                    global.output.latestRefresh();
                                                    console.log('refreshed feed: ' + arg4);
        
                                                    for (var k = 0; k < add_items.length; k++) {
        
                                                        global.output.notify(add_items[k].title, arg3.feed.head.title);
            
                                                    }
        
                                                }).catch( (reason4) => {
                                                    reject(reason4);
                                                });
    
                                            }
    
                                        }
                                        
                                        i += 1;
    
                                    }

                                    if (arg3.x == arg1.length - 1) {
                                        global.running = false;
                                    }
        
                                }).catch ( (reason3) => {
                                    reject(reason3);
                                });
        
                            }).catch( (reason2) => {
                                reject(reason2);
                            });
        
                        }
      
                    }).catch( (reason) => {
                        reject(reason);
                    });
    
                    var loc = app.getPath('userData') + "/last_written.txt";
                    var theString = new Date().toString();
    
                    fs.truncate(loc, 0, () => {
    
                        fs.writeFile(loc, theString, (err) => {
                            if (err) {
                                console.log(err)
                            }
                        });
    
                    });
    
                } else {
                    console.log('running already');
                }

            }, false);
    
            task.start();

        });

    },

    now: () => {

        return new Promise( (resolve, reject) => {

            if (!global.running) {

                global.running = true;

                console.log("looking for new items");

                var getHeads = parser.readHeads();
    
                getHeads.then( (arg1) => {

                    if (arg1.length == 0) {
                        global.running = false;
                    }
    
                    for (var x = 0; x < arg1.length; x++) {
    
                        //Compare old and new feeds      
                        //Get stored feed data ->
                        var getData = parser.readData(arg1[x].name, x);
                        getData.then ( (arg2) => {

                            var old_items = arg2.obj.items;
    
                            var getCurrent = parser.feed(arg1[arg2.x].link, arg2.x);

                            getCurrent.then( (arg3) => {
    
                                var new_items = arg3.feed.items;

                                var i = 0;
                                var matched = false;

                                while (!matched) {

                                    if (i >= new_items.length) {
                                        break;
                                    }

                                    if (typeof old_items[0] === 'undefined') {
                                        break;
                                    }

                                    new_items[i].new = true;
                                    new_items[i].read = false;

                                    var newD = new Date(new_items[i].pubdate).getDate();
                                    var oldD = new Date(old_items[0].pubdate).getDate();

                                    if (new_items[i].title == old_items[0].title && newD == oldD) {

                                        matched = true;

                                        if (i == 0) {
                                            break;
                                        }
                                        
                                        var insert_index = i;

                                        var add_items = new_items.slice(0, insert_index);
                
                                        var insert = add_items.concat(old_items);

                                        var writer = parser.rewriteData(arg3.link, insert);
                                        writer.then ( (arg4) => {

                                            global.output.latestRefresh();
                                            console.log('refreshed feed: ' + arg4);

                                            for (var k = 0; k < add_items.length; k++) {

                                                global.output.notify(add_items[k].title, arg3.feed.head.title);
    
                                            }

                                        }).catch( (reason4) => {
                                            reject(reason4);
                                        });
                                            
                                    } else {

                                        if (i == new_items.length - 1 && !matched) {

                                            matched = true;

                                            if (i == 0) {
                                                break;
                                            }
                                            
                                            var insert_index = i;
    
                                            var add_items = new_items;
                    
                                            var insert = add_items.concat(old_items);
    
                                            var writer = parser.rewriteData(arg3.link, insert);
                                            writer.then ( (arg4) => {
    
                                                global.output.latestRefresh();
                                                console.log('refreshed feed: ' + arg4);
    
                                                for (var k = 0; k < add_items.length; k++) {
    
                                                    global.output.notify(add_items[k].title, arg3.feed.head.title);
        
                                                }
    
                                            }).catch( (reason4) => {
                                                reject(reason4);
                                            });

                                        }

                                    }

                                    
                                    
                                    i += 1;

                                }

                                if (arg3.x == arg1.length - 1) {
                                    global.running = false;
                                }
    
                            }).catch ( (reason3) => {
                                reject(reason3);
                            });
    
                        }).catch( (reason2) => {
                            reject(reason2);
                        });
    
                    }
  
                }).catch( (reason) => {
                    reject(reason);
                });

                var loc = app.getPath('userData') + "/last_written.txt";
                var theString = new Date().toString();

                fs.truncate(loc, 0, () => {

                    fs.writeFile(loc, theString, (err) => {
                        if (err) {
                            console.log(err)
                        }
                    });

                });

                //global.running = false;

            } else {
                console.log('running already');
            }

        });

    }

}