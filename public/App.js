$.getJSON("/articles", function(data) {
    
    for (var i = 0; i < data.length; i++) {
      $('.article-container').append("<div data-id=" + data[i]._id + " class='card flex-row flex-wrap'><div class='card-header border-0'><img class='card-img' src=" + data[i].image + "></div><div class='card-block px-2'><h3 class='card-title'><a class='article-link' target='_blank' rel='noopener noreferrer' href='" + data[i].link + "'>" + data[i].title + "</a></h3><div class='card-body'>" + data[i].summary + "</div></div><div class='w-100'></div></div>");
    }
});

$(document).on("click", "p", function() {
    $("#comments").empty();
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");

    // Now make an ajax call for the Article
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
    .then(function(data) {
        console.log(data);
        $("#comments").append("<h2>" + data.title + "</h2>");
        // An input to enter a new title
        $("#comments").append("<input id='titleinput' name='title' >");
        // A textarea to add a new note body
        $("#comments").append("<textarea id='bodyinput' name='body'></textarea>");
        // A button to submit a new note, with the id of the article saved to it
        $("#comments").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

        // If there's a note in the article
        if (data.comment) {
            // Place the title of the note in the title input
            $("#titleinput").val(data.comment.title);
            // Place the body of the note in the body textarea
            $("#bodyinput").val(data.comment.body);
        }
    });
});

// When you click the savenote button
$(document).on("click", "#savecomment", function() {
// Grab the id associated with the article from the submit button
var thisId = $(this).attr("data-id");

// Run a POST request to change the note, using what's entered in the inputs
$.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
    // Value taken from title input
    title: $("#titleinput").val(),
    // Value taken from note textarea
    body: $("#bodyinput").val()
    }
})
    // With that done
    .then(function(data) {
    // Log the response
    console.log(data);
    // Empty the notes section
    $("#comments").empty();
    });

// Also, remove the values entered in the input and textarea for note entry
$("#titleinput").val("");
$("#bodyinput").val("");
});