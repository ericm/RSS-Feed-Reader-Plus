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

var current = new Current(null, null, null);
var tab = (name) => {
    open = name;
        
        if (!settings.get("rRules")) {
            settings.set("rRules." + name, {
                condition: [],
                action: -1
            });
        }

        /*
            layout
                condition: [{"title", cond, enact}]
        */

        var rule = settings.get("rRules." + name);
        
        current = new Current(name, rule, rule.condition.length);

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

    },
    save: () => {

        // dom

        var condtions = d.getElementsByClassName("condition");
        var cObjs = [];

        for (var x in condtions) {

            //set cObjs
            var push = {selector: 0, operator: 0, value: 0, cs: 0, invert: 0};
            var select = condtions[x].getElementsByTagName("select");
            var input =  condtions[x].getElementsByTagName("input");

            push.selector = select[0].selectedIndex;
            push.operator = select[1].selectedIndex;
            push.value = input[0].value;
            push.cs = input[1].checked;
            push.invert = input[2].checked;

            if(push.value === "") {
                d.getElementById("conditions").innerHTML += "<span>All conditions must have values</span>";
                break;
            }

            cObjs[x] = push;

        }

        settings.set(current.name, {
            condition: cObjs,
            action: d.getElementById("action").selectedIndex
        })

    }
}