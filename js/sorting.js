var getFeeds = (feeds) => {

    return new Promise( (resolve, reject) => {

        var round = new Array();

            for (var i = 0; i < feeds.length; i++) {

                var getLength = getLengths(feeds[i].obj.items);
                getLength.then( (arg) => {

                    for (var x = 0; x < arg.count; x++) {

                        round.push(arg.feed[x]);

                    }
    
                }).catch ( (err) => {
                    console.log(err);
                });       

            }

            resolve(round);

    });

}

var getLengths = (feed) => {

    return new Promise( (resolve, reject) => {

        var count = 0;
        var existing = true;

        while (existing) {
                
            if (typeof feed[count] !== "undefined") {
                count += 1
            } else {
                existing = false;
            }  

        }
        
        resolve({count: count, feed: feed});

    });
}

module.exports = {

    latest: (feeds) => {

        return new Promise( (resolve, reject) => {
            
            var roundFeeds = getFeeds(feeds);
            roundFeeds.then( (arg1) => {
                
                arg1.sort( (a, b) => {
                    return new Date(b.pubdate).getTime() - new Date(a.pubdate).getTime();
                });

                resolve(arg1);

            }).catch( (err) => {
                console.log(err);
            });
            
        });

    }

}