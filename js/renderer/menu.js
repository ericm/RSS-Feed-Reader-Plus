var electron = require('electron').remote;

document.getElementById("minimize").addEventListener("click", () => {
    var win = electron.getCurrentWindow();
    win.minimize();
});
document.getElementById("maximize").addEventListener("click", () => {
    var win = electron.getCurrentWindow();

    if (!win.isMaximized()) {
        win.maximize();
    } else {
        win.restore();
    }
});
document.getElementById("ex").addEventListener("click", () => {
    var win = electron.getCurrentWindow();
    win.close();
});