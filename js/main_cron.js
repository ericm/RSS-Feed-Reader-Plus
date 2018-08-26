const cron = require('node-cron');
const parser = require('../js/feedparse.js');

module.exports = {

    start: () => {

        return new Promise( (resolve, reject) => {

            var task = cron.schedule( '*/3 * * * *', () => {

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
                                            //notify
                                            console.log('refreshed feed: ' + arg4);
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

                global.refreshed = {last: new Date()};
    
            }, false);
    
            task.start();

        });

        

    }

}