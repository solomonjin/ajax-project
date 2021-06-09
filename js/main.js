var $openNavBtn = document.querySelector('.open-nav');
var $toggleNavMenu = document.querySelector('.nav-toggle');
var $closeNavBtn = document.querySelector('.close-nav');
var $searchForm = document.querySelector('.search-form');
var $toggleOptionsBtn = document.querySelector('.toggle-options');
var $moreOptionsForm = document.querySelector('.options');
var $searchIcon = document.querySelector('.search-icon');
var $viewContainer = document.querySelectorAll('.views');
var $navList = document.querySelector('.nav-list');
var $searchButton = document.querySelector('.search-button');

$openNavBtn.addEventListener('click', openNavMenu);
$closeNavBtn.addEventListener('click', closeNavMenu);
$searchForm.addEventListener('click', toggleButton);
$toggleOptionsBtn.addEventListener('click', toggleOptions);
$searchIcon.addEventListener('click', showSearchForm);
$navList.addEventListener('click', clickNavList);
$searchButton.addEventListener('click', showSearchForm);

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
  $moreOptionsForm.classList.toggle('show-more-options');
  $moreOptionsForm.classList.toggle('hidden');
  if (event.target.textContent === 'More Options') event.target.textContent = 'Less Options';
  else event.target.textContent = 'More Options';
}

function showSearchForm(event) {
  switchView(event.target.getAttribute('data-view'));
}

function switchView(view) {
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
