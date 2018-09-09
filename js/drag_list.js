const Sortable = require('sortablejs');
const {ipcRenderer} = require('electron');

var sortIt = () => {

  

}

module.exports = {

  sort: () => {

    var el = document.getElementById('listSort');

    var sortable = Sortable.create(el, {
  
      animation: 150,
      preventOnFilter: true,
      filter: '#topOpt',
    
      onSort: (evt) => {
  
        var item = evt.item
  
        var id = parseInt(item.getAttribute('origin'));
  
        ipcRenderer.send('changeOrder', {id: id, position: evt.newIndex, old: evt.oldIndex});
    
      }
    
    });

  }

}
