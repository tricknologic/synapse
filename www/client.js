const COOKIE_USER = 'trickno-user';

var sock = null;
var ellog = null;
var user;

var payload = {
    user: 'anonymous',
    message: '',
    action: null,
    peer: null
}

window.onload = function() {
    var wsuri;

    payload.user = getUserName();

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
            payload.action = "join";
            sendPayload();
        }
        sock.onclose = function(e) {
            console.log(e);
            log("Connection closed (wasClean = " + e.wasClean + ", code = " + e.code + ", reason = '" + e.reason + "')");
            payload.action = "quit";
            sendPayload();
            sock = null;
        }
        sock.onmessage = function(e) {
            // payload = Object.assign(payload, JSON.parse(e.data));
            log(e.data);
        }
        sock.onerror = function(e) {
            console.log(e);
        }
    }
};

function sendPayload()
{
    if (sock) {
        sock.send(JSON.stringify(payload));
    } else {
        log("Not connected :(");
    }
}

function go()
{
    var messageInput = document.getElementById('message');

    payload.message = messageInput.value;
    payload.action = "msg"
    sendPayload();

    messageInput.value = '';
    messageInput.focus();
}

function log(m) {
    ellog.innerHTML += m + '\n';
    ellog.scrollTop = ellog.scrollHeight;
};

function getUserName()
{
    let savedUser = readCookie(COOKIE_USER);

    console.log(savedUser);

    return savedUser ? savedUser : payload.user;
}

function nick()
{
    deleteCookie(COOKIE_USER);
    let newUser = window.prompt("nickname?", payload.user);
    createCookie(COOKIE_USER, newUser, 69);

    return newUser;
}

function createCookie(name, value, days)
{
    let expires = '';
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + '=' + value + expires + '; path=/';
}

function readCookie(name)
{
    let nameEQ = name + '=';
    let cookieParts = document.cookie.split(';');
    for (let i=0; i < cookieParts.length; i++) {
        let c = cookieParts[i];
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
