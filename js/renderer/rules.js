const {ipcRenderer} = require('electron');
const settings = require('electron-settings');
var d = document;

var cont;

class newCond {
    constructor(i) {
        this.out = `
        <div class="condition">
        <select>
          <option>Title</option>
          <option>Description</option>
          <option>Link</option>
          <option>Custom</option>
        </select>
        <select>
          <option>contains</option>
          <option>is equal to</option>
          <option>starts with</option>
          <option>end with</option>
          <option>is greater than (nums)</option>
          <option>is less than (nums)</option>
        </select>
        <input type="text" value="" />
        <br />
        <br />
        <label><i>Case sensitive: </i><input type="checkbox" /></label>
        <label><i>Invert condition: </i><input type="checkbox"/></label>
        <br />
        <br />
        <button onclick="delCond(` + i + `)">Delete condition</button>
      </div>`;
    }
}

class Current {
    constructor(name, rules, rl) {
        this.name = name
        this.rules = rules
        this.rLength = rl
    }
    
}

var tab = (name) => {
    open = name;
        
        if (!settings.get("rRules")) {
            settings.set("rRules." + name, {
                condition: [{}],
                action: ""
            });
        }

        /*
            layout
                condition: [{"title", cond, enact}]
        */

        var rule = settings.get("rRules." + name);
        
        current = new Current({name: name, rules: rule, rl: rule.length});

        cont.innerHTML = "";

        var container = d.getElementById("containerR");

        // render rules into containerR

        container.style.display = "block";
}

window.onload = () => {

    cont = d.getElementById("sideR");
    
    var rules = settings.get("rules");

    if (rules.length  == 0) {
        d.getElementById("containerR").style.display = "none";
    } else {
        tab(rules[0]);
    }

    for (var x in rules) {

        cont.innerHTML += `
            <div class="ruleEdit" onclick="tab(` + x + `);"><span>` + rules[x] + `</span></div>
        `;

    }

}

module.exports = {
    tab: (name) => tab(name),
    addCond: () => {
        current.rLength++;
        console.log("added one");
        d.getElementById("conditions").innerHTML += "<span>and</span>" + (new newCond({i: current.rLength})).out;
        
    },
    delCond: () => {

    }
}