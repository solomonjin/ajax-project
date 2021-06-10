var $openNavBtn = document.querySelector('.open-nav');
var $toggleNavMenu = document.querySelector('.nav-toggle');
var $closeNavBtn = document.querySelector('.close-nav');
var $searchForm = document.querySelector('.search-form');
var $toggleOptionsBtn = document.querySelector('.toggle-options');
var $moreOptionsForm = document.querySelector('.options');
var $searchIcon = document.querySelector('.search-icon');
var $searchIconDT = document.querySelector('.nav-bar-desktop .search-icon');
var $viewContainer = document.querySelectorAll('.views');
var $navList = document.querySelector('.nav-list');
var $navBar = document.querySelector('.nav-bar-desktop');
var $searchButton = document.querySelector('.search-button');
var $submitSearchBtn = document.querySelector('.submit-search');
var $recipeListContainer = document.querySelector('.recipe-list');

$openNavBtn.addEventListener('click', openNavMenu);
$closeNavBtn.addEventListener('click', closeNavMenu);
$searchForm.addEventListener('click', toggleButton);
$toggleOptionsBtn.addEventListener('click', toggleOptions);
$searchIcon.addEventListener('click', showSearchForm);
$searchIconDT.addEventListener('click', showSearchForm);
$navList.addEventListener('click', clickNavList);
$navBar.addEventListener('click', clickNavList);
$searchButton.addEventListener('click', showSearchForm);
$submitSearchBtn.addEventListener('click', submitSearch);
window.addEventListener('DOMContentLoaded', handleContentLoad);

function openNavMenu(event) {
  $toggleNavMenu.classList.add('show-menu');
}

function closeNavMenu(event) {
  $toggleNavMenu.classList.remove('show-menu');
}

function toggleButton(event) {
  event.preventDefault();
  if (!event.target.classList.contains('toggle-button')) return;

  event.target.classList.toggle('toggled');
}

function toggleOptions(event) {
  event.preventDefault();
  $toggleOptionsBtn.classList.toggle('show-options');
  $moreOptionsForm.classList.toggle('show-more-options');
  if (event.target.textContent === 'More Options') event.target.textContent = 'Less Options';
  else event.target.textContent = 'More Options';
}

function showSearchForm(event) {
  switchView(event.target.getAttribute('data-view'));
}

function switchView(view) {
  data.view = view;
  for (var i = 0; i < $viewContainer.length; i++) {
    if ($viewContainer[i].getAttribute('data-view') === view) $viewContainer[i].classList.remove('hidden');
    else $viewContainer[i].classList.add('hidden');
  }
  closeNavMenu();
}

function clickNavList(event) {
  if (event.target.tagName !== 'A') return;

  switchView(event.target.getAttribute('data-view'));
}

function submitSearch(event) {
  showSearching();
  var $toggleButtonList = document.querySelectorAll('.toggle-button');
  var searchObj = {
    keywords: getKeyWords($searchForm.keywords.value.toLowerCase()),
    calories: getCalories($searchForm.caloriesFrom.value, $searchForm.caloriesTo.value),
    ingredients: getMaxIngredients($searchForm.ingredients.value),
    mealType: getMealType($searchForm.meal.value),
    cuisineType: [],
    diet: [],
    health: [],
    exclude: getExclusions($searchForm.exclusions.value.toLowerCase())
  };
  getButtonOptions($toggleButtonList, searchObj);
  var searchURL = generateSearchURL(searchObj);
  makeQuery(searchURL);
  destroyChildren($recipeListContainer);
}

function getKeyWords(str) {
  if (!str) return '&q=';
  return '&q=' + encodeURIComponent($searchForm.keywords.value);
}

function getCalories(from, to) {
  if (!from && !to) return null;
  if (!to) return '&calories=' + from + encodeURIComponent('+');
  if (!from) return '&calories=' + to;
  else return '&calories=' + from + '-' + to;
}

