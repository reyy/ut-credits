var express = require('express');
var Browser = require("zombie");
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Disallow all GET requests
app.get('/', function (req, res) {
    return res.sendStatus(400);
});

app.post('/', function (req, res) {
    if (!req.body || !req.body.username || !req.body.password) 
        return res.sendStatus(400);

    var url = "https://myaces.nus.edu.sg/Prjhml/login.do";
    var browser = new Browser();
    var username = req.body.username;
    var password = req.body.password;

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

var server = app.listen(process.env.PORT || 5000, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
});

