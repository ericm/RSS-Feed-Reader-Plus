var electron = require('electron').remote;
const {ipcRenderer} = require('electron');

document.getElementById('list').style.height = window.innerHeight - 70 + "px";
window.onresize = () => {
    document.getElementById('list').style.height = window.innerHeight - 70 + "px";
};

document.getElementById('drawer').getElementsByTagName('span')[0].addEventListener('click', () => {
    ipcRenderer.send('add-page', 'yes');
});

document.getElementById('drawer').getElementsByTagName('span')[1].addEventListener('click', () => {
    ipcRenderer.send('settings-page', 'yes');
});