const {ipcRenderer} = require('electron');
const renderer = require('./renderer.js');
const parser = require('./feedparse.js');
const settings = require('electron-settings');

ipcRenderer.send('editing', true);

var idGlob;

ipcRenderer.on('edit_this', (event, theFeed) => {

    idGlob = theFeed.head.id;

    renderer.rename('Editing Feed: ' + theFeed.head.title);

    console.log(theFeed.head.name);

    //render ->

    var container = document.getElementById('containerOb');

    //Feed name
    container.innerHTML += `<label><p>Name of feed: </p><input onkeypress="update()" type="text" value="` + theFeed.head.title + `"></label><br>`;

    //Max articles
    container.innerHTML += `<label><p>Max number of articles: </p><input onchange="update()" type="number" value="` + settings.get("feeds." + theFeed.head.id + ".max")+ `"></label><br>`;

    var notify = "";

    var rules = "";

    if (settings.has("feeds." + theFeed.head.id)) {

        //Notifications ->

        notify += `<label><p>Notifications: </p><select onchange="update()">`;

        if (settings.get("feeds." + theFeed.head.id + ".notifications") == 'default') {

            notify += `<option selected>App default</option><option>Yes</option><option>No</option>`;

        } else if (settings.get("feeds." + theFeed.head.id + ".notifications") == 'yes') {

            notify += `<option>App default</option selected><option>Yes</option><option>No</option>`;

        } else if (settings.get("feeds." + theFeed.head.id + ".notifications") == 'no') {

            notify += `<option>App default</option><option>Yes</option><option selected>No</option>`;

        }

        //Add rules ->
        
        rules += `<br><label><p>Rules:</p>`;

        for (var x in settings.get("feeds." + theFeed.head.id + ".rules")) {

            rules += `<span class="rule">` + settings.get("feeds." + theFeed.head.id + ".rules")[x] + `<a onclick="remRule(` + theFeed.head.id + `, '` + settings.get("feeds." + theFeed.head.id + ".rules")[x] + `')">x</a></span>`;

        }

        if (settings.get("rules").length == 0) {

            rules += `</label><br><label class="adder"><p>No rules available</p></label>`;

        } else {

            rules += `</label><br><label class="adder"><p>Add Rules:</p><select>`;

            for (var x in settings.get("rules")) {

                rules += `<option>` + settings.get("rules")[x] + `</option>`;

            }

            rules += `</select></label>`;

        }

    }

    container.innerHTML += notify;

    container.innerHTML += rules

});

module.exports = {

    update: () => {

        var obj = document.getElementsByTagName('label');

        var name = obj[0].getElementsByTagName('input')[0].value;

        var max = obj[1].getElementsByTagName('input')[0].value;

        var notifications;
        
        //.getElementsByTagName('select')[0].options[container[1].getElementsByTagName('select')[0].selectedIndex].text;

        var send = {

            id: idGlob,
            title: name,
            max: max

        };

        ipcRenderer.send('editSend', send);

    },

    remRule: (id, rule) => {

        ipcRenderer.send('editRule', {id: id, rule: rule});

    }

};
