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
        document.getElementById('containerOb').innerHTML = `<img class='load' src='../img/load1.gif'><p>Loading</p>`
        ipcRenderer.send('add-link', link);
    }
    
}

ipcRenderer.on('link-reply', (event, arg) => {
    if (arg) {
        document.getElementById('containerOb').innerHTML = `<p>Found the Feed!</p>`
    } else {
        document.getElementById('containerOb').innerHTML = `<p>Couldn't find feed from this link.</p>`
    }
});

ipcRenderer.on('exist-reply', (event, arg) => {
    if (arg) {
        document.getElementById('containerOb').innerHTML = `<p>You already added this feed.</p>`
    }
});
