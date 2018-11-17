const {ipcRenderer} = require('electron');
const renderer = require('./renderer.js');
const parser = require('../main/feedparse.js');
const settings = require('electron-settings');

ipcRenderer.send('editing', true);

var idGlob;
var linkGlob;

ipcRenderer.on('edit_this', (event, theFeed) => {

    idGlob = theFeed.head.id;
    linkGlob = theFeed.head.link;

    renderer.rename('Editing Feed: ' + theFeed.head.title);

    console.log(theFeed.head.name);

    //render ->

    var container = document.getElementById('containerOb');

    //Feed name
    container.innerHTML += `<label><p>Name of feed: </p><input onchange="update()" type="text" value="` + theFeed.head.title + `"></label><br>`;

    //Max articles
    container.innerHTML += `<label><p>Max number of articles: </p><input onchange="update()" type="number" value="` + settings.get("feeds." + theFeed.head.id + ".max")+ `"></label><br>`;

    var notify = "";

    var rules = "";

    if (settings.has("feeds." + theFeed.head.id)) {

        //Notifications ->

        notify += `<label><p>Notifications: </p><select onchange="update()">`;

        if (settings.get("feeds." + theFeed.head.id + ".notifications") == 'default') {

            notify += `<option selected>Default</option><option>Yes</option><option>No</option>`;

        } else if (settings.get("feeds." + theFeed.head.id + ".notifications") == 'yes') {

            notify += `<option>Default</option selected><option>Yes</option><option>No</option>`;

        } else if (settings.get("feeds." + theFeed.head.id + ".notifications") == 'no') {

            notify += `<option>Default</option><option>Yes</option><option selected>No</option>`;

        }

        //Add rules ->
        
        rules += `</label><br><label><p>Rules:</p>`;

        for (var x in settings.get("feeds." + theFeed.head.id + ".rules")) {

            rules += `<span name="` + settings.get("feeds." + theFeed.head.id + ".rules")[x] + `" class="rule">` + 
            settings.get("feeds." + theFeed.head.id + ".rules")[x] + `<a onclick="remRule(` + theFeed.head.id + `, '` + settings.get("feeds." + theFeed.head.id + ".rules")[x] + `')">x</a></span>`;

        }

        if (settings.get("rules").length == 0) {

            rules += `</label><br><label class="adder"><p>No rules available</p></label>`;

        } else {

            rules += `</label><br><label class="adder"><p>Add Rules:</p><select onchange="update()"><option>-</option>`;

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

        var max = parseInt(obj[1].getElementsByTagName('input')[0].value);

        var notifications = obj[2].getElementsByTagName('select')[0].options[obj[2].getElementsByTagName('select')[0].selectedIndex].text.toLowerCase();

        var rules = [];
        
        var rSpans = (typeof obj[3].getElementsByClassName("rule")) !== "undefined" ? 
        obj[3].getElementsByClassName("rule") : []; //inner;

        for (var r in rSpans) {
            console.log(r);
            rules.push(rSpans[r].getAttribute("name"));
        }

        var rule = (typeof obj[4].getElementsByTagName('select')[0]) !== "undefined" ? obj[4].getElementsByTagName('select')[0]
        .options[obj[4].getElementsByTagName('select')[0].selectedIndex].text.toLowerCase() : "";

        if (rule !== "") {
            rules.push(rule);
        }

        var send = {

            id: idGlob,
            link: linkGlob,
            title: name,
            max: max,
            notifications : notifications,
            rules: rules

        };

        ipcRenderer.send('editSend', send);

    },

    remRule: (id, rule) => {

        ipcRenderer.send('editRule', {id: id, rule: rule});

    }

};
