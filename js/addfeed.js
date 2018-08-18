const electron = require('electron').remote;
const {ipcRenderer} = require('electron');
const path = require('path');
const fs = require('fs');

document.getElementsByTagName('button')[0].onclick = () => {
    var pattern = /^https?:\/\//i;

    var link = document.getElementsByTagName('input')[0].value;
    if (!pattern.test(link)) {
        document.getElementsByTagName('p')[0].innerHTML = "Enter a VALID feed's URL:"
    } else {
        ipcRenderer.send('add-link', link);
        document.getElementById('containerOb').innerHTML = `<p>Loading</p>`
    }
    
}

ipcRenderer.on('link-reply', (event, arg) => {
    console.log(arg);
});
