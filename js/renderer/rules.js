const {ipcRenderer} = require('electron');
const settings = require('electron-settings');

window.onload = () => {

    var cont = document.getElementById("sideR");
    
    var rules = settings.get("rules");

    for (var x in rules) {

        cont.innerHTML += `
            <div class="ruleEdit"><span>` + rules[x] + `</span>
                <a onclick="remRule('` + rules[x] + `')"></a>
            </div>
        `

    }

}