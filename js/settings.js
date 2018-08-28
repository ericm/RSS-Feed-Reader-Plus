const {ipcRenderer} = require('electron');

document.onload = ipcRenderer.send('settings', []);

ipcRenderer.on('mainSet', (event, settings) => {

    var container = document.getElementById('containerOb');

    container.innerHTML = "";

    //refresh

    var refresh = `<label><p>Check for new items every:</p><select onchange="update()">`;

    if (settings.refresh >= 60) {

        var num = settings.refresh /60;

        for (var i = 1; i <= 60; i++) {
            
            if (num == i) {
                refresh += `<option selected>` + i + `</option>`;
            } else {
                refresh += `<option>` + i + `</option>`;
            }
            
        }
        
        refresh += `</select>`;

        refresh += `<select onchange="update()"><option>minutes</option><option selected>hours</option>`;

    } else {

        var num = settings.refresh;

        for (var i = 1; i <= 60; i++) {

            if (num == i) {
                refresh += `<option selected>` + i + `</option>`;
            } else {
                refresh += `<option>` + i + `</option>`;
            }
            
        }
        
        refresh += `</select>`
        refresh += `<select onchange="update()"><option selected>minutes</option><option>hours</option>`

    }

    refresh += `</select></label><br>`;

    container.innerHTML += refresh;

    //themes

    var themes = `<label><p>Theme:</p><select onchange="update()"><option>Default</option></label>`;
    
    container.innerHTML += themes;

    //launch_start

    var launch_start;

    if(settings.launch_start == true) {
        launch_start = `<br><label><p>Launch application on sytem startup:</p><input onchange="update()" type="checkbox" checked/></label>`;
    } else {
        launch_start = `<br><label><p>Launch application on sytem startup:</p><input onchange="update()" type="checkbox"/></label>`;
    }

    container.innerHTML += launch_start;
    
    //start_tray

    var start_tray;

    if(settings.start_tray == true) {
        start_tray = `<br><label><p>Start application in system tray</p><input onchange="update()" type="checkbox" checked/></label>`;
    } else {
        start_tray = `<br><label><p>Start application in system tray</p><input onchange="update()" type="checkbox"/></label>`;
    }

    container.innerHTML += start_tray;

    //opacity

    var opacity = `<br><label><p>Background Opacity:</p><input onchange="update()" type="range" min="1" max="100" value="` + settings.opacity + `" class="slider">
    <p><i>` + settings.opacity + `%</i></p></label>`;

    container.innerHTML += opacity;

    //notifications

    var notifications;

    if(settings.notifications == true) {
        notifications = `<br><label><p>Send Desktop Notifications for new entries in feeds:</p><input onchange="update()" type="checkbox" checked/></label>`;
    } else {
        notifications = `<br><label><p>Send Desktop Notifications for new entries in feeds:</p><input onchange="update()" type="checkbox"/></label>`;
    }

    container.innerHTML += notifications;

});

module.exports = {

    update: () => {

        var container = document.getElementById('containerOb').getElementsByTagName('label');

        //refresh

        var refresh = container[0].getElementsByTagName('select')[0];

        refresh = parseInt(refresh.options[refresh.selectedIndex].text);

        if (container[0].getElementsByTagName('select')[1].selectedIndex == 1) {
            refresh = refresh * 60;
        }

        //theme

        var theme = container[1].getElementsByTagName('select')[0].options[container[1].getElementsByTagName('select')[0].selectedIndex].text;

        //launch_start

        var launch_start = container[2].getElementsByTagName('input')[0].checked;

        //start-tray

        var start_tray = container[3].getElementsByTagName('input')[0].checked;

        //opacity

        var opacity = container[4].getElementsByTagName('input')[0].value;

        //notifications

        var notifications = container[5].getElementsByTagName('input')[0].checked;

        var settings = {
            refresh: refresh,
            theme: theme,
            launch_start: launch_start,
            start_tray: start_tray,
            opacity: opacity,
            notifications: notifications
        }

        ipcRenderer.send('updateSet', settings);

    }

}