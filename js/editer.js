const {ipcRenderer} = require('electron');
const renderer = require('./renderer.js');
const parser = require('./feedparse.js');

ipcRenderer.send('editing', true);

ipcRenderer.on('edit_this', (event, theFeed) => {

    console.log(theFeed.head.title);
    renderer.rename('Editing Feed: ' + theFeed.head.title);

});