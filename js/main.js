var $openNavBtn = document.querySelector('.open-nav');
var $toggleNavMenu = document.querySelector('.nav-toggle');
var $closeNavBtn = document.querySelector('.close-nav');

$openNavBtn.addEventListener('click', openNavMenu);
$closeNavBtn.addEventListener('click', closeNavMenu);

function openNavMenu(event) {
  $toggleNavMenu.classList.add('show-menu');
}

function closeNavMenu(event) {
  $toggleNavMenu.classList.remove('show-menu');
}
