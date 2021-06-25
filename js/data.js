/* exported data */

let data = {
  search: null,
  searchRecipes: [],
  view: 'home',
  favorites: [],
  dailyRecipes: [],
  viewFav: false,
  viewDaily: false
};

const previousData = localStorage.getItem('user-recipe-data');
if (previousData) data = JSON.parse(previousData);

window.addEventListener('beforeunload', handleUnload);

function handleUnload(event) {
  const dataJSON = JSON.stringify(data);
  localStorage.setItem('user-recipe-data', dataJSON);
}
