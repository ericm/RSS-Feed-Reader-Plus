const {ipcRenderer} = require('electron');
const $ = require('jquery');
const timer = require('./timer.js');

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

var artGlob = new Array();
var xGlob;

var removeMark = (str) => {

    if (str != null) {

        str = str.split(`'`).join('U0027');
        str = str.split(`"`).join('U0022');
        str = str.split("`").join('U0060');
        str = str.split(",").join('U0061');

    }

    return str;
}

var reloaded = (arts, number) => {

    for (var x = xGlob; x < number; x++) {

        var article = arts.arts[x];

        var days = ['Sun','Mon','Tues','Wed','Thurs','Fri','Sat'];
        var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

        var date_diff_indays = (date) => {

            dt1 = new Date(date);
            dt2 = new Date();
            var ago = Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) ) /(1000 * 60 * 60 * 24));
            
            if (ago != 0) {

                if (ago == 1) {
                    return ago + " day ago";
                } else {
                    return ago + " days ago";
                }
                
            } else {
                
                var hrs = Math.floor((dt2.getTime() - dt1.getTime()) /(1000 * 60 * 60));
                if (hrs == 1) {
                    return hrs + " hour ago"
                } else {
                    if (hrs == 0) {
                        var mins = Math.floor((dt2.getTime() - dt1.getTime()) /(1000 * 60));
                        if (mins == 1) {
                            return mins + " minute ago";
                        } else {
                            return mins + " minutes ago"
                        }
                    } else {
                        return hrs + " hours ago";
                    }
                    
                }
                
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
                str = str.replace(/href="([^"]+)/g, `onclick="link(\'$1\')" class="hrefed"`);

                str = str.replace(/script>/g, "");

                return str;
            } else {
                return '';
            }
        }

        var is_exist = (variable) => {
            if (typeof variable !== 'undefined' || variable != null) {
                return variable;
            } else {
                return "";
            }
        }

        var read;

        if (typeof article.read === 'undefined') {

            read = false;

        } else {

            if (article.read == true) {
                read = true;
            } else {
                read = false;
            }

        }

        var newArt;

        if (typeof article.new === 'undefined') {

            newArt = false;

        } else {

            if (article.new == true) {
                newArt = true;
            } else {
                newArt = false;
            }

        }

        var status;

        if (read) {

            status = "READ";

        } else {

            if (newArt) {
                status = "NEW";
            } else {
                status = "UNREAD";
            }

        }

        //For YouTube feeds
        var embed_yt = "";
        if ( extractHostname(article.link) == "www.youtube.com") {
            embed_yt = `<a class="imgpr"><div><img onclick="link('` + article.link + `')" src="` + article['image']['url'] + `"></div></a>`
        }

        enter.innerHTML += `<span class="status status` + status + `">` + status + `</span><div class="article ` + status + `" onclick='opena(` + (x) + `, "` + is_exist(removeMark(article.title)) + `", "` + is_exist(removeMark(article.pubdate)) + `", "` + is_exist(removeMark(article.meta.title)) + `", ` + newArt + `, ` + read +`)'>
<span class="artitle" onclick="link('` + is_exist(article.link) + `')">` + is_exist(article.title) + `</span><br>
<i class="artfeed">From<img src="https://www.google.com/s2/favicons?domain=` + extractHostname(article.link) + `"><b>` + article.meta.title +`</b></i>
<i class="artdate">` + date_format(is_exist(article.pubdate)) + ` (` + date_diff_indays(article.pubdate) + `)</i>
<blockquote>
` + replace_href(article.description) + embed_yt + `
</blockquote>
<div class="artopt">
<label><button onclick='unread("` + is_exist(removeMark(article.title)) + `", "` + is_exist(removeMark(article.pubdate)) + `", "` + is_exist(removeMark(article.meta.title)) + `")' class="unread">Keep unread</button></label>
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

        xGlob = x + 1;
        if (arts.arts.length < arts.num) {
            xGlob = -1;
        }

    }
    enter.innerHTML += `<div id="scrollTo"><img src="../img/load1.gif"></div>`;

    $('iframe').remove();
    $('#container > script').remove();

}

ipcRenderer.on('reloaded', (event, response) => {

    if (typeof response.title !== 'undefined') {

        enter.innerHTML = `<h2><i>` + response.title + `</i></h2>
        <div id="timer"><p><b>Last Refreshed</b>: </p></div>
        <button id="allRead" onclick="allRead('` + removeMark(response.title )+ `')">Mark all as read</button>`;
    
        var number;
    
        if (response.arts.length < response.num) {
            number = response.arts.length;
        } else {
            number = response.num;
        }
        xGlob = 0;
        artGlob = response;
        reloaded(response, number);
        timer.stop();
        timer.start();

    } else {

        if (document.getElementById('item_clicked') !== null) {

            document.getElementById('item_clicked').removeAttribute('id');

        }

        enter.innerHTML = `<h2><i>Latest</i></h2>
        <div id="timer"><p><b>Last Refreshed</b>: </p></div>
        <button id="allRead" onclick="allRead('latest')">Mark all as read</button>`;
    
        var number;
    
        if (response.arts.length < response.num) {
            number = response.arts.length;
        } else {
            number = response.num;
        }
        xGlob = 0;
        artGlob = response;
        reloaded(response, number);
        timer.stop();
        timer.start();

    }

    
});

ipcRenderer.on('newArticles', () => {

    ipcRenderer.send('reload', {get: 'latest', num: 10});

})

// MAD JQUERY SKILZZ
var loadmore = 10;
$('#container').scroll(() => {

    if (artGlob.arts.length < artGlob.num) {
        loadmore = artGlob.arts.length;
    }

    var y_scroll_pos = 0;
    if ($('#scrollTo').length) {
        y_scroll_pos = $('#scrollTo').offset().top;
    }

    var wHeight = $('#container').innerHeight();
    var distance = (y_scroll_pos - wHeight + 148);
              
    if(distance == 0 && xGlob >= 0) {

        $('#scrollTo').remove();
        console.log('loaded more ' + loadmore);
        loadmore += 10;

        if (artGlob.arts.length <= loadmore) {
            if (loadmore != artGlob.arts.length + 10) {
                console.log('fin1');
                loadmore = artGlob.arts.length;
                reloaded(artGlob, loadmore);
            } else {
                console.log('fin');
            }
            
        } else {
            reloaded(artGlob, loadmore);
        }
        
    }

    if (xGlob < 0) {
        $('#scrollTo').remove();
    }

});
