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

//////////////////// //////////////////// ////////////////////
////////////////// ready to function  ////////////////////
/////////////////// //////////////////// ///////////////////

$(document).ready(function() {

  //////////////////// //////////////////// ////////////////////
  ////////////////// scroll function  ////////////////////
  /////////////////// //////////////////// ///////////////////
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

  //////////////////// //////////////////// ////////////////////
  ////////////////// Search functionality  ////////////////////
  /////////////////// //////////////////// ////////////////////

  $('#search-form').submit(function(event) {
    event.preventDefault(); // Prevent form from submitting

    var searchQuery = $('.search-input').val().toLowerCase(); // Get search query

    if (searchQuery === '') {
      location.reload(); // Reload the page if search query is empty
    }

    $('.highlighted').removeClass('highlighted'); // Remove previous highlights

    $('.card').hide(); // Hide all cards

    $('.card').each(function() {
      var cardTitle = $(this).find('.card-title h2').text().toLowerCase(); // Get card title

      if (cardTitle.indexOf(searchQuery) >= 0) { // Check if search query is found in card title
        $(this).show(); // Show card if search query is found in title
        $(this).find('.card-title h2').html(function(_, html) {
          return html.replace(new RegExp(searchQuery, "gi"), '<span class="highlighted">$&</span>'); // Highlight search query in card title
        });
      } else {
        var cardContent = $(this).find('.card-content').text().toLowerCase(); // Get card content

        if (cardContent.indexOf(searchQuery) >= 0) { // Check if search query is found in card content
          $(this).show(); // Show card if search query is found in content
          $(this).find('.card-content').html(function(_, html) {
            return html.replace(new RegExp(searchQuery, "gi"), '<span class="highlighted">$&</span>'); // Highlight search query in card content
          });
        }
      }
    });

    $('#search-form input[type="search"]').val('');  // Clear search input
  });

  //////////////////// //////////////////// ////////////////////
  ////////////////// To-Do list  ////////////////////
  /////////////////// //////////////////// ////////////////////

  // Load any existing items from local storage
  var items = JSON.parse(localStorage.getItem("todoList")) || [];
  for (var i = 0; i < items.length; i++) {
    addItem(items[i].value, items[i].completed, items[i].date);
  }

  // Add new item to list when form is submitted
  $("form").submit(function (e) {
    e.preventDefault();
    var newItem = $("#new-item").val().trim();
    if (newItem !== "") {
      addItem(newItem, false, getCurrentDate());
      // Save updated list to local storage
      saveList();
      $("#new-item").val("");
    }
  });

  // Cross out item when checkbox is clicked
  $(document).on("click", "input[type=checkbox]", function () {
    var checkbox = $(this);
    var listItem = checkbox.closest("li");
    listItem.toggleClass("completed");
    // Save updated list to local storage
    saveList();
  });

  // Delete item when delete button is clicked
  $(document).on("click", ".delete-button", function () {
    var listItem = $(this).closest("li");
    listItem.remove();
    // Save updated list t  o local storage
    saveList();
  });

  // ... (the rest of the code remains the same)

  // Toggle priority menu when task is clicked
  $(document).on("click", ".todo-item", function (event) {
    if (!$(event.target).is("input[type=checkbox]") && !$(event.target).is(".delete-button")) {
      var listItem = $(this);
      var priorityMenu = listItem.find(".priority-menu");
      $(".priority-menu").not(priorityMenu).hide();
      priorityMenu.toggle();
      fillPriorityOptions(priorityMenu);
    }
  });

  // Close priority menu when clicking outside the task item
  $(document).on("click", function (event) {
    if (!$(event.target).closest(".todo-item").length) {
      $(".priority-menu").hide();
    }
  });

  // Update priority when a priority option is clicked
  $(document).on("click", ".priority-option", function () {
    var option = $(this);
    var listItem = option.closest("li");
    var priority = option.data("priority");
    var currentPriority = $("#todo-list li").index(listItem) + 1;

    if (priority === currentPriority) {
      $(".priority-menu").hide();
      return;
    }

    listItem.remove();
    if (priority === 1) {
      $("#todo-list").prepend(listItem);
    } else if (priority > currentPriority) {
      $("#todo-list li:nth-child(" + (priority - 1) + ")").after(listItem);
    } else {
      $("#todo-list li:nth-child(" + (priority) + ")").before(listItem);
    }

    $(".priority-menu").hide();
    // save
    saveList();
  });


  //////////////////// //////////////////// ////////////////////
  ////////////////// input     ////////////////////
  /////////////////// //////////////////// ////////////////////

  // Load existing items from local storage
  var ideas = JSON.parse(localStorage.getItem("ideas")) || [];
  for (var i = 0; i < ideas.length; i++) {
    addIdea(ideas[i]);
  }

  // Add new idea to the list when the form is submitted
  $("#ideas-form").submit(function(e) {
    e.preventDefault();
    var newIdea = $("#new-idea").val().trim();
    if (newIdea !== "") {
      addIdea(newIdea);
      // Save updated list to local storage
      saveIdeas();
      $("#new-idea").val("");
    }
  });

  // Make ideas sortable
  $("#ideas-container").sortable({
    update: function(event, ui) {
      // Save updated list to local storage
      saveIdeas();
    }
  });

  // Toggle edit mode when double-clicked
  $("#ideas-container").on("dblclick", ".idea-text", function() {
    $(this).attr("contenteditable", "true").focus();
    $(this).siblings(".delete-button").show();
  });

  // Hide delete button and save changes when focus is lost
  $("#ideas-container").on("blur", ".idea-text", function() {
    $(this).attr("contenteditable", "false");
    $(this).siblings(".delete-button").hide();
    saveIdeas(); // Save updated list to local storage
  });

  // Remove a text item when the delete button is clicked
  $(document).on("click", ".delete-button", function() {
    $(this).closest(".idea-item").remove();
    saveIdeas(); // Save updated list to local storage
  });


  //end
});







