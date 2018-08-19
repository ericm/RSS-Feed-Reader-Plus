const FeedParser = require('feedparser');
const request = require('request');
const {app} = require('electron');
const fs = require('fs');
const utils = require('daveutils');

module.exports = {
    feed: (link) => {
        
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
                
                resolve(theFeed);
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

            var loc = app.getPath('userData') + "/rss-feeds/" + name + ".xml";

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

                obj.feeds.push({name: name, link: link, title: meta.title});
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

    readData: (name) => {

        return new Promise((resolve, reject) => {

            var feeds = app.getPath('userData') + "/data.json";
            var feed = app.getPath('userData') + "/rss-feeds/" + name + ".xml";

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
                            var feedObj = JSON.parse(dataFeed);

                            var theFeed = {
                                head: feedHead[0],
                                obj: feedObj
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

    }

}