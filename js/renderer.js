var electron = require('electron').remote;
var title = electron.getGlobal('sharedObj').title;

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
            console.log(index + ' clicked');
        });

    }

}
