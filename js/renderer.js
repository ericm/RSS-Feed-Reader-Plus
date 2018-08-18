var electron = require('electron').remote;
var title = electron.getGlobal('sharedObj').title;
const {ipcRenderer} = require('electron')

document.getElementsByTagName('title')[0].innerHTML = window.TITLE + ' - ' + title;
document.getElementsByTagName('h1')[0].innerHTML = window.TITLE + ' - ' + title;

