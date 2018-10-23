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

        container.innerHTML = "<h1>" + name + "</h1><br /><span>If an article's</span>";

        condits = `<div id="conditions">`;

        for (var x in rule.condition) {

            var cRule = rule.condition[x];

            if (x != 0) {
                condits += "<span>and</span>";
            }

            condits += `<div class="condition">`;
            
            //selector
            condits += `<select>`;
            one = ["Title", "Description", "Link", "Custom"];
            for (i in one) {
                condits += i == cRule.selector ? "<option selected>" + one[i] + "</option>" : "<option>" + one[i] + "</option>";
            }
            condits += `</select>`;

            //operator
            condits += `<select>`;
            one = ["contains", "is equal to", "starts with", "end with", "is greater than (nums)", "is less than (nums)"];
            for (i in one) {
                condits += i == cRule.operator ? "<option selected>" + one[i] + "</option>" : "<option>" + one[i] + "</option>";
            }
            condits += `</select>`;

            //input
            condits += `<input type="text" value="` + cRule.value + `" />
            <br />
            <br />`;

            //cs
            condits += cRule.cs ? `<label><i>Case sensitive: </i><input type="checkbox" checked /></label>` 
            : `<label><i>Case sensitive: </i><input type="checkbox" /></label>`;

            //invert
            condits += cRule.invert ? `<label><i>Invert condition: </i><input type="checkbox" checked /></label>` 
            : `<label><i>Invert condition: </i><input type="checkbox" /></label>`;

            condits += `<br />
            <br />
            <button onclick="delCond(` + x + `)">Delete condition</button>`;

            condits += "</div>"

        }

        condits += "</div>"

        container.innerHTML += condits;

        container.innerHTML += `<br />
        <button onclick="addCond();">Add condition</button>
        <br />
        <br />
        <select id="action">
          <option>Mark as read</option>
          <option>Delete</option>
          <option>Hide</option>
        </select>
        <button onclick="save();">Save</button>`;

        container.style.display = "block";
}

window.onload = function() {

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
        console.log("added one");
        d.getElementById("conditions").innerHTML += "<span>and</span>" + (new newCond(current.rLength)).out;
        current.rLength++;
    },
    delCond: (id) => {
        
        // dom

        current.rLength--;
        console.log("lost one bois");
        var condC = d.getElementById("conditions");
        condC.removeChild(d.getElementsByClassName("condition")[id]);
        if (id !== 0) {
            condC.removeChild(condC.getElementsByTagName("span")[id - 1]);
        } else {
            console.log("added one");
            d.getElementById("conditions").innerHTML += (new newCond(current.rLength)).out;
            current.rLength++;
        }
        

        // remove from db

        settings.delete("rRules." + current.name + ".condition[" + id + "]");

    },
    save: () => {

        // dom

        var condtions = d.getElementsByClassName("condition");
        var cObjs = [];

        for (var x = 0; x < condtions.length; x++) {

            //set cObjs
            var push = {selector: 0, operator: 0, value: 0, cs: 0, invert: 0};
            var condC = condtions[x];

            push.selector = condC.children[0].selectedIndex;
            push.operator = condC.children[1].selectedIndex;
            push.value = condC.children[2].value;
            push.cs = condC.children[5].children[1].checked;
            push.invert = condC.children[6].children[1].checked;

            if(push.value === "") {
                d.getElementById("conditions").innerHTML += "<span>All conditions must have values</span>";
                break;
            }

            cObjs[x] = push;

        }

        settings.set("rRules." + current.name, {
            condition: cObjs,
            action: d.getElementById("action").selectedIndex
        })

    }
}