function getMaxIngredients(ing) {
  if (!ing) return null;
  return '&ingr=' + ing;
}

function getMealType(meal) {
  if (!meal) return null;
  else return '&mealType=' + meal;
}

function getButtonOptions(list, obj) {
  for (var i = 0; i < list.length; i++) {
    if (list[i].classList.contains('toggled')) {
      if (list[i].getAttribute('data-type') === 'cuisineType') obj.cuisineType.push('&cuisineType=' + encodeURIComponent(list[i].getAttribute('data-value')));
      if (list[i].getAttribute('data-type') === 'diet') obj.diet.push('&diet=' + list[i].getAttribute('data-value'));
      if (list[i].getAttribute('data-type') === 'health') obj.health.push('&health=' + list[i].getAttribute('data-value'));
    }
  }
}

function getExclusions(str) {
  var exclusions = [];
  if (!str) return exclusions;
  var list = str.split(' ');
  for (var i = 0; i < list.length; i++) {
    if (list[i] !== '') exclusions.push('&excluded=' + list[i]);
  }
  return exclusions;
}

function generateSearchURL(obj) {
  var url = 'https://api.edamam.com/api/recipes/v2?type=public';
  url += obj.keywords;
  url += '&app_id=df6bbd8b&app_key=16ab3f81eb63f8435dd3e8d0dd8fbed8';
  if (obj.calories) url += obj.calories;
  if (obj.ingredients) url += obj.ingredients;
  if (obj.mealType) url += obj.mealType;
  url += getOptionsURL(obj);
  return url;
}

function getOptionsURL(obj) {
  var result = '';
  for (var i = 0; i < obj.cuisineType.length; i++) {
    result += obj.cuisineType[i];
  }
  for (i = 0; i < obj.diet.length; i++) {
    result += obj.diet[i];
  }
  for (i = 0; i < obj.health.length; i++) {
    result += obj.health[i];
  }
  for (i = 0; i < obj.exclude.length; i++) {
    result += obj.exclude[i];
  }
  return result;
}

function makeQuery(url) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.responseType = 'json';
  xhr.addEventListener('load', loadData);
  xhr.send();
}

function loadData(event) {
  data.search = this.response;
  updatePageHeader('recipe-list');
  generateRecipeList(data.search.hits);
  switchView('recipe-list');
  resetSearchButton();
}

