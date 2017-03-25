# synapse

## install dependencies

    pip install autobahn twisted service_identity

## generate keys

    cd keys
    openssl genrsa -out server.key 2048
    openssl req -new -key server.key -out server.csr
    openssl x509 -req -days 3650 -in server.csr -signkey server.key -out server.crt
    openssl x509 -in server.crt -out server.pem

## helpful stuff

https://pawelmhm.github.io/python/websockets/2016/01/02/playing-with-websockets.html

chrome ws client: https://chrome.google.com/webstore/detail/simple-websocket-client/pfdhoblngboilpfeibdedpjgfnlcodoo?hl=en

https://github.com/crossbario/autobahn-python/tree/master/examples/twisted/websocket
