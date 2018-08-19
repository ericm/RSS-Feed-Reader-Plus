const FeedParser = require('feedparser');
const request = require('request');
const {app} = require('electron');
const fs = require('fs');

var theFeed = {
    head: new Object(),
    items: [],
    data : FeedParser.item
};

module.exports= {
    feed: (link) => {
        
        return new Promise((resolve, reject) => {
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
                theFeed.data = feedparser.read();
            });
            
            feedparser.on('end', () => {
                
                resolve(theFeed);
            });

        });
        
    },

    writeData: (name, data) => {

        return new Promise((resolve, reject) => {
            name = name.split('/').join('-');
            name = name.split(':').join('');
            fs.writeFile(app.getPath('userData') + "/" + name + ".xml", data, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log("Saved");
                    resolve(true);
                }
            });
        });

    }
}