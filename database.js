var mongode = require('mongode');

var db = mongode.connect('mongo://127.0.0.1/goodybags')

exports.users = db.collection('users');
exports.messages = db.collection('messages');
exports.threads = db.collection('threads');


