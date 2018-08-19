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

document.onload = ipcRenderer.send('refresh');

var enter = document.getElementById('list');

ipcRenderer.on('refreshed', (event, response) => {

    refresh(response);

});

ipcRenderer.on('refreshed-new', (event, response) => {

    enter.innerHTML = "";
    refresh(response);

});

var refresh = (response) => {

    if (response.length != 0) {

        for (x in response) {

            enter.innerHTML += `
    
<div class="item" oncontextmenu="rcl(` + x + `, event)">
    <span>` + response[x].title + `</span>
    <i>` + response[x].link + `</i>
</div>
    
            `;
        }

    } else {
        enter.innerHTML += '<i class="nothing">No feeds found</i>'
    }
    
    enter.innerHTML += '<div class="break"></div>';

};

var rcl = document.getElementById('rcl');
var rclb = document.getElementById('rcl-back');

rclb.onclick = () => {

    

    rcl.style.display = "none";
    rclb.style.display = "none";

    rclb.style.backgroundColor = "rgba(34, 34, 34, 0)"
    rcl.style.border = "3px solid rgba(230, 25, 66, 0)"
    
}

rclb.oncontextmenu = () => {

    rcl.style.display = "none";
    rclb.style.display = "none";

}