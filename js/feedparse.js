const FeedParser = require('feedparser');
const request = require('request');
const {app} = require('electron');
const fs = require('fs');
const utils = require('daveutils');
const settings = require('electron-settings');

module.exports = {
    feed: (link, x) => {
        
        return new Promise((resolve, reject) => {

            var theFeed = {
                head: new Object(),
                items: []
            };

            var file = request(link);

            var feedparser = new FeedParser();

            file.on('error', (error) => reject(error));

            file.on('response', (res) => {

                if (res.statusCode !== 200) {
                    reject('bad status code');
                } else {
                    file.pipe(feedparser);
                }

            });

            feedparser.on('error', (error) => reject(error));

            feedparser.on('readable', () => {

                var stream = feedparser;

                var item;
                theFeed.head = feedparser.meta;
                while (item = stream.read()) {
                    theFeed.items.push(item);
                }

            });
            
            feedparser.on('end', () => {
                
                resolve({feed: theFeed, x: x, link});
                
            });

        });
        
    },

    writeData: (link, data) => {

        return new Promise((resolve, reject) => {

            var name = link;

            name = name.split('/').join('-');
            name = name.split(':').join('');
            name = name.split('?').join('');
            name = name.split('=').join('');
            name = name.split('*').join('');
            name = name.split('>').join('');
            name = name.split('<').join('');


            var theString = '{"items":[';

            for (x in data) {
                
                theString += utils.jsonStringify(data[x]);

                if (x != data.length - 1) {
                    theString += ',';
                }

            }
            theString += ']}';

            //if exists

            var loc = app.getPath('userData') + "/rss-feeds/" + name + ".json";

            if (!fs.existsSync(loc)) {

                fs.writeFile(loc, theString, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log("Saved");
                        resolve(name);
                    }
                });

            } else {

                reject('exists');

            }

        });

    },

    rewriteData: (link, data) => {

        return new Promise((resolve, reject) => {

            var name = link;

            name = name.split('/').join('-');
            name = name.split(':').join('');
            name = name.split('?').join('');
            name = name.split('=').join('');
            name = name.split('*').join('');
            name = name.split('>').join('');
            name = name.split('<').join('');


            var theString = '{"items":[';

            for (x in data) {
                
                theString += utils.jsonStringify(data[x]);

                if (x != data.length - 1) {
                    theString += ',';
                }

            }
            theString += ']}';

            var loc = app.getPath('userData') + "/rss-feeds/" + name + ".json";

            fs.truncate(loc, 0, () => {

                fs.writeFile(loc, theString, (err2) => {
                    if (err2) {
                        reject(err2);
                    } else {
                        console.log("Saved");
                        resolve(name);
                    }
                });

            })
            
        });

    },

    saveData: (name, link, meta) => {

        return new Promise((resolve, reject) => {

            var obj = {
                feeds:[]
            }

            var file = app.getPath('userData') + "/data.json";

            fs.readFile(file, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    obj = JSON.parse(data);
                }

                var length = obj.feeds.length;

                obj.feeds.push({name: name, link: link, title: meta.title, id: length});
                fs.writeFile(file, utils.jsonStringify(obj), (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(true);
                    }
                });
            });
            
        });

    },

    readData: (name, x) => {

        return new Promise((resolve, reject) => {

            var feeds = app.getPath('userData') + "/data.json";
            var feed = app.getPath('userData') + "/rss-feeds/" + name + ".json";

            if (!fs.existsSync(feeds)) {
                reject('restart');
            }
            if (!fs.existsSync(feed)) {
                reject('noExist');
            }

            fs.readFile(feeds, (err, data) => {
                if (err) {
                    reject('restart');
                } else {
                    var obj = JSON.parse(data);
                    var feedHead = obj.feeds.filter( (item) => {
                        return item.name == name;
                    });
                    
                    fs.readFile(feed, 'utf8', (err, dataFeed) => {
                        if (err) {
                            reject('noExist');
                        } else {
                            var feedObj;
                            try {
                                feedObj = JSON.parse(dataFeed);
                            } catch(e) {
                                reject(e);
                            }

                            var theFeed = {
                                head: feedHead[0],
                                obj: feedObj,
                                x: x
                            }
                            resolve(theFeed);
        
                        }
                    });
                }
            });

        });

    },

    readHeads: () => {

        return new Promise((resolve, reject) => {

            var feeds = app.getPath('userData') + "/data.json";

            if (!fs.existsSync(feeds)) {
                reject('restart');
            }

            fs.readFile(feeds, (err, data) => {
                if (err) {
                    reject('restart');
                } else {
                    var obj = JSON.parse(data);
                    resolve(obj.feeds);
                }
            });

        });

    },

    makeRead: (title, pubdate, feed, newArt) => {

        return new Promise((resolve, reject) => {

            var link;

            var feeds = app.getPath('userData') + "/data.json";

            if (!fs.existsSync(feeds)) {
                reject('restart');
            }

            fs.readFile(feeds, (err, data) => {
                if (err) {
                    reject('restart');
                } else {

                    var obj = JSON.parse(data);
                    for (var i = 0; i < obj.feeds.length; i++) {

                        if (obj.feeds[i].title == feed) {

                            link = obj.feeds[i].link;

                        }

                    }

                    var name = link;

                    name = name.split('/').join('-');
                    name = name.split(':').join('');
                    name = name.split('?').join('');
                    name = name.split('=').join('');
                    name = name.split('*').join('');
                    name = name.split('>').join('');
                    name = name.split('<').join('');
        
                    var loc = app.getPath('userData') + "/rss-feeds/" + name + ".json";
        
                    if (!fs.existsSync(loc)) {
                        reject('restart');
                    }
        
                    fs.readFile(loc, 'utf8', (err, dataFeed) => {
                        if (err) {
                            reject('noExist');
                        } else {
                            var feedObj = JSON.parse(dataFeed);
        
                            //Array of Objects
                            var items = feedObj.items;
        
                            for (var i = 0; i < items.length; i++) {
        
                                if (items[i].title == title && items[i].pubdate == pubdate) {
        
                                    items[i].read = true;
        
                                }
        
                            }
        
                            feedObj.items = items;
        
                            fs.writeFile(loc, utils.jsonStringify(feedObj), (err) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(newArt);
                                }
                            });
        
                        }
                    });        

                }
            });

            
        });

    },

    addUnseenData: (title, amount) => {

        return new Promise((resolve, reject) => {

            var obj = {
                feeds:[]
            }

            var file = app.getPath('userData') + "/data.json";

            fs.readFile(file, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    obj = JSON.parse(data);
                }

                for (var i = 0; i < obj.feeds.length; i++) {

                    if (obj.feeds[i].title == title) {

                        if (settings.has('list.' + i) ) {

                            settings.set('list.' + i , settings.get('list.' + i) + amount);

                            if (settings.get('list.' + i) < 0 && amount == -1) {

                                settings.set('list.' + i , 0);

                            }

                            resolve(true);

                        } else {

                            settings.set('list.' + i, amount);

                            resolve(true);

                        }

                    }

                }
                
            });
            
        });

    },

    makeFeedRead: (name) => {

        return new Promise((resolve, reject) => {

            var loc = app.getPath('userData') + "/rss-feeds/" + name + ".json";

            fs.readFile(loc, 'utf8', (err, data) => {

                if (err) {
                    reject(err);
                } else {

                    var jData = JSON.parse(data);
                    var take = 0;

                    for (x in jData.items) {

                        if (typeof jData.items[x].read !== 'undefined' && typeof jData.items[x].new !== 'undefined') {
                            if (jData.items[x].read == false && jData.items[x].new == true) {
                                take += 1;
                            }
                        }

                        jData.items[x].read = true;

                    }
                }

                fs.writeFile(loc, utils.jsonStringify(jData), (err2) => {
                    if (err2) {
                        reject(err2);
                    } else {
                        resolve({name: name, take: take});
                    }
                });

                

            });

        });

    },

    addUnseenDataAll: (name) => {

        return new Promise((resolve, reject) => {

            var obj = {
                feeds:[]
            }

            var file = app.getPath('userData') + "/data.json";

            fs.readFile(file, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    obj = JSON.parse(data);
                }

                for (var i = 0; i < obj.feeds.length; i++) {

                    if (obj.feeds[i].name == name) {

                        settings.set('list.' + i , 0);
                        resolve(name);

                    }

                }
                
            });
            
        });

    }

}