const {ipcRenderer} = require('electron');

document.onload = ipcRenderer.send('reload', 'latest');

ipcRenderer.on('reloaded', (event, response) => {
    console.log(response[0].head.title);
});
