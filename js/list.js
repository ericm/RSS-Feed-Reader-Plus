const {ipcRenderer} = require('electron');
const renderer = require('./renderer.js');
const settings = require('electron-settings');

document.getElementById('list').style.height = window.innerHeight - 70 + "px";
document.getElementById('container').style.height = window.innerHeight - 153 + "px";
document.getElementById('container').style.width = window.innerWidth - 270 + "px";

window.onresize = () => {

    document.getElementById('list').style.height = window.innerHeight - 70 + "px";
    document.getElementById('container').style.height = window.innerHeight - 153 + "px";
    
    if (window.innerWidth > 1512) {

        var wWidth = (window.innerWidth - 1260 - 250) /2;
        var cLeft = 250 + wWidth;
        document.getElementById('container').style.left = cLeft + "px";
        document.getElementById('container').style.width = window.innerWidth - cLeft - 20 + "px"

    } else {
        document.getElementById('container').style.left = "250px";
        document.getElementById('container').style.width = window.innerWidth - 270 + "px";
    }

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

    var unseen = settings.get('articles.unseen');
    if (unseen != 0) {
        enter.innerHTML = `<span id="amount">` + unseen + `</span>`;
    } else {
        enter.innerHTML = "";
    }
    
    ipcRenderer.send('reload', {get: 'latest', num: 10});
    refresh(response);
});

ipcRenderer.on('refreshed-new', (event, response) => {

    var unseen = settings.get('articles.unseen');
    if (unseen != 0) {
        enter.innerHTML = `<span id="amount">` + unseen + `</span>`;
    } else {
        enter.innerHTML = "";
    }

    ipcRenderer.send('reload', {get: 'latest', num: 10});
    refresh(response);
});

ipcRenderer.on('newList', (event, response) => {

    var unseen = settings.get('articles.unseen');
    if (unseen != 0) {
        enter.innerHTML = `<span id="amount">` + unseen + `</span>`;
    } else {
        enter.innerHTML = "";
    }

    refresh(response);

});

ipcRenderer.on('readFeed', (event, response) => {

    var unseen = settings.get('articles.unseen');
    if (unseen != 0) {
        enter.innerHTML = `<span id="amount">` + unseen + `</span>`;
    } else {
        enter.innerHTML = "";
    }

    ipcRenderer.send('reload', {get: 'feed', name: response.name, num: 10});
    refresh(response.feeds);

});

ipcRenderer.on('readLatest', (event, response) => {

    var unseen = settings.get('articles.unseen');
    if (unseen != 0) {
        enter.innerHTML = `<span id="amount">` + unseen + `</span>`;
    } else {
        enter.innerHTML = "";
    }

    ipcRenderer.send('reload', {get: 'latest', num: 10});
    refresh(response);

});


ipcRenderer.on('reGot', (event) => {
    document.getElementById('topOpt').getElementsByTagName('span')[1].getElementsByTagName('img')[0].style.cursor = "pointer";
});


var respGlob = new Array();

var removeMark = (str) => {

    str = str.split(`'`).join('');
    str = str.split(`"`).join('');
    str = str.split("`").join('');

    return str;
}

var refresh = (response) => {

    respGlob = response;

    enter.innerHTML += `<div id="topOpt">
    <span onclick="load()">View Latest</span>
    <span onclick="reload()"><img style="width: 22px; height: 22px;" src="../img/reload.svg"/></span>
    </div>`;

    if (response.length != 0) {

        for (x in response) {

            var img  = extractHostname(response[x].link);

            var amStr = "";
            if (settings.has('list.' + x)) {

                if (settings.get('list.' + x) != 0) {

                    var amn = settings.get('list.' + x);

                    if (amn.toString().length > 1) {

                        amStr = `<div style="margin-top:-15px;"></div>
                        <span style="left: 185px;" class="amountList">` + settings.get('list.' + x) + `</span>`;

                    } else {

                        amStr = `<div style="margin-top:-15px;"></div>
                        <span class="amountList">` + settings.get('list.' + x) + `</span>`;

                    }

                    

                }

            }

            enter.innerHTML += `
` + amStr + `
<div class="item" draggable="true" onclick="tab('` + removeMark(response[x].name) + `', ` + x + `, '` + removeMark(response[x].title) + `')" oncontextmenu="rcl(` + x + `, event)">
    <span>` + response[x].title + `</span>
    <i><img src="https://www.google.com/s2/favicons?domain=` + img + `">` + response[x].link + `</i>
</div>
    
            `;
        }

    } else {
        enter.innerHTML += '<i class="nothing">No feeds found</i>';
    }
    
    enter.innerHTML += '</div><div class="break"></div>';

};


document.getElementById('rcl-back').onclick = () => {

    var rcl = document.getElementById('rcl');
    var rclb = document.getElementById('rcl-back');

    rcl.style.display = "none";
    rclb.style.display = "none";

    rclb.style.backgroundColor = "rgba(34, 34, 34, 0)";
    rcl.style.border = "3px solid rgba(230, 25, 66, 0)";

    var el = document.getElementById('rcl'),
        elClone = el.cloneNode(true);
    el.parentNode.replaceChild(elClone, el);
    
}

