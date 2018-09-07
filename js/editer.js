const {ipcRenderer} = require('electron');
const renderer = require('./renderer.js');
const parser = require('./feedparse.js');

ipcRenderer.send('editing', true);

ipcRenderer.on('edit_this', (event, theFeed) => {

    renderer.rename('Editing Feed: ' + theFeed.head.title);

    console.log(theFeed.head.name);

    //render ->

    var container = document.getElementById('containerOb');

    container.innerHTML += `<label><p>Name of feed: </p><input type="text" value="` + theFeed.head.title + `">`;

});