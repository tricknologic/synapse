const COOKIE_USER = 'trickno-user';

var sock = null;
var ellog = null;
var user;

window.onload = function() {
    var wsuri;

    user = getUserName();

    ellog = document.getElementById('log');

    document.getElementById('message').focus();

    if (window.location.protocol === "file:") {
        wsuri = "wss://localhost:9000";
    } else {
        wsuri = "wss://" + window.location.hostname + ":9000";
    }

    if ("WebSocket" in window) {
        sock = new WebSocket(wsuri);
    } else if ("MozWebSocket" in window) {
        sock = new MozWebSocket(wsuri);
    } else {
        log("Browser does not support WebSocket!");
    }

    if (sock) {
        sock.onopen = function() {
            log("Connected to " + wsuri);
        }
        sock.onclose = function(e) {
            log("Connection closed (wasClean = " + e.wasClean + ", code = " + e.code + ", reason = '" + e.reason + "')");
            sock = null;
        }
        sock.onmessage = function(e) {
            log(e.data);
        }
    }
};

function broadcast()
{
    var messageInput = document.getElementById('message');
    var message = messageInput.value;
    var msg = user + ': ' + message;

    if (sock) {
        sock.send(msg);
    } else {
        log("Not connected.");
    }

    messageInput.value = '';
    messageInput.focus();
}

function log(m) {
    ellog.innerHTML += m + '\n';
    ellog.scrollTop = ellog.scrollHeight;
};

function getUserName()
{
    if (user) {
        return user;
    }

    savedUser = readCookie(COOKIE_USER);
    if (savedUser) {
        return savedUser;
    }

    var newUser = window.prompt("nickname?", 'anonymous');
    createCookie(COOKIE_USER, newUser, 69);

    return user;
}

function refreshUserName()
{
    deleteCookie(COOKIE_USER);
    user = window.prompt("nickname?", user);
    createCookie(COOKIE_USER, user, 69);
    console.log('user changed to ' + user);
}

function createCookie(name, value, days)
{
    var expires = '';
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + '=' + value + expires + '; path=/';
}

function readCookie(name)
{
    var nameEQ = name + '=';
    var cookieParts = document.cookie.split(';');
    for (var i=0; i < cookieParts.length; i++) {
        var c = cookieParts[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) == 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }

    return null;
}

function deleteCookie(name)
{
    createCookie(name, '', -1);
}