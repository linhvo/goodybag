var db = require('../database')
var url = require("url");
var mongode = require('mongode');
var errors = require('../error');

exports.list = function (req, res) {
    var queryData= url.parse(req.url, true).query;
    var userId = queryData["userId"];
    var senderId = queryData["senderId"];

    var size = parseInt(queryData["size"]) || 25;
    var folder = queryData["folder"] || "inbox";
    var mongoQuery = {};
    var senderQuery = {};

    try {
        if (folder == "sent"){
            mongoQuery = {"messages.sender": new mongode.ObjectID(userId)};
        }  else if (folder == "expired") {
            mongoQuery = {"messages.recipients":  new mongode.ObjectID(userId), "expirationDate": {"$lt" : new Date()}};
        } else  {
            mongoQuery = {"messages.recipients":  new mongode.ObjectID(userId), "expirationDate": {"$gte" : new Date()}};
        }

        if(senderId){
            mongoQuery["messages.sender"] =  new mongode.ObjectID(senderId);
        }
    } catch (err) {
        res.send(errors.ERR_008);
    }



    db.threads.find(mongoQuery,{"id": 1, "subject": 1, "messageCount": 1, "date": 1, "expirationDate": 1, "messages": 1}).toArray( function(err, objects){
        if(err){
            console.warn(err.message);
        } else {
            res.send(objects);
        }
    });
}

exports.getThread = function(req, res){
    var threadId = req.param("id");
    db.threads.findOne({"_id": new mongode.ObjectID(threadId)}, function(err, objects){
        if(err){
            console.warn(err.message);
        }
        res.send(objects);
    });
}

var doCreateThread = function (subject, senderId, recipients, body, expirationDate, res) {
    var date = new Date();
    var thread = {
        subject: subject,
        expirationDate: expirationDate,
        messageCount: 1,
        date: date,
        messages: [{
            sender: senderId,
            body: body,
            recipients: recipients,
            date: date,
            expirationDate: expirationDate
        }]
    };
    console.log('Creating thread: ' + JSON.stringify(thread));
    db.threads.insert(thread, {safe: true}, function (err, objects) {
        if (err) {
            console.warn(err.message);
        } else {
            console.log('Success: ' + JSON.stringify(objects[0]));
            res.send(objects[0]);
        }
    });
}
exports.createThread = function (req, res) {
    if (req.param("expirationDate") < new Date()) {
        res.send(errors.ERR_010);
    }
    if (!req.param("sender", null)) {
        res.send(errors.ERR_011);
    }
    if (!req.param("recipients")) {
        res.send(errors.ERR_012);
    }
    try {
        var senderId = new mongode.ObjectID(req.param("sender"));
        var recipients = [].concat(req.param("recipients"));
        // map recipients to object id
        for (var i = 0; i < recipients.length; i++) {
            recipients[i] = new mongode.ObjectID(recipients[i]);
        }
    } catch (err) {
        res.send(errors.ERR_008);
    }
    // validation to make sure no communication between business and business or between consumer and consumer
    db.users.findOne({"_id": senderId}, function (err, sender) {
        if (err) {
            res.send(errors.ERR_002);
        } else if (!sender) {
            res.send(errors.ERR_001);
        } else {
            var isConsumer = sender.type == "consumer";
            db.users.find({"_id":{"$in": recipients}}).toArray(function (err, recipients) {
                if (err || !recipients) {
                    res.send(errors.ERR_002);
                } else {
                    for (var i = 0 ; i < recipients.length ; i++) {
                        var recipient = recipients[i];
                        if ((recipient.type == "consumer") == isConsumer) {
                            res.send(errors.ERR_010);
                        } else {
                            doCreateThread(req.param("subject"), senderId, recipients, req.param("body"), new Date(req.param("expirationDate")), res);
                        }
                    }
                }
            });
        }
    });

}

exports.getBySender = function(req, res){
    var userId
}


