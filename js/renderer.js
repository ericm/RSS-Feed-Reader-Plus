var electron = require('electron').remote;
var title = electron.getGlobal('sharedObj').title;

document.getElementsByTagName('title')[0].innerHTML = window.TITLE + ' - ' + title;
document.getElementsByTagName('h1')[0].innerHTML = window.TITLE + ' - ' + title;

module.exports = {

    rename: (newName) => {
        document.getElementsByTagName('title')[0].innerHTML = newName + ' - ' + title;
        document.getElementsByTagName('h1')[0].innerHTML = newName + ' - ' + title;
    }

}

