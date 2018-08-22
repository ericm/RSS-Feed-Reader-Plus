const {ipcRenderer} = require('electron');

document.onload = ipcRenderer.send('reload', {get: 'latest', num: 10});

ipcRenderer.on('reloaded', (event, response) => {
    console.log(response[0].head.title);
});
