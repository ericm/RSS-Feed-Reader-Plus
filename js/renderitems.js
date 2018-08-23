const {ipcRenderer} = require('electron');

document.onload = ipcRenderer.send('reload', {get: 'latest', num: 10});

var enter = document.getElementById('container');

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

ipcRenderer.on('reloaded', (event, response) => {

    enter.innerHTML = "<h2><i>Latest</i></h2>";

    var number;

    if (response.arts.length < response.num) {
        number = response.arts.length;
    } else {
        number = response.num;
    }

    for (var x = 0; x < number; x++) {

        var article = response.arts[x];

        var days = ['Sun','Mon','Tues','Wednes','Thurs','Fri','Sat'];
        var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

        var date_diff_indays = (date) => {

            dt1 = new Date(date);
            dt2 = new Date();
            var ago = Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) ) /(1000 * 60 * 60 * 24));
            
            if (ago != 0) {
                return ago + " days ago";
            } else {
                return Math.floor((dt2.getTime() - dt1.getTime()) /(1000 * 60 * 60)) + " hours ago";
            }
            
        
        }

        var date_format = (date) => {

            var dated = new Date(date);
            var d = dated.getDay();
            var dd = dated.getDate();
            var mm = dated.getMonth();
            var yyyy = dated.getFullYear();
            var hr = dated.getHours();
            var mi = dated.getMinutes();
            var se = dated.getSeconds();

            if (dd.toString().length == 1) {
                dd = '0' + dd.toString();
            }
            if (hr.toString().length == 1) {
                hr = '0' + hr.toString();
            }
            if (mi.toString().length == 1) {
                mi = '0' + mi.toString();
            }
            if (se.toString().length == 1) {
                se = '0' + se.toString();
            }

            return days[d] + ' ' + dd + ' ' + months[mm] + ' ' + yyyy + ' ' + hr + ':' + mi + ':' + se;

        }

        var replace_href = (str) => {
            if (str != null) {
                return str.replace(/href="([^"]+)/g, `onclick="link(\'$1\')" class="hrefed"`);
            } else {
                return '<i style="cursor: pointer !important;">No Description</i>';
            }
        }

        var is_exist = (variable) => {
            if (typeof variable !== 'undefined' || variable != null) {
                return variable;
            } else {
                return "";
            }
        }

        //For YouTube feeds
        var embed_yt = "";
        if (typeof article['yt:videoid'] !== 'undefined') {
            embed_yt = `<div class="yt"><iframe style="position: relative !important;" width="480" height="270" src="https://www.youtube.com/embed/` + article['yt:videoid']['#'] + `" frameborder="0" allow="encrypted-media"></iframe></div>`
        }

        enter.innerHTML += `<div class="article" onclick="opena(` + (x) + `)">
<span class="artitle" onclick="link('` + is_exist(article.link) + `')">` + is_exist(article.title) + `</span><br>
<i class="artfeed">From<img src="https://www.google.com/s2/favicons?domain=` + extractHostname(article.link) + `"><b>` + article.meta.title +`</b></i>
<i class="artdate">` + date_format(is_exist(article.pubdate)) + ` (` + date_diff_indays(article.pubdate) + `)</i>
<blockquote>
` + replace_href(article.description) + embed_yt + `
</blockquote>
<div class="artopt">
<label><button class="unread">Keep unread</button></label>
<label><button>Hide</button></label>
<label>
Save to:
<select>
<option>Starred</option>
</select>
</label>
</div>

<div class="artup">
<img src="../img/arrow1.png" onclick="closea(` + x + `)">
</div>`;

    }
    enter.innerHTML += `<div style="margin-bottom: 100px;"></div>`;

});
