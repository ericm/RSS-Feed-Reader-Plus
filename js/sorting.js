
var getFeeds = (x, feeds) => {

    return new Promise( (resolve, reject) => {
        var round = new Array();
        for (var i = 0; i < feeds.length; i++) {
            round.push(feeds[i].obj.items[x]);
            if (i == feeds.length - 1) {
                resolve(round);
            }
        }
    });

}

var sortFeeds = (round) => {

    return new Promise( (resolve, reject) => {

        for (var i = 0; i < round.length; i++) {
        
            for (var j = 0; j < round.length - i - 1; j++) {

                var tmp = round[j];
                
                var date1 = new Date(round[j].date).getTime();
                var date2 = new Date(round[j + 1].date).getTime();

                if (isNaN(date1) || isNaN(date2)) {
                    reject('date na');
                }

                if (date1 > date2) {
                    round[j] = round[j + 1];
                    round[j + 1] = tmp;
                }

                if (i == round.length - 1) {
                    resolve(round);
                }

            }

        }

    });

}

module.exports = {

    latest: (feeds, num) => {

        return new Promise( (resolve, reject) => {

            var round = new Array();
            console.log(feeds[0].obj.items[0].pubdate);

            for (var x = 0; x < num; x++) {

                var getFeedsPromise = getFeeds(x, round, feeds);
                getFeedsPromise.then ( (arg1) => {
                    round.concat(arg1);
                    var sortFeedsPromise = sortFeeds(round);
                    sortFeedsPromise.then( (arg2) => {
                        console.log(arg2[0].title);
                        resolve(arg2);
                    }).catch( (reason) => {
                        console.log(reason);
                    });
                }).catch( (reason) => {
                    console.log(reason);
                });
    
            }
            
        });

    }

}