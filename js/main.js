/* global gsap */
/* global ScrollTrigger */

const $toggleNavMenu = document.querySelector('.nav-toggle');
const $closeNavBtn = document.querySelector('.close-nav');
const $searchForm = document.querySelector('.search-form');
const $searchOptions = document.querySelector('.search-options');
const $toggleOptionsBtn = document.querySelector('.toggle-options');
const $moreOptionsForm = document.querySelector('.options');
const $viewContainer = document.querySelectorAll('.views');
const $navList = document.querySelector('.nav-list');
const $navBar = document.querySelector('.nav-bar');
const $navBarDT = document.querySelector('.nav-bar-desktop');
const $searchButton = document.querySelector('.search-button');
const $submitSearchBtn = document.querySelector('.submit-search');
const $recipeListContainer = document.querySelector('.recipe-list');
const $favoritesContainer = document.querySelector('.favorite-list');
const $dailyContainer = document.querySelector('.daily-list');
const $moreRecipesBtn = document.querySelector('.more-recipes');
const $closeModalBtn = document.querySelector('.close-modal');
const $modal = document.querySelector('.modal');

$closeNavBtn.addEventListener('click', toggleNavMenu);
$searchOptions.addEventListener('click', toggleButton);
$searchForm.addEventListener('submit', submitSearch);
$toggleOptionsBtn.addEventListener('click', toggleOptions);
$navList.addEventListener('click', handleNavigation);
$navBar.addEventListener('click', handleNavigation);
$navBarDT.addEventListener('click', handleNavigation);
$searchButton.addEventListener('click', handleNavigation);
window.addEventListener('DOMContentLoaded', handleContentLoad);
document.addEventListener('click', clickOnRecipe);
$moreRecipesBtn.addEventListener('click', showMoreRecipes);
$dailyContainer.addEventListener('click', clickOnNutrition);
$closeModalBtn.addEventListener('click', toggleModal);

