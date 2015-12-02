var ip = 'http://192.168.0.102';
var port = '31337';

var appState = {
    mainUrl: ip + ':' + port,
    token: 0
};

function run() {
    doPolling();
}

function doPolling() {
    function loop() {

        var url = appState.mainUrl + '?token=' + appState.token;

        get(url, function(responseText) {
            var response = JSON.parse(responseText);
            appState.token = response.token;
            updateHistory(response.messages);
            setTimeout(loop, 1000);
        }, function(error) {
            console.log(error);
            defaultErrorHandler(error);
            setTimeout(loop, 1000);
        });
    }

    loop();
}


function updateHistory(newMessages) {
    for (var i = 0; i < newMessages.length; i++)
        addMessageInternal(newMessages[i]);
}

function addMessageInternal(message) {
    
    var tmpl = _.template(document.getElementById('list-template').innerHTML);

    var resultMessageElem = tmpl({
        user_id: message.user,
        text: message.text,
        msg_length: message.text.length,
        sending_time: message.time, 
        getting_time: getTime(),
        interval: message.interval
    });

    var logBox = document.getElementById('log');
    var tmpDiv = document.createElement('table');

    tmpDiv.innerHTML = resultMessageElem;
    resultElem = tmpDiv.firstElementChild;
    logBox.insertBefore(resultElem, logBox.children[1]);
}

function get(url, continueWith, continueWithError) {
    ajax('GET', url, null, continueWith, continueWithError);
}

/*
function isError(text) {
    if (text == "")
        return false;

    try {
        var obj = JSON.parse(text);
    } catch (ex) {
        return true;
    }

    return !!obj.error;
}*/

function defaultErrorHandler(message) {
    console.error(message);
}

function ajax(method, url, data, continueWith, continueWithError) {
    var xhr = new XMLHttpRequest();

    continueWithError = continueWithError || defaultErrorHandler;
    xhr.open(method || 'GET', url, true);

    xhr.onload = function() {
        if (xhr.readyState !== 4)
            return;

        if (xhr.status != 200) {
            continueWithError('Error on the server side, response ' + xhr.status);
            return;
        }

   /*     if (isError(xhr.responseText)) {
            continueWithError('Error on the server side, response ' + xhr.responseText);
            return;
        }
    */
        continueWith(xhr.responseText);
    };

    xhr.ontimeout = function() {
        сontinueWithError('Server timed out !');
    };

    xhr.onerror = function(e) {
        var errMsg = 'Server connection error ' + appState.mainUrl + '\n' +
            '\n' +
            'Check if \n' +
            '- server is active\n' +
            '- server sends header "Access-Control-Allow-Origin:*"';
        continueWithError(errMsg);
    };

    xhr.send(data);
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