var cron = require('node-cron');
const {ipcRenderer} = require('electron');

var task = cron.schedule('10 * * * * *', () => {

    ipcRenderer.send('getLatestTime', []);

}, false);

ipcRenderer.on('latestTime', (event, data) => {

    var cont = document.getElementById('timer');

    var lastTime = new Date(data);

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

});

module.exports = {

    start: () => {
        ipcRenderer.send('getLatestTime', []);
        task.start();
    },

    stop: () => {

        task.stop();

    }

}