// to-do list function
// Add a new function to update the task sizes based on their priority
function updateTaskSizes() {
  var listItems = $("#todo-list li");
  var totalItems = listItems.length;

  listItems.each(function (index) {
    var listItem = $(this);
    var taskContent = listItem.find(".task-content");
    var priority = index + 1;
    var fontSize = 5 - (index * 1);
    var padding = 20 - (index * 5);

    if (fontSize < 0.8) {
      fontSize = 0.8;
    }
    if (padding < 10) {
      padding = 10;
    }

    taskContent.css({
      "font-size": fontSize + "rem",
      "padding": padding + "px"
    });
  });
}

function addItem(text, completed, date) {
  var checkbox = $("<input>").attr({
    type: "checkbox",
    class: "checkbox",
    checked: completed,
  });
  var deleteButton = $("<button>")
    .attr({
      type: "button",
      class: "delete-button",
    })
    .html("<i class='material-icons'>delete</i>");
  var textSpan = $("<span>").addClass("todo-text").text(text);
  var dateSpan = $("<span>").addClass("date").text(date);
  // new
  var taskContent = $("<div>").addClass("task-content").append(textSpan, dateSpan);

  var priorityMenu = $("<div>").addClass("priority-menu").hide();
  // var listItem = $("<li>")
  //   .addClass("todo-item")
  //   .append(checkbox, textSpan, dateSpan, deleteButton, priorityMenu);
  var listItem = $("<li>").addClass("todo-item").append(checkbox, taskContent, deleteButton);

  if (completed) {
    listItem.addClass("completed");
  }
  listItem.append(priorityMenu)
  $("#todo-list").append(listItem);
  fillPriorityOptions(priorityMenu);
  // new
  updateTaskSizes();
}

function saveList() {
  var items = [];
  $("#todo-list li").each(function () {
    var listItem = $(this);
    var checkbox = listItem.find(".checkbox");
    items.push({
      value: listItem.find("span:first-of-type").text(),
      completed: checkbox.is(":checked"),
      date: listItem.find(".date").text(),
    });
  });
  localStorage.setItem("todoList", JSON.stringify(items));
  updateTaskSizes();
}


function getCurrentDate() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
  var yyyy = today.getFullYear();
  today = mm + "/" + dd + "/" + yyyy;
  return today;
}

// ... (the rest of the code remains the same)
function fillPriorityOptions(priorityMenu) {
  priorityMenu.empty();
  var siblingsCount = $("#todo-list li").length;
  for (var i = 1; i <= siblingsCount; i++) {
    var priorityOption = $("<div>")
      .addClass("priority-option")
      .text("Priority #" + i)
      .data("priority", i);
    priorityMenu.append(priorityOption);
  }
}


// input text function

function addIdea(text) {
  var deleteButton = $("<span>").addClass("delete-button").text("x").hide();
  var ideaText = $("<p>").addClass("idea-text").text(text).attr("contenteditable", "false");
  var ideaItem = $("<div>").addClass("idea-item").append(ideaText, deleteButton);
  $("#ideas-container").append(ideaItem);
}

function saveIdeas() {
  var ideas = [];
  $("#ideas-container .idea-text").each(function() {
    ideas.push($(this).text());
  });
  localStorage.setItem("ideas", JSON.stringify(ideas));
}