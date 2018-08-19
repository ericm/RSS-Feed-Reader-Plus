const FeedParser = require('feedparser');
const request = require('request');
const {app} = require('electron');
const fs = require('fs');
const utils = require('daveutils');

module.exports= {
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

            var theString = "";
            for (x in data) {
                theString += utils.jsonStringify(data[x]);
            }

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
            
        });

    }
}