var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = process.env.PORT || 8080;

var app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// ROUTES

app.get("/scrape", function(req, res) {
    
    axios.get("http://www.avclub.com/").then(function(response) {
      
        var $ = cheerio.load(response.data);

        $("article").each(function(i, element) {
            
            var result = {};

            result.image =   $(this).children(".sc-1mg39mc-3").children("img").attr("src");
            result.title =   $(this).children(".sc-1mg39mc-4").children("h1").text();
            result.summary = $(this).children(".sc-1mg39mc-2").children("p").text();
            result.link =    $(this).children(".sc-1mg39mc-4").children("a").attr("href");
    
            // Create a new Article
            db.Article.create(result)
            .then(function(dbArticle) {
                console.log(dbArticle);
            })
            .catch(function(err) {
                console.log(err);
            });
        });

        res.send("Scrape Complete");
    });
});
  
  // Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});