let getFeeds = (feeds) => {

    return new Promise( (resolve, reject) => {

        let round = [];

            for (let i = 0; i < feeds.length; i++) {

                let getLength = getLengths(feeds[i].obj.items);
                getLength.then( (arg) => {

                    for (let x = 0; x < arg.count; x++) {

                        round.push(arg.feed[x]);

                    }
    
                }).catch ( (err) => {
                    console.log(err);
                });       

            }

            resolve(round);

    });

};

let getLengths = (feed) => {

    return new Promise( (resolve, reject) => {

        let count = 0;
        let existing = true;

        while (existing) {
                
            if (typeof feed[count] !== "undefined") {
                count += 1
            } else {
                existing = false;
            }  

        }
        
        resolve({count: count, feed: feed});

    });
};

module.exports = {

    latest: (feeds) => {

        return new Promise( (resolve, reject) => {
            
            let roundFeeds = getFeeds(feeds);
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

};