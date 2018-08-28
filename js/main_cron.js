const cron = require('node-cron');
const parser = require('../js/feedparse.js');
const {app} = require('electron');
const fs = require('fs');
const settings = require('electron-settings');

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

                console.log("looking for new items");

                var getHeads = parser.readHeads();
    
                getHeads.then( (arg1) => {
    
                    for (var x = 0; x < arg1.length; x++) {
    
                        //Compare old and new feeds      
                        //Get stored feed data ->
                        var getData = parser.readData(arg1[x].name, x);
                        getData.then ( (arg2) => {

                            var old_items = arg2.obj.items;
    
                            var getCurrent = parser.feed(arg1[arg2.x].link, x);
    
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

                                    if (new_items[i].title == old_items[0].title) {

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

                                                global.output.notify(add_items[k].title, "- " + arg3.feed.head.title);
    
                                            }

                                            matched = true;

                                        }).catch( (reason4) => {
                                            reject(reason4);
                                        });
                                            
                                    }
                                    
                                    i += 1;

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
    
    
            }, false);
    
            task.start();

        });

    },

    now: () => {

        return new Promise( (resolve, reject) => {

            console.log("looking for new items");

            var getHeads = parser.readHeads();

            getHeads.then( (arg1) => {

                for (var x = 0; x < arg1.length; x++) {

                    //Compare old and new feeds      
                    //Get stored feed data ->
                    var getData = parser.readData(arg1[x].name, x);
                    getData.then ( (arg2) => {

                        var old_items = arg2.obj.items;

                        var getCurrent = parser.feed(arg1[arg2.x].link, x);

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

                                if (new_items[i].title == old_items[0].title) {

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

                                            global.output.notify(add_items[k].title, "- " + arg3.feed.head.title);

                                        }
                                        
                                        matched = true;

                                    }).catch( (reason4) => {
                                        reject(reason4);
                                    });

                                    
                                        
                                }
                                
                                i += 1;

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

        });

    }

}