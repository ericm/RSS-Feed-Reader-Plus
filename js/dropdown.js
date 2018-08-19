var dropselect = document.getElementById('drop');
var dropmenu = document.getElementById('drop-menu');

dropselect.addEventListener('click', () => {

    if (dropselect.style.top == "200px") {
        dropselect.style.top = "20px";
        dropmenu.style.height = "0";
    } else {
        dropselect.style.top = "200px";
        dropmenu.style.height = "180px";
    }

    

});