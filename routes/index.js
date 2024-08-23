var express = require('express');
var router = express.Router();
var path = require("path")

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, "../views/index.html"));
});

router.get('/settings', function(req, res, next) {
  res.sendFile(path.join(__dirname, "../views/settings.html"));
});

router.get('/dashboard', function(req, res, next) {
  res.sendFile(path.join(__dirname, "../views/dashboard.html"))
});

router.get('/dashboard_premium', function(req, res, next) {
  res.sendFile(path.join(__dirname, "../views/dashboard_premium.html"))
});

router.get('/chart', function(req, res, next) {
  res.sendFile(path.join(__dirname, "../views/chart.html"))
});

module.exports = router;