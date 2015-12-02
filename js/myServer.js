var http = require('http');
var getIp = require('./getIp');
var url = require('url');

var ip = getIp();
var port = 31337;

var toBeResponded = [];
var history = [];

var server = http.createServer(function(request, response) {

    if (request.method == 'GET') {
        getHandler(request, response);
        return;
    }
});

function getHandler(request, response) {
    var token = getToken(request.url);
    console.log('GET: url: ' + request.url + ', token: ' + token + ", history.length: " + history.length);

    if (token > history.length) {
        responseWith(response, 401, token, null);
        return;
    }

    if (token < history.length) {
        var messages = history.slice(token, history.length);
        responseWith(response, 200, history.length, messages);
        return;
    }

    toBeResponded.push({
        response: response,
        token: token
    });
}

function responseWith(response, statusCode, token, messages) {
    response.writeHeader(statusCode, {
        'Access-Control-Allow-Origin': '*'
    });
    if (messages != null) {
        //outputMessages(messages);
        response.write(JSON.stringify({
            token: token,
            messages: messages
        }));
    }
    response.end();
}

function outputMessages (msgs) {
    msgs.forEach(function  (msg) {
        console.log(msg.text);
    })
}

function getToken(u) {
    var parts = url.parse(u, true);
    return parts.query.token;
}

function getTime() {
    var date = new Date();
    var hour = date.getHours();
    var min  = date.getMinutes();
    var sec  = date.getSeconds();
    var msec  = date.getMilliseconds();
    hour = (hour < 10 ? "0" : "") + hour;
    min = (min < 10 ? "0" : "") + min;
    sec = (sec < 10 ? "0" : "") + sec;
    msec = (msec < 100 ? "0" : "") + msec;

    return hour + ":" + min + ":" + sec + ":" + msec;
}

function makeMessage() {
    var text = "";
    var possible = "  abcdefghijklmnopqrstuvwxyz";
    var msgLength = Math.floor(Math.random() * 50)+1;
    for (var i = 0; i < msgLength; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

function addMessage(userId, interval) {
    history.push({
        text: makeMessage(),
        user: userId,
        time: getTime(),
        interval: interval
    });
    console.log(history.length + " pushed ");
}

function simulateUser(userId) {
    
    toBeResponded.forEach(function(waiter) {
        responseWith(waiter.response, 200, history.length, history.slice(waiter.token, history.length));
    });
    toBeResponded = [];
    
    var interval = Math.floor(Math.random() * 20000);
    setTimeout(function() {
        addMessage(userId, interval);
        simulateUser(userId);
    }, interval);
}

server.listen(port, ip);
console.log('Server running at http://' + ip + ':' + port);

simulateUser("Katya");
simulateUser("Alex");
simulateUser("Masha");