document.getElementById('rcl-back').oncontextmenu = () => {

    var rcl = document.getElementById('rcl');
    var rclb = document.getElementById('rcl-back');

    rcl.style.display = "none";
    rclb.style.display = "none";

    rclb.style.backgroundColor = "rgba(34, 34, 34, 0)";
    rcl.style.border = "3px solid rgba(230, 25, 66, 0)";

    var el = document.getElementById('rcl'),
        elClone = el.cloneNode(true);
    el.parentNode.replaceChild(elClone, el);

}

var extractHostname = (url) => {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

module.exports = {

    quit: () => {

        ipcRenderer.send('quit', true);

    },

    link: (snd) => {

        ipcRenderer.send('link', snd);

    },

    opena: (i, titleArt, pubdate, feed, newArt, read) => {

        var artcle = document.getElementsByClassName('article')[i];
        //
        artcle.style.height = "auto";
        artcle.style.boxShadow = "inset 0px -130px 200px -100px transparent";
        artcle.classList.add("clickeda");
        var title = artcle.getElementsByTagName('span')[0];
        title.classList += " linked";

        var text = document.createElement('p');
        text.textContent = "(Link)";
        title.appendChild(text);
        
        document.getElementsByClassName('artopt')[i].style.display = "block";
        document.getElementsByClassName('artup')[i].style.display = "block";
        //artcle.getElementsByTagName('iframe')[0].style.cssText = 'position: inherit;';

        if (typeof artcle.getElementsByClassName('imgpr')[0] !== 'undefined') {
            artcle.getElementsByClassName('imgpr')[0].getElementsByTagName('img')[0].style.zIndex = "0";
        }

        var it = artcle.getElementsByTagName('blockquote')[0].getElementsByTagName('i');
        if (it.length > 0) {
            it[0].style.cursor = "default";
        }

        //Set article as read

        if (!read) {

            ipcRenderer.send('read', {titleArt: titleArt, pubdate: pubdate, feed: feed, newArt: newArt});

            var stats = document.getElementsByClassName('status')[i];
            stats.classList = "status statusREAD";
            stats.innerHTML = "READ";

            var oncl = artcle.getAttribute('onclick').split(',');
            oncl[5] = 'true)';

            var oncl = oncl.join();

            artcle.setAttribute('onclicked', oncl);

            artcle.removeAttribute('onclick');

        } else {

            var oncl = artcle.getAttribute('onclick');

            artcle.setAttribute('onclicked', oncl);

            artcle.removeAttribute('onclick');

        }

    },

    closea: (i) => {

        var artcle = document.getElementsByClassName('article')[i];
        artcle.removeAttribute('style');

        artcle.classList.remove("clickeda");
        var title = artcle.getElementsByTagName('span')[0];
        title.classList.remove("linked");

        var text = title.getElementsByTagName('p')[0];
        title.removeChild(text);
        
        document.getElementsByClassName('artopt')[i].style.display = "none";
        document.getElementsByClassName('artup')[i].style.display = "none";
        //artcle.getElementsByTagName('iframe')[0].style.cssText =  'position: relative !important;';

        if (typeof artcle.getElementsByClassName('imgpr')[0] !== 'undefined') {
            artcle.getElementsByClassName('imgpr')[0].getElementsByTagName('img')[0].style.zIndex = "-100";
        }
        

        var it = artcle.getElementsByTagName('blockquote')[0].getElementsByTagName('i');
        if (it.length > 0) {
            it[0].style.cursor = "pointer";
        }

        setTimeout(() => {
            var oncl = artcle.getAttribute('onclicked');
            artcle.setAttribute('onclick', oncl);
            artcle.removeAttribute('onclicked');
        }, 1000);
        
    },

    tab: (name, i, title) => {

        document.getElementById('container').scrollTo(0, 0);

        renderer.rename(title);

        if (respGlob.length != 0) {

            if (document.getElementById('item_clicked') !== null) {

                document.getElementById('item_clicked').removeAttribute('id');

            }

            document.getElementsByClassName('item')[i].setAttribute('id', 'item_clicked');

            ipcRenderer.send('reload', {get: 'feed', name: name, num: 10});

        }

    },

    load: () => {

        document.getElementById('container').scrollTo(0, 0);
        renderer.rename('Latest');
        ipcRenderer.send('reload', {get: 'latest', num: 10});

    },

    reload: () => {
        document.getElementById('container').scrollTo(0, 0);
        //document.getElementById('topOpt').getElementsByTagName('span')[1].getElementsByTagName('img')[0].style.cursor = "not-allowed";
        ipcRenderer.send('reGet', []);
    },

    unread: (title, pubdate, feed, newArt) => {

        ipcRenderer.send('unread', {title: title, pubdate: pubdate, feed: feed, new: newArt});

    },

    allRead: (feed) => {

        var title = feed.replace(/U0027/g, "'").replace(/U0022/g, '"').replace(/U0060/g, '"').replace(/U0061/g, ',');

        ipcRenderer.send('allRead', title);

    }

}