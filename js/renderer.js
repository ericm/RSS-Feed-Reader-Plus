var electron = require('electron').remote;
var {ipcRenderer} = require('electron');
var title = electron.getGlobal('sharedObj').title;
var settings = electron.getGlobal('settings');

//Removes box-shadows
if (!settings.main.shadows) {

    var head = document.getElementsByTagName('head')[0];

    var elem = document.createElement('style');
    elem.appendChild(document.createTextNode(`
    
    .article {
        box-shadow: 0 0 0 0;
    }

    `));

    head.appendChild(elem);

}

//Checks OS

if (process.platform == 'linux') {

    var head = document.getElementsByTagName('head')[0];

    var elem = document.createElement('style');
    elem.appendChild(document.createTextNode(`
    
    #ex {
        padding-top: 1px;
    }
    #maximize {
        padding-top: 3px;
    }
    #minimize {
        padding-top: 2px;
    }

    `));

    head.appendChild(elem);

}

document.getElementsByTagName('title')[0].innerHTML = window.TITLE + ' - ' + title;
document.getElementsByTagName('h1')[0].innerHTML = window.TITLE + ' - ' + title;

module.exports = {

    rename: (newName) => {

        document.getElementsByTagName('title')[0].innerHTML = newName + ' - ' + title;
        document.getElementsByTagName('h1')[0].innerHTML = newName + ' - ' + title;

    },

    rclick: (index, event) => {
        var rcl = document.getElementById('rcl');
        var rclb = document.getElementById('rcl-back');
        
        rcl.style.display = "initial";
        var winH = window.innerHeight;

        if (winH - event.clientY < 200) {
            rcl.style.top = event.clientY - 200 + "px";
        } else {
            rcl.style.top = event.clientY + "px"
        }

        
        rcl.style.left = event.clientX + "px";
        rclb.style.display = "initial";

        rclb.style.backgroundColor = "rgba(34, 34, 34, .85)";
        rcl.style.border = "3px solid rgba(230, 25, 66, 1)";

        rcl.getElementsByTagName('a')[0].addEventListener("click", () => {

            ipcRenderer.send('edit', index);

            rcl.style.display = "none";
            rclb.style.display = "none";

            rclb.style.backgroundColor = "rgba(34, 34, 34, 0)";
            rcl.style.border = "3px solid rgba(230, 25, 66, 0)";

            var el = document.getElementById('rcl'),
                elClone = el.cloneNode(true);
            el.parentNode.replaceChild(elClone, el);

        });

    }

}
