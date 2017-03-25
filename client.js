window.addEventListener("load", function() {
    // create websocket instance
    var mySocket = new WebSocket("ws://localhost:8080/ws");
    // add event listener reacting when message is received
    mySocket.onmessage = function (event) {
        var output = document.getElementById("output");
        // put text into our output div
        output.textContent = event.data;
    };
    var form = document.getElementsByClassName("foo");
    var input = document.getElementById("input");
    form[0].addEventListener("submit", function (e) {
        // on forms submission send input to our server
        input_text = input.value;
        mySocket.send(input_text);
        e.preventDefault()
    })
});