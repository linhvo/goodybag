var db = require('../database')
var url = require("url");
var mongode = require('mongode');
var errors = require('../error');

exports.list = function (req, res) {
    try {
        var userId = new mongode.ObjectID(req.param("userId"));
    } catch (err) {
        res.send(errors.ERR_008);
    }
    db.users.findOne({"_id": new mongode.ObjectID(userId)}, function (err, user) {
        if (err) {
            res.send(errors.ERR_002);
        } else if (!user) {
            res.send(errors.ERR_001);
        } else {
            res.send(user.tags);
        }
    })
}

exports.listThreadsByTag = function (req, res) {
    try {
        var userId = new mongode.ObjectID(req.param("userId"));
    } catch (err) {
        res.send(errors.ERR_008);
    }
    var tag = url.parse(req.url, true).query["tag"];
    db.threads.find({"messages.recipients": userId, "tags.tag": tag}).toArray(function (err, threads) {
        if (err){
            res.send(errors.ERR_005);
        } else if(!threads) {
            res.send(errors.ERR_004);
        } else {
            res.send(threads);
        }
    });
}

exports.createTag = function (req, res) {
    try {
        var userId = new mongode.ObjectID(req.param("userId"));
        var threadId = new mongode.ObjectID(req.param("threadId"));
    } catch (err) {
        res.send(errors.ERR_008);
    }
    var tag = req.param("tag");
    db.users.findOne({"_id": userId}, function (err, user) {
        if (err) {
            res.send(errors.ERR_002);
        } else if (!user) {
            res.send(errors.ERR_001);
        } else {
            db.threads.findOne({"_id": threadId}, function (err, thread) {
                if (err){
                    res.send(errors.ERR_005);
                } else if(!thread) {
                    res.send(errors.ERR_004);
                } else {
                    // not very efficient, but i guess it works
                    for (var i = 0; i < thread.messages.length; i++) {
                        if (thread.messages[i].recipients.indexOf(userId) != -1) {
                            var ok = true;
                            break;
                        }
                    }
                    if (!ok) {
                        res.send(errors.ERR_009);
                    }
                    thread.tags = thread.tags || [];
                    thread.tags.push({tag: tag, userId: userId});
                    var updateThread = function () {
                        db.threads.update({"_id": threadId}, thread, {safe: true}, function (err, rowCount) {
                            if (err || rowCount != 1) {
                                res.send(errors.ERR_007);
                            } else {
                                res.send({message: "Successful"});
                            }
                        })
                    }
                    // if this is a new tag,
                    if (user.tags.indexOf(tag) == -1) {
                        user.tags.push(tag);
                        db.users.update({"_id": userId}, user, {safe: true}, function (err, rowCount) {
                            if (err || rowCount != 1) {
                                res.send(errors.ERR_003);
                            } else {
                                updateThread();
                            }
                        })
                    } else {
                        updateThread();
                    }
                }
            })
        }
    })
}