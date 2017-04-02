const COOKIE_USER = 'trickno-user';

var sock = null;
var ellog = null;
var user = 'anonymous';
var peer = null;


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
        let msg = {
            message: "Browser does not support WebSocket!",
            user: "client",
            action: "error",
            peer: peer
        }
        log(msg);
    }

    if (sock) {
        sock.onopen = function() {
            let msg = {
                message: "Connected to " + wsuri,
                user: "client",
                action: "join",
                peer: peer
            }
            sendPayload(msg);
        }
        sock.onclose = function(e) {
            console.log(e);
            let msg = {
                message: "Connection closed (wasClean = " + e.wasClean + ", code = " + e.code + ", reason = '" + e.reason + "')",
                action: "quit",
                user: "client",
                peer: peer
            }
            sendPayload(msg);
            sock = null;
        }
        sock.onmessage = function(e) {
            // payload = Object.assign(payload, JSON.parse(e.data));
            let payload = JSON.parse(e.data);
            log(payload);
        }
        sock.onerror = function(e) {
            console.log(e);
        }
    }
};

function sendPayload(payload)
{
    if (sock) {
        sock.send(JSON.stringify(payload));
    } else {
        let msg = {
            message: "Not connected :(",
            action: "error",
            user: "client",
            peer: peer
        }
        log(msg);
    }
}

function go()
{
    var messageInput = document.getElementById('message');

    let msg = {
        message: messageInput.value,
        user: user,
        peer: peer,
        action: "msg"
    }

    sendPayload(msg);

    messageInput.value = '';
    messageInput.focus();
}

function log(payload) {
    console.log(payload);

    let msg = '<div class="msg">';
    msg += '<span class="user">' + payload.user + '</span>';
    msg += '<span class="message">' + payload.message + '</span>';
    msg += '</div>';

    ellog.innerHTML += msg;
    ellog.scrollTop = ellog.scrollHeight;
};

function getUserName()
{
    let savedUser = readCookie(COOKIE_USER);

    return savedUser ? savedUser : user;
}

function nick()
{
    deleteCookie(COOKIE_USER);
    let newUser = window.prompt("nickname?", user);
    user = newUser;
    createCookie(COOKIE_USER, newUser, 69);

    document.getElementById('message').focus();

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
