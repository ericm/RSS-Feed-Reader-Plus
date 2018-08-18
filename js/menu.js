var electron = require('electron').remote;

document.getElementById("minimize").addEventListener("click", () => {
    var window = electron.getCurrentWindow();
    window.minimize();
});
document.getElementById("maximize").addEventListener("click", () => {
    var window = electron.getCurrentWindow();
    if (!window.isMaximized()) {
        window.maximize();
    } else {
        window.restore();
    }
});
document.getElementById("ex").addEventListener("click", () => {
    var window = electron.getCurrentWindow();
    window.close();
});
