const settings = require('electron-settings');

var load = () => {

    if (settings.get('main.theme') == 'Default') {

        var newStyle = document.createElement('style');
    

        if (settings.get('main.opacity') == 100) {
            newStyle.appendChild(document.createTextNode('body {background-color: rgba(255, 255, 255, 1);}'));
        } else {
            newStyle.appendChild(document.createTextNode('body {background-color: rgba(255, 255, 255, .' + settings.get('main.opacity') + ');}'));
        }
    
        document.getElementsByTagName('head')[0].appendChild(newStyle);

    }

    else if (settings.get('main.theme') == 'Dark') {

        var newStyle = document.createElement('style');
    

        if (settings.get('main.opacity') == 100) {
            newStyle.appendChild(document.createTextNode('body {background-color: rgba(41, 41, 41, 1);}'));
        } else {
            newStyle.appendChild(document.createTextNode('body {background-color: rgba(41, 41, 41, .' + settings.get('main.opacity') + ');}'));
        }
    
        document.getElementsByTagName('head')[0].appendChild(newStyle);

    }


    //Set css file

    if (settings.get('main.theme') == 'Default') {

        if (document.getElementById('theme') != null) {

            document.getElementById('theme').remove();

        }

    }
    
    else if (settings.get('main.theme') == 'Dark') {

        if (document.getElementById('theme') == null) {

            var dark = document.createElement('link');
            dark.setAttribute('rel', 'stylesheet');
            dark.setAttribute('href', '../styles/themes/dark.css');
            dark.id = "theme";

            document.head.appendChild(dark);

        }

    }

}

document.onload = load();

settings.watch('main', newVal => {

    if (newVal.theme == 'Default') {

        var style = document.getElementsByTagName('style')[document.getElementsByTagName('style').length - 1];

        var css;
    
        if (newVal.opacity == 100) {
            css = 'body {background-color: rgba(255, 255, 255, 1);}';
        } else {
            css = 'body {background-color: rgba(255, 255, 255, .' + newVal.opacity + ');}';
        }
    
        style.innerText = css;

    }

    else if (newVal.theme == 'Dark') {

        var style = document.getElementsByTagName('style')[document.getElementsByTagName('style').length - 1];

        var css;
    
        if (newVal.opacity == 100) {
            css = 'body {background-color: rgba(41, 41, 41, 1);}';
        } else {
            css = 'body {background-color: rgba(41, 41, 41, .' + newVal.opacity + ');}';
        }
    
        style.innerText = css;

    }


    //Set css file

    if (newVal.theme == 'Default') {

        if (document.getElementById('theme') != null) {

            document.getElementById('theme').remove();

        }

    }
    
    else if (newVal.theme == 'Dark') {

        if (document.getElementById('theme') == null) {

            var dark = document.createElement('link');
            dark.setAttribute('rel', 'stylesheet');
            dark.setAttribute('href', '../styles/themes/dark.css');
            dark.id = "theme";

            document.head.appendChild(dark);

        }

    }

});