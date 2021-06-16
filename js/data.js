/* exported data */

var data = {
  search: null,
  searchRecipes: [],
  view: 'home',
  favorites: [],
  dailyRecipes: []
};

var previousData = localStorage.getItem('user-recipe-data');
if (previousData) data = JSON.parse(previousData);

window.addEventListener('beforeunload', handleUnload);

function handleUnload(event) {
  var dataJSON = JSON.stringify(data);
  localStorage.setItem('user-recipe-data', dataJSON);
}
