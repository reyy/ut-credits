const selectors = {
    loginValidator : 'body > form > table > tbody > tr:nth-child(2) > td:nth-child(1) > fieldset > table > tbody > tr > td:nth-child(2) > a',
    name : 'body > form > table > tbody > tr:nth-child(1) > td > table:nth-child(1) > tbody > tr:nth-child(1) > td:nth-child(2)',
    matric : 'body > form > table > tbody > tr:nth-child(1) > td > table:nth-child(1) > tbody > tr:nth-child(2) > td:nth-child(2)',
    breakfast : {
        consumed : 'body > form > table > tbody > tr:nth-child(1) > td > table:nth-child(4) > tbody > tr:nth-child(2) > td:nth-child(3)',
        forfeited: 'body > form > table > tbody > tr:nth-child(1) > td > table:nth-child(4) > tbody > tr:nth-child(2) > td:nth-child(4)',
        carryforward : 'body > form > table > tbody > tr:nth-child(1) > td > table:nth-child(4) > tbody > tr:nth-child(2) > td:nth-child(5)',
        remaining : 'body > form > table > tbody > tr:nth-child(1) > td > table:nth-child(4) > tbody > tr:nth-child(2) > td:nth-child(6)'
    },
    dinner : {
        consumed : 'body > form > table > tbody > tr:nth-child(1) > td > table:nth-child(4) > tbody > tr:nth-child(3) > td:nth-child(3)',
        forfeited: 'body > form > table > tbody > tr:nth-child(1) > td > table:nth-child(4) > tbody > tr:nth-child(3) > td:nth-child(4)',
        carryforward : 'body > form > table > tbody > tr:nth-child(1) > td > table:nth-child(4) > tbody > tr:nth-child(3) > td:nth-child(5)',
        remaining : 'body > form > table > tbody > tr:nth-child(1) > td > table:nth-child(4) > tbody > tr:nth-child(3) > td:nth-child(6)'
    },
    download: 'body > form > table > tbody > tr:nth-child(6) > td > table > tbody > tr > td > div > a'
};

var system = require('system');
var env = system.env;

//define ip and port to web service
var ip_server = env.OPENSHIFT_DIY_IP || '127.0.0.1';
var ip_port = env.OPENSHIFT_DIY_PORT || '8585';

//includes web server modules
var server = require('webserver').create();

//start web server
var service = server.listen(ip_server+':'+ip_port, function(request, response) {

    if(request.method != "POST" || !(request.post.username && request.post.password)) {
        response.statusCode = 400;
        response.write("Error 400 : Bad Request");
        response.close();
        return;
    } 

    var casper = require('casper').create();
    casper.start('https://myaces.nus.edu.sg/Prjhml/', function() {
        this.fill('form[name=loginForm]', {
            'txtUserID':    request.post.username,
            'txtPwd':       request.post.password
        }, true);
    });

    casper.then(function(){
        if(!casper.exists(selectors.loginValidator)){
            response.statusCode = 401;
            response.write("Error 401 Unauthorized");
            response.close();
            casper.thenBypass(2);
        }
    });

    var ans = {};
    casper.thenOpen('https://myaces.nus.edu.sg/Prjhml/studstaffMealBalance.do', function() {
        ans = {
            'Status' : 'OK',
            'Name' : (this.getElementsInfo(selectors.name))[0].text,
            'Matric' : this.getElementsInfo(selectors.matric)[0].text,
            'Breakfast' : {
                'Consumed' : this.getElementsInfo(selectors.breakfast.consumed)[0].text,
                'Forfeited' : this.getElementsInfo(selectors.breakfast.forfeited)[0].text,
                'CarriedForward' : this.getElementsInfo(selectors.breakfast.carryforward)[0].text,
                'Remaining' : this.getElementsInfo(selectors.breakfast.remaining)[0].text
            },
            'Dinner' : {
                'Consumed' : this.getElementsInfo(selectors.dinner.consumed)[0].text,
                'Forfeited' : this.getElementsInfo(selectors.dinner.forfeited)[0].text,
                'CarriedForward' : this.getElementsInfo(selectors.dinner.carryforward)[0].text,
                'Remaining' : this.getElementsInfo(selectors.dinner.remaining)[0].text
            }
        };
        ans['Breakfast']['Logs'] = new Array();
        ans['Dinner']['Logs'] = new Array();
        response.statusCode = 200;
        response.write(JSON.stringify(ans, null, null));
        response.close();
    });

    //
    casper.run(function() {
        casper.clear();
        phantom.clearCookies();
        ans = {};           
    });

});
console.log('Server running at http://' + ip_server+':'+ip_port+'/');