import json
import sqlite3

from datetime import datetime

class database:

    def __init__(self):
        self.db = sqlite3.connect('synapse.db')
        self.cursor = self.db.cursor()
        self.createTable()

    def createTable(self):
        self.cursor.execute("CREATE TABLE IF NOT EXISTS chat (at DEFAULT(STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW')), peer TEXT, action TEXT, user TEXT, message TEXT)")
        self.db.commit()

    def save(self, msg):
        payload = (msg['user'], msg['message'], msg['action'], msg['peer'])
        self.cursor.execute('INSERT INTO chat (user, message, action, peer) values (?, ?, ?, ?)', payload)
        self.db.commit()
