const selectors = {
    loginValidator : 'body > form > table > tbody > tr:nth-child(2) > td:nth-child(1) > fieldset > table > tbody > tr > td:nth-child(2) > a',
    name : 'body > form:nth-child(3) > table > tbody > tr:nth-child(1) > td > table:nth-child(1) > tbody > tr:nth-child(1) > td:nth-child(2)',
    matric : 'body > form:nth-child(3) > table > tbody > tr:nth-child(1) > td > table:nth-child(1) > tbody > tr:nth-child(2) > td:nth-child(2)',
    breakfast : {
        consumed : 'body > form:nth-child(3) > table > tbody > tr:nth-child(1) > td > table:nth-child(4) > tbody > tr:nth-child(2) > td:nth-child(3)',
        forfeited: 'body > form:nth-child(3) > table > tbody > tr:nth-child(1) > td > table:nth-child(4) > tbody > tr:nth-child(2) > td:nth-child(4)',
        carryforward : 'body > form:nth-child(3) > table > tbody > tr:nth-child(1) > td > table:nth-child(4) > tbody > tr:nth-child(2) > td:nth-child(5)',
        remaining : 'body > form:nth-child(3) > table > tbody > tr:nth-child(1) > td > table:nth-child(4) > tbody > tr:nth-child(2) > td:nth-child(6)'
    },
    dinner : {
        consumed : 'body > form:nth-child(3) > table > tbody > tr:nth-child(1) > td > table:nth-child(4) > tbody > tr:nth-child(3) > td:nth-child(3)',
        forfeited: 'body > form:nth-child(3) > table > tbody > tr:nth-child(1) > td > table:nth-child(4) > tbody > tr:nth-child(3) > td:nth-child(4)',
        carryforward : 'body > form:nth-child(3) > table > tbody > tr:nth-child(1) > td > table:nth-child(4) > tbody > tr:nth-child(3) > td:nth-child(5)',
        remaining : 'body > form:nth-child(3) > table > tbody > tr:nth-child(1) > td > table:nth-child(4) > tbody > tr:nth-child(3) > td:nth-child(6)'
    },
    download: 'body > form:nth-child(3) > table > tbody > tr:nth-child(6) > td > table > tbody > tr > td > div > a'
};

var express = require('express');
var Browser = require("zombie");
var bodyParser = require('body-parser');
var xls = require ('xlsjs');
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
            try {
                browser.assert.text(selectors.loginValidator, 'My Meal Balance');
                browser.visit("https://myaces.nus.edu.sg/Prjhml/studstaffMealBalance.do", function(done) {
                    //res.send(browser.html("body"));
                    var ans = {
                        'Status' : 'OK',
                        'Name' : browser.text(selectors.name),
                        'Matric' : browser.text(selectors.matric),
                        'Breakfast' : {
                            'Consumed' : browser.text(selectors.breakfast.consumed),
                            'Forfeited' : browser.text(selectors.breakfast.forfeited),
                            'CarriedForward' : browser.text(selectors.breakfast.carryforward),
                            'Remaining' : browser.text(selectors.breakfast.remaining)
                        },
                        'Dinner' : {
                            'Consumed' : browser.text(selectors.dinner.consumed),
                            'Forfeited' : browser.text(selectors.dinner.forfeited),
                            'CarriedForward' : browser.text(selectors.dinner.carryforward),
                            'Remaining' : browser.text(selectors.dinner.remaining)
                        }
                    };
                    ans['Breakfast']['Logs'] = new Array();
                    ans['Dinner']['Logs'] = new Array();
                    //Todo : Error checks!
                    //var logCount = 0; var expectedCount = browser.text(selectors.breakfast.consumed) + browser.text(selectors.dinner.consumed);
                    
                    browser.clickLink(selectors.download, function(e) {
                        var workbook = xls.read(browser.resources[0].response.body, {type: 'binary'});
                        var sheetJson = xls.utils.sheet_to_json(workbook.Sheets['-']);
                        
                        for(var i=0; i<sheetJson.length; i++) 
                            (ans[sheetJson[i]['Meal Category']]['Logs']).push(sheetJson[i]['Meal Consumed Date and Time']);
                           
                        res.send(ans);
                    });

                });
            } catch(e) {
                res.send("{'Status': 'Error', 'Message': 'Invalid Credentials for " + username +"'}");
                return;
            }
        });
    });

});

var server = app.listen(process.env.PORT || 5000, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
});