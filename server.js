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

    axios.get("http://old.reddit.com/").then(function(response) {

        var $ = cheerio.load(response.data);

        $("div.thing").each(function(i, element) {
            
            var result = {};
            // result.image =   var srcset = $(this).children(".sc-1mg39mc-3").find("img").attr("srcSet");
            // result.title =   $(this).children(".sc-1mg39mc-4").find("h1").text();
            // result.summary = $(this).children(".sc-1mg39mc-2").find("p").text();
            // result.link =    $(this).children(".sc-1mg39mc-4").children("a").attr("href");

            result.image =   $(this).children("a").find("img").attr("src");
            result.title =   $(this).children("div.entry").find("a.title").text();
            result.summary = $(this).children("div.entry").find("p.tagline").text();
            result.link =    $(this).children("a").attr("href");

            if (!result.image) {
                result.image = "https://cdn4.iconfinder.com/data/icons/social-messaging-ui-color-shapes-2-free/128/social-reddit-square2-512.png";
            }
    
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

app.get("/articles", function(req, res) {
    db.Article.find({})
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});

app.get("/articles/:id", function(req, res) {
    db.Article.findOne({_id: req.params.id})
      .populate("comment")
      .then(function(dbArticle){
        res.json(dbArticle)
      })
      .catch(function(err){
        res.json(err)
      })
  });

app.post("/articles/:id", function(req, res) {
    db.Comment.create(req.body)
    .then(function(dbComment) {
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { comment: dbComment._id }, { new: true });
    })
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});
  
  // Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});