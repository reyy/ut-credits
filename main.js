var username = "";
var password = "";

var Browser = require("zombie");
var url = "https://myaces.nus.edu.sg/Prjhml/login.do";
var browser = new Browser();


    browser.open();
    browser.visit(url, function(err) {
        console.log(browser.success);
        browser
        .fill('input[name="txtUserID"]', username)
        .fill('input[name="txtPwd"]', password)
        .pressButton('input[value="Login"]', function(res) {
            console.log(browser.html("body"));
        });
    });