function generateRecipeDOM(recipe, i) {
  /*
  <div class="col-half">
    <div class="row">
      <div class="row col-90 recipe-container">
        <div class="col-35 justify-start align-center">
          <img src="https://www.edamam.com/web-img/7ad/7ad0f60865ab1a5b8c0a3a5e1fe1c1ca.jpg" alt="recipe preview" class="thumbnail">
        </div>
        <div class="col-65 row">
          <div class="col">
            <h3 class="recipe-name">Waffle Iron Ramen Recipe</h3>
          </div>
          <div class="col row">
            <div class="column-half">
              <h5 class="recipe-info"><span class="calorie-num">606</span> Calories/Serv</h5>
            </div>
            <div class="column-half text-right">
              <h5 class="recipe-info"><span class="ingr-num">7</span> Ingredients</h5>
            </div>
          </div>
          <div class="col justify-end">
            <a href="#"><img src="images/heart.svg" alt="favorites icon" class="favorite-icon"></a>
          </div>
        </div>
      </div>
    </div>
  </div>
  */

  var $recipeName = document.createElement('h3');
  $recipeName.className = 'recipe-name';
  $recipeName.textContent = recipe.label;

  var $recipeNameCol = document.createElement('div');
  $recipeNameCol.className = 'col';
  $recipeNameCol.appendChild($recipeName);

  var $calorieNum = document.createElement('span');
  $calorieNum.className = 'calorie-num';
  $calorieNum.textContent = parseInt(recipe.calories / recipe.yield);

  var $calorieText = document.createElement('h5');
  $calorieText.className = 'recipe-info';
  $calorieText.textContent = ' Calories/Serv';
  $calorieText.prepend($calorieNum);

  var $calorieCol = document.createElement('div');
  $calorieCol.className = 'column-half';
  $calorieCol.appendChild($calorieText);

  var $ingrNum = document.createElement('span');
  $ingrNum.className = 'ingr-num';
  $ingrNum.textContent = recipe.ingredientLines.length;

  var $ingrText = document.createElement('h5');
  $ingrText.className = 'recipe-info';
  $ingrText.textContent = ' Ingredients';
  $ingrText.prepend($ingrNum);

  var $ingrCol = document.createElement('div');
  $ingrCol.className = 'column-half text-right';
  $ingrCol.appendChild($ingrText);

  var $calIngrCol = document.createElement('div');
  $calIngrCol.className = 'col row';
  $calIngrCol.appendChild($calorieCol);
  $calIngrCol.appendChild($ingrCol);

  var $heartIcon = document.createElement('img');
  $heartIcon.setAttribute('src', 'images/heart.svg');
  $heartIcon.setAttribute('alt', 'favorites icon');
  $heartIcon.className = 'favorite-icon';

  var $anchorWrap = document.createElement('a');
  $anchorWrap.setAttribute('href', '#');
  $anchorWrap.appendChild($heartIcon);

  var $heartIconCol = document.createElement('div');
  $heartIconCol.className = 'col justify-end';
  $heartIconCol.appendChild($anchorWrap);

  var $textContainer = document.createElement('div');
  $textContainer.className = 'col-65 row';
  $textContainer.appendChild($recipeNameCol);
  $textContainer.appendChild($calIngrCol);
  $textContainer.appendChild($heartIconCol);

  var $thumbNail = document.createElement('img');
  $thumbNail.setAttribute('src', recipe.image);
  $thumbNail.setAttribute('alt', 'recipe preview');
  $thumbNail.className = 'thumbnail';

  var $imgContainer = document.createElement('div');
  $imgContainer.className = 'col-35 justify-start align-center';
  $imgContainer.appendChild($thumbNail);

  var $recipeContainer = document.createElement('div');
  $recipeContainer.className = 'row col-90 recipe-container';
  $recipeContainer.setAttribute('data-index', i);
  $recipeContainer.appendChild($imgContainer);
  $recipeContainer.appendChild($textContainer);

  var $row = document.createElement('div');
  $row.className = 'row';
  $row.appendChild($recipeContainer);

  var $recipe = document.createElement('div');
  $recipe.className = 'col-half';
  $recipe.appendChild($row);

  $recipeListContainer.appendChild($recipe);
  return $recipe;
}

function updatePageHeader(view) {
  if (view === 'recipe-list') {
    var $recipeCount = document.createElement('span');
    $recipeCount.textContent = data.search.count;

    var $headerText = document.createElement('h3');
    $headerText.className = 'page-header';
    $headerText.textContent = ' Recipes Found';
    $headerText.prepend($recipeCount);

    var $headerContainer = document.createElement('div');
    $headerContainer.className = 'col-90 header-container';
    $headerContainer.appendChild($headerText);

    $recipeListContainer.appendChild($headerContainer);
  }
}

function destroyChildren(el) {
  while (el.firstChild) el.firstChild.remove();
}

function generateRecipeList(recipes) {
  for (var i = 0; i < recipes.length; i++) {
    $recipeListContainer.appendChild(generateRecipeDOM(recipes[i].recipe, i));
  }
}

function showSearching() {
  var $loading = document.createElement('img');
  $loading.setAttribute('src', 'images/rotate-cw.svg');
  $loading.className = 'searching';
  $submitSearchBtn.textContent = '';
  $submitSearchBtn.appendChild($loading);
}

function resetSearchButton() {
  $submitSearchBtn.textContent = 'Search';
}

function handleContentLoad(event) {
  if (data.view === 'recipe-list') {
    updatePageHeader('recipe-list');
    generateRecipeList(data.search.hits);
  }
  switchView(data.view);
}
