const FeedParser = require('feedparser');
const request = require('request');

module.exports= {
    feed: (link) => {
        console.log(link);
        
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
                resolve(feedparser);
            });
        });
        
    }
}