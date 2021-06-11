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
var $favoritesContainer = document.querySelector('.favorite-list');

$openNavBtn.addEventListener('click', openNavMenu);
$closeNavBtn.addEventListener('click', closeNavMenu);
$searchForm.addEventListener('click', toggleButton);
$toggleOptionsBtn.addEventListener('click', toggleOptions);
$searchIcon.addEventListener('click', showSearchForm);
$searchIconDT.addEventListener('click', showSearchForm);
$navList.addEventListener('click', clickNavLink);
$navBar.addEventListener('click', clickNavLink);
$searchButton.addEventListener('click', showSearchForm);
$submitSearchBtn.addEventListener('click', submitSearch);
window.addEventListener('DOMContentLoaded', handleContentLoad);
document.addEventListener('click', clickOnRecipe);

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

function clickNavLink(event) {
  if (event.target.tagName !== 'A') return;

  var view = event.target.getAttribute('data-view');
  if (view === 'favorites') {
    destroyChildren($favoritesContainer);
    updatePageHeader(view);
    generateRecipeList(data.favorites, $favoritesContainer);
  }
  switchView(view);
}

function submitSearch(event) {
  showSearching($submitSearchBtn);
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
  data.searchRecipes = [];
  for (var i = 0; i < this.response.hits.length; i++) {
    data.searchRecipes.push(this.response.hits[i].recipe);
  }
  destroyChildren($recipeListContainer);
  updatePageHeader('recipe-list');
  generateRecipeList(data.searchRecipes, $recipeListContainer);
  switchView('recipe-list');
  resetSearchButton();
}

