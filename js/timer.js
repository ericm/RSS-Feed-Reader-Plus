var cron = require('node-cron');

var lastTime;

var task = cron.schedule('30 * * * * *', () => {

    var cont = document.getElementById('timer');

    var currentTime = new Date();
    //in minutes ->
    var dif = Math.round((currentTime - lastTime) /60000);

    if (dif < 60) {

        if (dif == 1) {
            cont.innerHTML = `<p><b>Last Refreshed</b>: ` + dif + ` minute ago</p>`;
        } else {
            cont.innerHTML = `<p><b>Last Refreshed</b>: ` + dif + ` minutes ago</p>`;
        }
        
    } else {

        var hrs = Math.round(dif /60);
        if (hrs == 1) {
            cont.innerHTML = `<p><b>Last Refreshed</b>: ` + hrs + ` hour ago</p>`;
        } else {
            cont.innerHTML = `<p><b>Last Refreshed</b>: ` + hrs + ` hours ago</p>`;
        }
        
    }

}, false);

module.exports = {

    start: () => {

        var electron = require('electron').remote;
        lastTime = electron.getGlobal('refreshed').last;
        task.start();

    },

    stop: () => {

        task.stop();

    }

}