function toggleNavMenu(event) {
  $toggleNavMenu.classList.toggle('show-menu');
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

function switchView(view) {
  data.view = view;
  for (let i = 0; i < $viewContainer.length; i++) {
    if ($viewContainer[i].getAttribute('data-view') === view) $viewContainer[i].classList.remove('hidden');
    else $viewContainer[i].classList.add('hidden');
  }
  if ($toggleNavMenu.classList.contains('show-menu')) toggleNavMenu();
}

function handleNavigation(event) {
  if (event.target.tagName !== 'A' && event.target.tagName !== 'IMG' &&
  event.target.tagName !== 'BUTTON' && event.target.tagName !== 'SPAN') return;

  if (event.target.classList.contains('open-nav')) {
    toggleNavMenu();
    return;
  }
  const view = event.target.getAttribute('data-view');
  if (view === 'favorites') {
    data.view = view;
    if (!data.viewFav) clickQuestionIcon();
    data.viewFav = true;
    destroyChildren($favoritesContainer);
    updatePageHeader(view);
    generateRecipeList(data.favorites, $favoritesContainer);
  } else if (view === 'daily') {
    data.view = view;
    if (!data.viewDaily) clickQuestionIcon();
    data.viewDaily = true;
    destroyChildren($dailyContainer);
    updatePageHeader(view);
    generateDailyTableDOM(data.dailyRecipes);
    generateRecipeList(data.dailyRecipes, $dailyContainer);
  }
  switchView(view);
}

function submitSearch(event) {
  event.preventDefault();
  showSearching($submitSearchBtn);
  const $toggleButtonList = document.querySelectorAll('.toggle-button');
  const searchObj = {
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
  const searchURL = generateSearchURL(searchObj);
  makeQuery(searchURL);
  destroyChildren($recipeListContainer);
  resetSearchForm();
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
  for (let i = 0; i < list.length; i++) {
    if (list[i].classList.contains('toggled')) {
      if (list[i].getAttribute('data-type') === 'cuisineType') obj.cuisineType.push('&cuisineType=' + encodeURIComponent(list[i].getAttribute('data-value')));
      if (list[i].getAttribute('data-type') === 'diet') obj.diet.push('&diet=' + list[i].getAttribute('data-value'));
      if (list[i].getAttribute('data-type') === 'health') obj.health.push('&health=' + list[i].getAttribute('data-value'));
    }
  }
}

function getExclusions(str) {
  const exclusions = [];
  if (!str) return exclusions;
  const list = str.split(' ');
  for (let i = 0; i < list.length; i++) {
    if (list[i] !== '') exclusions.push('&excluded=' + list[i]);
  }
  return exclusions;
}

function generateSearchURL(obj) {
  let url = 'https://api.edamam.com/api/recipes/v2?type=public';
  url += obj.keywords;
  url += '&app_id=df6bbd8b&app_key=16ab3f81eb63f8435dd3e8d0dd8fbed8';
  if (obj.calories) url += obj.calories;
  if (obj.ingredients) url += obj.ingredients;
  if (obj.mealType) url += obj.mealType;
  url += getOptionsURL(obj);
  return url;
}

function getOptionsURL(obj) {
  let result = '';
  for (let i = 0; i < obj.cuisineType.length; i++) {
    result += obj.cuisineType[i];
  }
  for (let i = 0; i < obj.diet.length; i++) {
    result += obj.diet[i];
  }
  for (let i = 0; i < obj.health.length; i++) {
    result += obj.health[i];
  }
  for (let i = 0; i < obj.exclude.length; i++) {
    result += obj.exclude[i];
  }
  return result;
}

function makeQuery(url) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.responseType = 'json';
  xhr.addEventListener('load', loadData);
  xhr.send();
}

function loadData(event) {
  data.search = this.response;
  checkRecipeCount();
  if (data.search.from !== 1) {
    addSearchRecipes();
    generateRecipeList(data.searchRecipes.slice(data.search.from - 1), $recipeListContainer);
    resetShowMoreBtn();
  } else {
    data.searchRecipes = [];
    addSearchRecipes();
    destroyChildren($recipeListContainer);
    updatePageHeader('recipe-list');
    switchView('recipe-list');
    generateRecipeList(data.searchRecipes, $recipeListContainer);
    resetSearchButton();
  }
}

function addSearchRecipes() {
  for (let i = 0; i < data.search.hits.length; i++) {
    data.searchRecipes.push(data.search.hits[i].recipe);
  }
}

function checkRecipeCount() {
  if (data.search.to - data.search.from < 19) $moreRecipesBtn.classList.toggle('hidden');
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

  const $recipeName = document.createElement('h3');
  $recipeName.className = 'recipe-name';
  $recipeName.textContent = recipe.label;

  const $recipeNameCol = document.createElement('div');
  $recipeNameCol.className = 'col';
  $recipeNameCol.appendChild($recipeName);

  const $calorieNum = document.createElement('span');
  $calorieNum.className = 'calorie-num';
  $calorieNum.textContent = parseInt(recipe.calories / recipe.yield);

  const $calorieText = document.createElement('h5');
  $calorieText.className = 'recipe-info';
  $calorieText.textContent = ' Calories/Serv';
  $calorieText.prepend($calorieNum);

  const $calorieCol = document.createElement('div');
  $calorieCol.className = 'column-half';
  $calorieCol.appendChild($calorieText);

  const $ingrNum = document.createElement('span');
  $ingrNum.className = 'ingr-num';
  $ingrNum.textContent = recipe.ingredientLines.length;

  const $ingrText = document.createElement('h5');
  $ingrText.className = 'recipe-info';
  $ingrText.textContent = ' Ingredients';
  $ingrText.prepend($ingrNum);

  const $ingrCol = document.createElement('div');
  $ingrCol.className = 'column-half text-right';
  $ingrCol.appendChild($ingrText);

  const $calIngrCol = document.createElement('div');
  $calIngrCol.className = 'col row';
  $calIngrCol.appendChild($calorieCol);
  $calIngrCol.appendChild($ingrCol);

  const $dayPlusIcon = document.createElement('img');
  $dayPlusIcon.setAttribute('src', 'images/calendar-plus.svg');
  $dayPlusIcon.setAttribute('alt', 'day plus icon');
  $dayPlusIcon.className = 'daily-icon';
  if (!notInData(recipe.uri, data.dailyRecipes)) $dayPlusIcon.className = 'daily-icon transparent';

  const $dayMinusIcon = document.createElement('img');
  $dayMinusIcon.setAttribute('src', 'images/calendar-minus.svg');
  $dayMinusIcon.setAttribute('alt', 'day minus icon');
  $dayMinusIcon.className = 'daily-minus-icon';

  const $dayIconContainer = document.createElement('div');
  $dayIconContainer.className = 'icon-container';
  $dayIconContainer.appendChild($dayPlusIcon);
  $dayIconContainer.appendChild($dayMinusIcon);

  const $heartIcon = document.createElement('img');
  $heartIcon.setAttribute('src', 'images/heart.svg');
  $heartIcon.setAttribute('alt', 'favorites icon');
  $heartIcon.className = 'favorite-icon';

  const $noHeartIcon = document.createElement('img');
  $noHeartIcon.setAttribute('src', 'images/heart-no.svg');
  $noHeartIcon.setAttribute('alt', 'unfavorite icon');
  $noHeartIcon.className = 'unfavorite-icon transparent';
  if (!notInData(recipe.uri, data.favorites)) $noHeartIcon.className = 'unfavorite-icon';

  const $heartIconContainer = document.createElement('div');
  $heartIconContainer.className = 'icon-container';
  $heartIconContainer.appendChild($heartIcon);
  $heartIconContainer.appendChild($noHeartIcon);

  const $iconCol = document.createElement('div');
  $iconCol.className = 'col justify-end icon-col';
  $iconCol.appendChild($dayIconContainer);
  $iconCol.appendChild($heartIconContainer);

  const $textContainer = document.createElement('div');
  $textContainer.className = 'col-65 row';
  $textContainer.appendChild($recipeNameCol);
  $textContainer.appendChild($calIngrCol);
  $textContainer.appendChild($iconCol);

  const $thumbNail = document.createElement('img');
  $thumbNail.setAttribute('src', recipe.image);
  $thumbNail.setAttribute('alt', 'recipe preview');
  $thumbNail.className = 'thumbnail';

  const $imgContainer = document.createElement('div');
  $imgContainer.className = 'col-35 justify-center align-center';
  $imgContainer.appendChild($thumbNail);

  const $moreInfoContainer = generateMoreInfoDOM(recipe);

  const $innerRow = document.createElement('div');
  $innerRow.className = 'row';
  $innerRow.appendChild($imgContainer);
  $innerRow.appendChild($textContainer);
  $innerRow.appendChild($moreInfoContainer);

  const $recipeContainer = document.createElement('div');
  $recipeContainer.className = 'row col-90 recipe-container';
  $recipeContainer.setAttribute('data-uri', recipe.uri);
  $recipeContainer.appendChild($innerRow);

  const $row = document.createElement('div');
  $row.className = 'row';
  $row.appendChild($recipeContainer);

  const $recipe = document.createElement('div');
  $recipe.className = 'col-half recipe-box';
  $recipe.appendChild($row);

  $recipeListContainer.appendChild($recipe);
  return $recipe;
}

function generateMoreInfoDOM(recipe) {
  const $tBody = document.createElement('tbody');
  const $nutrientTable = document.createElement('table');
  $nutrientTable.appendChild($tBody);
  for (const key in recipe.totalDaily) {
    $tBody.appendChild(generateTableRowDOM(recipe, key));
  }

  const $nutritionText = document.createElement('h3');
  $nutritionText.textContent = 'Nutrition';
  $nutritionText.className = 'info-header';

  const $instructionsURL = document.createElement('a');
  $instructionsURL.setAttribute('href', recipe.url);
  $instructionsURL.textContent = 'Full Instructions';

  const $instructionsText = document.createElement('h5');
  $instructionsText.className = 'instructions-url';
  $instructionsText.appendChild($instructionsURL);

  const $instructionsCol = document.createElement('div');
  $instructionsCol.className = 'col';
  $instructionsCol.appendChild($instructionsText);

  const $nutritionInfo = document.createElement('div');
  $nutritionInfo.className = 'column-half nutrition-info';
  $nutritionInfo.appendChild($nutritionText);
  $nutritionInfo.appendChild($nutrientTable);

  const $ingredientList = document.createElement('ul');
  $ingredientList.className = 'ingredient-list';
  for (let i = 0; i < recipe.ingredientLines.length; i++) {
    const $ingredient = document.createElement('li');
    $ingredient.textContent = recipe.ingredientLines[i];
    $ingredientList.appendChild($ingredient);
  }

  const $ingredientsText = document.createElement('h3');
  $ingredientsText.className = 'info-header';
  $ingredientsText.textContent = 'Ingredients';

  const $ingredientsInfo = document.createElement('div');
  $ingredientsInfo.className = 'col-45';
  $ingredientsInfo.appendChild($ingredientsText);
  $ingredientsInfo.appendChild($ingredientList);
  $ingredientsInfo.appendChild($instructionsCol);

  const $moreInfo = document.createElement('div');
  $moreInfo.className = 'col row more-info';
  $moreInfo.appendChild($ingredientsInfo);
  $moreInfo.appendChild($nutritionInfo);

  return $moreInfo;
}

function generateTableRowDOM(recipe, key) {
  const $label = document.createElement('td');
  $label.textContent = recipe.totalDaily[key].label;

  const $amount = document.createElement('td');
  $amount.textContent = Math.round(recipe.totalNutrients[key].quantity / recipe.yield) + recipe.totalNutrients[key].unit;

  const $percent = document.createElement('td');
  $percent.textContent = Math.round(recipe.totalDaily[key].quantity / recipe.yield) + '%';

  const $row = document.createElement('tr');
  $row.appendChild($label);
  $row.appendChild($amount);
  $row.appendChild($percent);

  return $row;
}

function generateDailyTableDOM(recipes) {
  const $table = document.createElement('table');
  if (recipes.length === 0) return $table;

  const $tHeader = generateDailyTableHeaderDOM();
  const $tBody = document.createElement('tbody');
  const sumNutrients = getSumNutrients(recipes);
  for (let i = 0; i < sumNutrients.length; i++) {
    $tBody.appendChild(generateDailyRowDOM(sumNutrients[i]));
    $tBody.appendChild(generateDailyMoreInfoDOM(sumNutrients[i].key));
  }
  $table.appendChild($tHeader);
  $table.appendChild($tBody);
  $dailyContainer.appendChild($table);
}

function generateDailyTableHeaderDOM() {
  const $label = document.createElement('th');
  $label.textContent = 'Nutrition';

  const $amount = document.createElement('th');
  $amount.textContent = 'Amount';

  const $percent = document.createElement('th');
  $percent.textContent = 'Percent Daily';

  const $row = document.createElement('tr');
  $row.appendChild($label);
  $row.appendChild($amount);
  $row.appendChild($percent);

  const $thead = document.createElement('thead');
  $thead.appendChild($row);

  return $thead;
}

function generateDailyRowDOM(nutrient) {
  const $label = document.createElement('td');
  $label.textContent = nutrient.label;

  const $amount = document.createElement('td');
  $amount.textContent = Math.round(nutrient.quantity) + nutrient.unit;

  const $percent = document.createElement('td');
  $percent.textContent = Math.round(nutrient.percent) + '%';

  const $row = document.createElement('tr');
  $row.className = 'daily-row';
  $row.appendChild($label);
  $row.appendChild($amount);
  $row.appendChild($percent);

  return $row;
}

function generateDailyMoreInfoDOM(key) {
  const $tableContainer = document.createElement('div');
  $tableContainer.className = 'more-info recipe-nutrition-info';
  for (let i = 0; i < data.dailyRecipes.length; i++) {
    $tableContainer.appendChild(generateMoreInfoRowDOM(key, data.dailyRecipes[i]));
  }

  const $td = document.createElement('td');
  $td.setAttribute('colspan', '3');
  $td.appendChild($tableContainer);

  const $row = document.createElement('tr');
  $row.appendChild($td);

  return $row;
}

function generateMoreInfoRowDOM(key, recipe) {
  const $label = document.createElement('div');
  $label.className = 'column-half';
  $label.textContent = recipe.label;

  const $amount = document.createElement('div');
  $amount.className = 'col-20';
  $amount.textContent = Math.round(recipe.totalNutrients[key].quantity / recipe.yield) + recipe.totalNutrients[key].unit;

  const $percent = document.createElement('div');
  $percent.className = 'col-30';
  $percent.textContent = Math.round(recipe.totalDaily[key].quantity / recipe.yield) + '%';

  const $row = document.createElement('div');
  $row.className = 'row';
  $row.appendChild($label);
  $row.appendChild($amount);
  $row.appendChild($percent);

  return $row;
}

function updatePageHeader(view) {
  if (view === 'recipe-list') {
    const $recipeCount = document.createElement('span');
    $recipeCount.textContent = data.search.count;

    const $headerText = document.createElement('h3');
    $headerText.className = 'page-header';
    $headerText.textContent = ' Recipes Found';
    $headerText.prepend($recipeCount);

    const $headerContainer = document.createElement('div');
    $headerContainer.className = 'col-90 header-container';
    $headerContainer.appendChild($headerText);

    $recipeListContainer.appendChild($headerContainer);
  } else if (view === 'favorites') {
    const $headerText = document.createElement('h3');
    $headerText.className = 'page-header';
    $headerText.textContent = 'Favorite Recipes';

    const $questionIcon = document.createElement('i');
    $questionIcon.className = 'fas fa-question-circle questionIcon';

    const $headerContainer = document.createElement('div');
    $headerContainer.className = 'col-90 header-container relative';
    $headerContainer.appendChild($headerText);
    $headerContainer.appendChild($questionIcon);

    $favoritesContainer.appendChild($headerContainer);
  } else if (view === 'daily') {
    const $headerText = document.createElement('h3');
    $headerText.className = 'page-header';
    $headerText.textContent = 'Daily Nutrition';

    const $questionIcon = document.createElement('i');
    $questionIcon.className = 'fas fa-question-circle questionIcon';

    const $headerContainer = document.createElement('div');
    $headerContainer.className = 'col-90 header-container relative';
    $headerContainer.appendChild($headerText);
    $headerContainer.appendChild($questionIcon);

    $dailyContainer.appendChild($headerContainer);
  }
}

function destroyChildren(el) {
  while (el.firstChild) el.firstChild.remove();
}

function resetSearchForm() {
  $searchForm.reset();
  const $toggleButtonList = document.querySelectorAll('.toggle-button');
  for (let i = 0; i < $toggleButtonList.length; i++) {
    if ($toggleButtonList[i].classList.contains('toggled')) $toggleButtonList[i].classList.toggle('toggled');
  }
  if ($toggleOptionsBtn.classList.contains('show-options')) {
    $toggleOptionsBtn.classList.toggle('show-options');
    $moreOptionsForm.classList.toggle('show-more-options');
  }
}

function generateRecipeList(recipes, $container) {
  if (recipes.length === 0) {
    const $noRecipes = document.createElement('h3');
    $noRecipes.innerText = 'No recipes found. \n To begin, search for recipes and add it to your list!';
    $noRecipes.className = 'no-recipes text-center';
    $container.appendChild($noRecipes);
  } else if (data.view === 'recipe-list') {
    const recipeBox = [];
    for (let i = 0; i < recipes.length; i++) {
      recipeBox.push(generateRecipeDOM(recipes[i]));
    }
    ScrollTrigger.batch(recipeBox, {
      onEnter: batch => {
        gsap.from(batch, { autoAlpha: 0, stagger: 0.2 });
      }
    });
  } else {
    destroyChildren($recipeListContainer);
    for (let i = 0; i < recipes.length; i++) {
      $container.appendChild(generateRecipeDOM(recipes[i]));
    }
    ScrollTrigger.batch('.recipe-box', {
      onEnter: batch => {
        gsap.from(batch, { autoAlpha: 0, stagger: 0.2 });
      }
    });
  }
}

function showSearching($button) {
  const $loading = document.createElement('img');
  $loading.setAttribute('src', 'images/rotate-cw.svg');
  $loading.className = 'searching';
  $button.textContent = '';
  $button.appendChild($loading);
}

function resetSearchButton() {
  $submitSearchBtn.textContent = 'Search';
}

function resetShowMoreBtn() {
  $moreRecipesBtn.textContent = 'Show More';
}

function handleContentLoad(event) {
  if (data.view === 'recipe-list') {
    updatePageHeader('recipe-list');
    generateRecipeList(data.searchRecipes, $recipeListContainer);
    checkRecipeCount();
  } else if (data.view === 'favorites') {
    destroyChildren($favoritesContainer);
    updatePageHeader(data.view);
    generateRecipeList(data.favorites, $favoritesContainer);
  } else if (data.view === 'daily') {
    destroyChildren($dailyContainer);
    updatePageHeader(data.view);
    generateDailyTableDOM(data.dailyRecipes);
    generateRecipeList(data.dailyRecipes, $dailyContainer);
  }
  switchView(data.view);
}

function clickHeart(event) {
  event.target.classList.toggle('transparent');
  const $recipeContainer = event.target.closest('.recipe-container');
  const recipeURI = $recipeContainer.getAttribute('data-uri');
  if (notInData(recipeURI, data.favorites)) {
    data.favorites.push(data.searchRecipes[findRecipeIndex(data.searchRecipes, recipeURI)]);
  } else {
    const index = findRecipeIndex(data.favorites, recipeURI);
    data.favorites.splice(index, 1);
  }
}

function clickDaily(event) {
  event.target.classList.toggle('transparent');
  const $recipeContainer = event.target.closest('.recipe-container');
  const recipeURI = $recipeContainer.getAttribute('data-uri');
  if (notInData(recipeURI, data.dailyRecipes)) {
    data.dailyRecipes.push(data.searchRecipes[findRecipeIndex(data.searchRecipes, recipeURI)]);
  } else {
    const index = findRecipeIndex(data.dailyRecipes, recipeURI);
    data.dailyRecipes.splice(index, 1);
  }
}

function notInData(uri, list) {
  return list.every(favRecipe => { return favRecipe.uri !== uri; });
}

function findRecipeIndex(recipeList, uri) {
  return recipeList.findIndex(recipe => recipe.uri === uri);
}

function clickOnRecipe(event) {
  if (event.target.classList.contains('questionIcon')) clickQuestionIcon(event);

  if (!event.target.closest('.col-65') && !event.target.closest('.col-35')) return;

  if (event.target.tagName === 'IMG' && event.target.classList.contains('unfavorite-icon')) {
    event.preventDefault();
    clickHeart(event);
    return;
  }
  if (event.target.tagName === 'IMG' && event.target.classList.contains('daily-icon')) {
    event.preventDefault();
    clickDaily(event);
    return;
  }

  const $recipeContainer = event.target.closest('.recipe-container');
  const moreInfoBox = $recipeContainer.querySelector('.more-info');
  expandElement(moreInfoBox, 'open');
}

function clickOnNutrition(event) {
  if (!event.target.closest('.daily-row')) return;

  const $nutritionRow = event.target.closest('.daily-row');
  const $moreInfoRow = $nutritionRow.nextElementSibling;
  const $moreInfoContainer = $moreInfoRow.querySelector('.more-info');
  expandElement($moreInfoContainer, 'open');
}

function expandElement(elem, toggleClass) {
  elem.style.height = '';
  elem.style.transition = 'none';
  const startHeight = window.getComputedStyle(elem).height;

  elem.classList.toggle(toggleClass);
  const height = window.getComputedStyle(elem).height;

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

function showMoreRecipes(event) {
  showSearching($moreRecipesBtn);
  const moreRecipesURL = data.search._links.next.href;
  makeQuery(moreRecipesURL);
}

function getSumNutrients(recipeList) {
  const allNutrients = [];
  for (const key in recipeList[0].totalDaily) {
    const sumNutrients = {
      label: recipeList[0].totalNutrients[key].label,
      quantity: 0,
      unit: recipeList[0].totalNutrients[key].unit,
      percent: 0,
      key: key
    };
    for (let i = 0; i < recipeList.length; i++) {
      sumNutrients.quantity += (recipeList[i].totalNutrients[key].quantity / recipeList[i].yield);
      sumNutrients.percent += (recipeList[i].totalDaily[key].quantity / recipeList[i].yield);
    }
    allNutrients.push(sumNutrients);
  }
  return allNutrients;
}

function toggleModal(event) {
  if ($modal.classList.contains('open')) {
    gsap.to('.modal', { y: 30, ease: 'circ.out', duration: 0.5, autoAlpha: 0 });
    gsap.to('.modal-overlay', { ease: 'circ.out', duration: 0.5, autoAlpha: 0 });
    $modal.classList.toggle('open');
  } else {
    gsap.to('.modal', { y: -30, ease: 'circ.out', duration: 0.5, autoAlpha: 1 });
    gsap.to('.modal-overlay', { ease: 'circ.out', duration: 0.5, autoAlpha: 1 });
    $modal.classList.toggle('open');
  }
}

function clickQuestionIcon(event) {
  const $modalText = document.querySelector('.modal-text');
  destroyChildren($modalText);
  const $modalHeader = document.createElement('h2');
  const $instructions = document.createElement('h4');
  if (data.view === 'favorites') {
    $modalHeader.textContent = 'Favorite Recipes';
    $instructions.textContent = 'This page will display a list of your favorite recipes. To add recipes to this list, search for recipes and click on the heart icons.';
  } else if (data.view === 'daily') {
    $modalHeader.textContent = 'Daily Nutrition';
    $instructions.textContent = 'This page will display a table of the daily recipe\'s total daily nutritional intake. To add recipes to this list, search for recipes and click on the calendar icons.';
  }
  const $headerCol = document.createElement('div');
  $headerCol.className = 'col';
  $headerCol.appendChild($modalHeader);

  const $instructionsCol = document.createElement('div');
  $instructionsCol.className = 'col';
  $instructionsCol.appendChild($instructions);

  $modalText.appendChild($headerCol);
  $modalText.appendChild($instructionsCol);
  toggleModal();
}