function generateRecipeDOM(recipe) {
  /*
  <div class="col-half">
    <div class="row">
      <div class="row col-90 recipe-container" data-index="0">
        <div class="row">
          <div class="col-35 justify-start align-center"><img
              src="https://www.edamam.com/web-img/d13/d1317737f946a1a0246f6fb14882260d.jpg" alt="recipe preview"
              class="thumbnail"></div>
          <div class="col-65 row">
            <div class="col">
              <h3 class="recipe-name">Dinner Tonight: Shrimp Scampi with Pasta Recipe</h3>
            </div>
            <div class="col row">
              <div class="column-half">
                <h5 class="recipe-info"><span class="calorie-num">775</span> Calories/Serv</h5>
              </div>
              <div class="column-half text-right">
                <h5 class="recipe-info"><span class="ingr-num">11</span> Ingredients</h5>
              </div>
            </div>
            <div class="col justify-end">
              <div class="icon-container">
                <img src="images/heart.svg" alt="favorites icon" class="favorite-icon">
                <img src="images/heart-no.svg" alt="unfavorite icon" class="favorite-icon">
              </div>
            </div>
          </div>
          <div class="col row more-info">
            <div class="column-half">
              <h3 class="info-header">Ingredients</h3>
              <ul class="ingredient-list">
                <li>ingredient 1</li>
                <li>ingredient 2</li>
              </ul>
            </div>
            <div class="column-half nutrition-info">
              <h3 class="info-header">Nutrition</h3>
              <table>
                <tbody>
                  <tr>
                    <td>Fat</td>
                    <td>69g</td>
                    <td>106%</td>
                  </tr>
                  <tr>
                    <td>Carbs</td>
                    <td>44g</td>
                    <td>15%</td>
                  </tr>
                  <tr>
                    <td>Sugars</td>
                    <td>4g</td>
                    <td>0%</td>
                  </tr>
                  <tr>
                    <td>Protein</td>
                    <td>58g</td>
                    <td>115%</td>
                  </tr>
                  <tr>
                    <td>Sodium</td>
                    <td>1722mg</td>
                    <td>72%</td>
                  </tr>
                </tbody>
              </table>
              <div class="col">
                <h5 class="instructions-url"><a href="#">Full Instructions</a></h5>
              </div>
            </div>
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

  var $noHeartIcon = document.createElement('img');
  $noHeartIcon.setAttribute('src', 'images/heart-no.svg');
  $noHeartIcon.setAttribute('alt', 'unfavorite icon');
  $noHeartIcon.className = 'unfavorite-icon transparent';
  if (!notInFavorites(recipe.uri)) $noHeartIcon.className = 'unfavorite-icon';

  var $iconContainer = document.createElement('div');
  $iconContainer.className = 'icon-container';
  $iconContainer.appendChild($heartIcon);
  $iconContainer.appendChild($noHeartIcon);

  var $heartIconCol = document.createElement('div');
  $heartIconCol.className = 'col justify-end';
  $heartIconCol.appendChild($iconContainer);

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

  var $moreInfoContainer = generateMoreInfoDOM(recipe);

  var $innerRow = document.createElement('div');
  $innerRow.className = 'row';
  $innerRow.appendChild($imgContainer);
  $innerRow.appendChild($textContainer);
  $innerRow.appendChild($moreInfoContainer);

  var $recipeContainer = document.createElement('div');
  $recipeContainer.className = 'row col-90 recipe-container';
  $recipeContainer.setAttribute('data-uri', recipe.uri);
  $recipeContainer.appendChild($innerRow);

  var $row = document.createElement('div');
  $row.className = 'row';
  $row.appendChild($recipeContainer);

  var $recipe = document.createElement('div');
  $recipe.className = 'col-half';
  $recipe.appendChild($row);

  $recipeListContainer.appendChild($recipe);
  return $recipe;
}

function generateMoreInfoDOM(recipe) {
  var $tBody = document.createElement('tbody');
  var $nutrientTable = document.createElement('table');
  $nutrientTable.appendChild($tBody);
  for (var key in recipe.totalDaily) {
    $tBody.appendChild(generateTableRowDOM(recipe, key));
  }

  var $nutritionText = document.createElement('h3');
  $nutritionText.textContent = 'Nutrition';
  $nutritionText.className = 'info-header';

  var $instructionsURL = document.createElement('a');
  $instructionsURL.setAttribute('href', recipe.url);
  $instructionsURL.textContent = 'Full Instructions';

  var $instructionsText = document.createElement('h5');
  $instructionsText.className = 'instructions-url';
  $instructionsText.appendChild($instructionsURL);

  var $instructionsCol = document.createElement('div');
  $instructionsCol.className = 'col';
  $instructionsCol.appendChild($instructionsText);

  var $nutritionInfo = document.createElement('div');
  $nutritionInfo.className = 'column-half nutrition-info';
  $nutritionInfo.appendChild($nutritionText);
  $nutritionInfo.appendChild($nutrientTable);

  var $ingredientList = document.createElement('ul');
  $ingredientList.className = 'ingredient-list';
  for (var i = 0; i < recipe.ingredientLines.length; i++) {
    var $ingredient = document.createElement('li');
    $ingredient.textContent = recipe.ingredientLines[i];
    $ingredientList.appendChild($ingredient);
  }

  var $ingredientsText = document.createElement('h3');
  $ingredientsText.className = 'info-header';
  $ingredientsText.textContent = 'Ingredients';

  var $ingredientsInfo = document.createElement('div');
  $ingredientsInfo.className = 'column-half';
  $ingredientsInfo.appendChild($ingredientsText);
  $ingredientsInfo.appendChild($ingredientList);
  $ingredientsInfo.appendChild($instructionsCol);

  var $moreInfo = document.createElement('div');
  $moreInfo.className = 'col row more-info';
  $moreInfo.appendChild($ingredientsInfo);
  $moreInfo.appendChild($nutritionInfo);

  return $moreInfo;
}

function generateTableRowDOM(recipe, key) {
  var $label = document.createElement('td');
  $label.textContent = recipe.totalDaily[key].label;

  var $amount = document.createElement('td');
  $amount.textContent = Math.round(recipe.totalNutrients[key].quantity) + recipe.totalNutrients[key].unit;

  var $percent = document.createElement('td');
  $percent.textContent = Math.round(recipe.totalDaily[key].quantity) + '%';

  var $row = document.createElement('tr');
  $row.appendChild($label);
  $row.appendChild($amount);
  $row.appendChild($percent);

  return $row;
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
  } else if (view === 'favorites') {
    $headerText = document.createElement('h3');
    $headerText.className = 'page-header';
    $headerText.textContent = 'Favorite Recipes';

    $headerContainer = document.createElement('div');
    $headerContainer.className = 'col-90 header-container';
    $headerContainer.appendChild($headerText);

    $favoritesContainer.appendChild($headerContainer);
  }
}

function destroyChildren(el) {
  while (el.firstChild) el.firstChild.remove();
}

function generateRecipeList(recipes, $container) {
  if (recipes.length === 0) {
    var $noRecipes = document.createElement('h3');
    $noRecipes.textContent = 'No recipes found';
    $noRecipes.className = 'no-recipes text-center';
    $container.appendChild($noRecipes);
  } else {
    for (var i = 0; i < recipes.length; i++) {
      $container.appendChild(generateRecipeDOM(recipes[i]));
    }
  }
}

function showSearching($button) {
  var $loading = document.createElement('img');
  $loading.setAttribute('src', 'images/rotate-cw.svg');
  $loading.className = 'searching';
  $button.textContent = '';
  $button.appendChild($loading);
}

function resetSearchButton() {
  $submitSearchBtn.textContent = 'Search';
}

function handleContentLoad(event) {
  if (data.view === 'recipe-list') {
    updatePageHeader('recipe-list');
    generateRecipeList(data.searchRecipes, $recipeListContainer);
  } else if (data.view === 'favorites') {
    destroyChildren($favoritesContainer);
    updatePageHeader(data.view);
    generateRecipeList(data.favorites, $favoritesContainer);
  }
  switchView(data.view);
}

function clickHeart(event) {
  event.target.classList.toggle('transparent');
  var $recipeContainer = event.target.closest('.recipe-container');
  var recipeURI = $recipeContainer.getAttribute('data-uri');
  if (notInFavorites(recipeURI)) {
    data.favorites.push(data.searchRecipes[findRecipeIndex(data.searchRecipes, recipeURI)]);
  } else {
    var index = findRecipeIndex(data.favorites, recipeURI);
    data.favorites.splice(index, 1);
  }
}

function notInFavorites(uri) {
  return data.favorites.every(favRecipe => { return favRecipe.uri !== uri; });
}

function findRecipeIndex(recipeList, uri) {
  return recipeList.findIndex(recipe => recipe.uri === uri);
}

function clickOnRecipe(event) {
  if (!event.target.closest('.col-65')) return;

  if (event.target.tagName === 'IMG') {
    event.preventDefault();
    clickHeart(event);
    return;
  }

  var $recipeContainer = event.target.closest('.recipe-container');
  var moreInfoBox = $recipeContainer.querySelector('.more-info');
  expandElement(moreInfoBox, 'open');
}

function expandElement(elem, toggleClass) {
  elem.style.height = '';
  elem.style.transition = 'none';
  var startHeight = window.getComputedStyle(elem).height;

  elem.classList.toggle(toggleClass);
  var height = window.getComputedStyle(elem).height;

  elem.style.height = startHeight;

  requestAnimationFrame(() => {
    elem.style.transition = '';
    requestAnimationFrame(() => {
      elem.style.height = height;
    });
  });

  elem.addEventListener('transitionend', resetHeight);
}

function resetHeight(event) {
  this.style.height = '';
  this.removeEventListener('transitionend', resetHeight);
}
