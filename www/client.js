var sock = null;
var ellog = null;

window.onload = function() {
    var wsuri;
    ellog = document.getElementById('log');
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
            log("Got echo: " + e.data);
            console.log(e.data);
        }
    }
};

function broadcast() {
    var msg = document.getElementById('message').value;
    if (sock) {
        sock.send(msg);
        log("Sent: " + msg);
    } else {
        log("Not connected.");
    }
};

function log(m) {
    ellog.innerHTML += m + '\n';
    ellog.scrollTop = ellog.scrollHeight;
};