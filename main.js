var express = require('express');
var Browser = require("zombie");
var app = express();


app.get('/', function (req, res) {
    var url = "https://myaces.nus.edu.sg/Prjhml/login.do";
    var browser = new Browser();
    var username = "hi";
    var password = "hi";

    browser.open();
    browser.visit(url, function(err) {
        //console.log(browser.success);
        browser
        .fill('input[name="txtUserID"]', username)
        .fill('input[name="txtPwd"]', password)
        .pressButton('input[value="Login"]', function(response) {
            //console.log(browser.html("body"));
            var ans = browser.html("body");
            res.send(ans);
        });
    });

});

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});




    


