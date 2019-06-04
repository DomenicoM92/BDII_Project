var express = require('express');
var app = express();
var path = require('path');
const MongoClient = require('mongodb').MongoClient;
const urlDB = 'mongodb://localhost:27017/';
var compression = require('compression');
var handleDataset = require("./src/handleDataset");

//Serving static files such as Images, CSS, JavaScript
app.use(express.static("public"));

//Using gzip compression on responses to improve performances
app.use(compression());

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + "/public/index.html"));
});

app.get('/datasetQuery1', function (req, res) {
  var groupByRegion = handleDataset.groupGenderByRegion(MongoClient, urlDB);
  groupByRegion.then(function (results) {
    res.send(results);
  })
});
app.get('/datasetQuery2', function (req, res) {
  var groupTitleByRegion = handleDataset.groupTitlesByRegion(MongoClient, urlDB);
  groupTitleByRegion.then(function (results) {
    res.send(results);
  })
});
app.get('/datasetQuery3', function (req, res) {
  var groupTitleByRegion = handleDataset.groupParByRegion(MongoClient, urlDB);
  groupTitleByRegion.then(function (results) {
    res.send(results);
  })
});
app.get('/datasetQuery4', function (req, res) {
  var groupTitleByRegion = handleDataset.groupParByAvarageAge(MongoClient, urlDB);
  groupTitleByRegion.then(function (results) {
    res.send(results);
  })
});
app.listen(8080, function () {
  console.log('App listening on port 8080!');
  handleDataset.datasetHandler(MongoClient, urlDB);
});
