
//define ip and port to web service
var ip_server =/* process.env.OPENSHIFT_NODEJS_IP || */'127.0.0.1';
var ip_port = /*process.env.OPENSHIFT_NODEJS_PORT || */'8585';

//includes web server modules
var server = require('webserver').create();

//start web server
var service = server.listen(ip_server+':'+ip_port, function(request, response) {

    var links = [];
    var casper = require('casper').create();

    casper.start('http://casperjs.org/', function() {
    this.echo(this.getTitle());
});

casper.thenOpen('http://phantomjs.org', function() {
    this.echo(this.getTitle());
});

    //
    casper.run(function() {
            response.statusCode = 200;
            //sends results as JSON object
            response.write(JSON.stringify(links, null, null));
            response.close();              
    });

});
console.log('Server running at http://' + ip_server+':'+ip_port+'/');