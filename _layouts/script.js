TweenLite.defaultEase = Linear.easeNone;

var header     = document.querySelector("#app-header");
var bgBack     = document.querySelector("#background-back");
var bgFront    = document.querySelector("#background-front");
var toolbar    = document.querySelector("#small-toolbar");
var largeTitle = document.querySelector("#large-title");
var smallTitle = document.querySelector("#small-title");

var deltaHeight = header.offsetHeight - toolbar.offsetHeight;

var rect1 = smallTitle.getBoundingClientRect();
var rect2 = largeTitle.getBoundingClientRect();

var scale = rect1.height / rect2.height;
var x = rect1.left - rect2.left;
var y = rect1.top  - rect2.top;

var headerAnimation = new TimelineLite({ paused: true })
  .to(largeTitle, 1, { scale: scale, x: x, y: deltaHeight + y }, 0)
  .to(header,  1, { y: -deltaHeight }, 0)
  .to(toolbar, 1, { y: deltaHeight }, 0)
  .to(bgBack,  1, { y: deltaHeight / 2 }, 0)
  .to(bgFront, 1, { y: deltaHeight / 2 }, 0)
  .to(bgBack,  1, { alpha: 1 }, 0)
  .to(bgFront, 1, { alpha: 0 }, 0)
  .set(smallTitle, { alpha: 1 }, 1)
  .set(largeTitle, { alpha: 0 }, 1);

var shadowAnimation = TweenLite.to(header, 0.4, {
  boxShadow: "0 2px 5px rgba(0,0,0,0.6)",
  ease: Power1.easeOut
}).reverse();

var progress  = 0;
var requestId = null;
var reversed  = true;

cloneCards(0);
update();
window.addEventListener("scroll", requestUpdate);

function requestUpdate() {
  if (!requestId) {
    requestId = requestAnimationFrame(update);
  }
}

function update() {

  var scroll = window.pageYOffset;

  if (scroll < deltaHeight) {
    progress = scroll < 0 ? 0 : scroll / deltaHeight;
    reversed = true;
  } else {
    progress = 1;
    reversed = false;
  }

  headerAnimation.progress(progress);
  shadowAnimation.reversed(reversed);

  requestId = null;
}

function cloneCards(count) {

  var main = document.querySelector("main");
  var card = document.querySelector(".card");

  for (var i = 0; i < count; i++) {
    main.appendChild(card.cloneNode(true));
  }
}

$(document).ready(function() {

  $(window).scroll(function() {
    var scroll = $(window).scrollTop();
    var windowHeight = $(window).height();
    var height = windowHeight - scroll;

    if (height < 200) {
      $('#background-front').css({
        'opacity': '0'
      });
      $('#background-back').css({
        'opacity': '1'
      });
    } else {
      $('#background-front').css({
        'opacity': '1'
      });
      $('#background-back').css({
        'opacity': '0'
      });
    }

    $('.large-title').css({
      'transform': 'translate3d(0px, ' + (scroll / 3) + 'px, 0px)',
      'opacity': 1 - (scroll / 250)
    });

    $('.small-title').css({
      'opacity': scroll / 100 - 0.5
    });
  });

  // Define the search form element
  const searchForm = document.getElementById('search-form');

  // Add an event listener to the search form element
  searchForm.addEventListener('submit', event => {
    // Prevent the form from submitting and refreshing the page
    event.preventDefault();

    // Get the search value
    const searchTerm = searchForm.q.value.toLowerCase();

    // Get all the cards
    const cards = document.querySelectorAll('.card');

    // Loop through each card and check if it contains the search term
    cards.forEach(card => {
      const cardTitle = card.querySelector('.card-title').textContent.toLowerCase();
      const cardContent = card.querySelector('p').textContent.toLowerCase();

      if (cardTitle.includes(searchTerm) || cardContent.includes(searchTerm)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
});


});