#!/usr/bin/env python

import database
import json
import os
import sys
import txaio

from twisted.internet import reactor, ssl
from twisted.python import log
from twisted.web.static import File
from twisted.web.server import Site

from autobahn.twisted.websocket import WebSocketServerFactory, \
    WebSocketServerProtocol, \
    listenWS

class BroadcastServerProtocol(WebSocketServerProtocol):

    def onOpen(self):
        self.factory.register(self)

    def onMessage(self, payload, isBinary):
        if not isBinary:
            try:
                msg = json.loads(payload.decode('utf8'))
            except ValueError, e:
                msg = {
                    'user': 'synapse',
                    'messasge': 'bad payload',
                    'action': None,
                    'peer': 'server'
                }
                print "received a bad json payload!"
            msg['peer'] = self.peer
            print msg
            self.factory.broadcast(json.dumps(msg))
            db.save(msg)

    def connectionLost(self, reason):
        WebSocketServerProtocol.connectionLost(self, reason)
        self.factory.unregister(self)


class BroadcastServerFactory(WebSocketServerFactory):

    """
    Simple broadcast server broadcasting any message it receives to all
    currently connected clients.
    """

    def __init__(self, url):
        WebSocketServerFactory.__init__(self, url)
        self.clients = []
        self.tickcount = 0
        self.tick()

    def tick(self):
        self.tickcount += 1
        msg = {
            'user': 'synapse',
            'message': "tick %d from server" % self.tickcount,
            'action': 'tick',
            'peer': 'server'
        }
        self.broadcast(json.dumps(msg))
        reactor.callLater(10, self.tick)

    def register(self, client):
        if client not in self.clients:
            print("registered client {}".format(client.peer))
            self.clients.append(client)
            msg = {
                'user': 'synapse',
                'message': "registered client %s" % client.peer,
                'action': 'join',
                'peer': 'server'
            }
            self.broadcast(json.dumps(msg))

    def unregister(self, client):
        if client in self.clients:
            print("unregistered client {}".format(client.peer))
            self.clients.remove(client)
            msg = {
                'user': 'synapse',
                'message': "unregistered client",
                'action': 'quit',
                'peer': 'server'
            }
            self.broadcast(json.dumps(msg))

    def broadcast(self, msg):
        print("broadcasting prepared message '{}' ..".format(msg))
        preparedMsg = self.prepareMessage(msg)
        for c in self.clients:
            c.sendPreparedMessage(preparedMsg)
            print("prepared message sent to {}".format(c.peer))


if __name__ == "__main__":
    path = os.path.dirname(os.path.realpath(__file__))
    db = database.database()
    #log.startLogging(sys.stdout)
    txaio.start_logging()

    # SSL server context: load server key and cert
    # used for both ws and http
    contextFactory = ssl.DefaultOpenSSLContextFactory("%s/keys/server.key" % path, "%s/keys/server.crt" % path)

    factory = BroadcastServerFactory(u"wss://127.0.0.1:9000")

    factory.setProtocolOptions(
        allowedOrigins=[
            "https://127.0.0.1:6969",
            "https://localhost:6969",
            "https://er0k.org:6969",
            "https://er0k.org:443",
            "https://ham.r0k:6969",
        ]
    )
    factory.protocol = BroadcastServerProtocol
    listenWS(factory, contextFactory)

    webdir = File('www')
    webdir.contentTypes['.crt'] = 'application/x-x509-ca-cert'
    web = Site(webdir)
    reactor.listenSSL(6969, web, contextFactory)

    reactor.run()
