
/*
 * GET messages listing.
 */
var db = require('../database');
var url = require("url");
var mongode = require('mongode');

var errors = require('../error');


exports.createMessage = function(req, res){
    var threadId = req.param("threadId");
    db.threads.findOne({"_id": new mongode.ObjectID(threadId)}, function(err, thread){
        if(err){
            res.send(errors.ERR_005);
        } else if (!thread) {
            res.send(errors.ERR_004);
        } else {
            var newDate = new Date();
            var recipients = [].concat(req.param("recipients"));
            // map recipients to object id
            for (var i = 0; i < recipients.length; i++) {
                recipients[i] = new mongode.ObjectID(recipients[i]);
            }
            var newMessage = {
                sender: new mongode.OjbectID(req.param("sender")),
                recipients: recipients,
                body: req.param("body"),
                date: newDate,
                expirationDate: req.param("expirationDate")
            }
            // update thread date, messageCount & expiration date to reflect the new message
            thread.messageCount++;
            thread.expirationDate = newMessage.expirationDate;
            thread.date = newDate;
            thread.messages.push(newMessage);
            db.threads.update({"_id": new mongode.ObjectID(threadId)}, thread, {safe: true}, function(err, rowCount) {
                if (err || rowCount != 1) {
                    res.send(errors.ERR_007);
                } else {
                    res.send(thread);
                }
            })
        }
    });
}