const Sortable = require('sortablejs');

var el = document.getElementById('list');

var sortable = Sortable.create(el, {

  animation: 150,
  preventOnFilter: true,
  filter: '#topOpt'

});
