var Faker = require('Faker'),
    db = require('./database'),
    utils = require('./utils'),
    mongode = require('mongode');
userCount = 10,
    threadCount = 20,
    messagesPerThread = 10,
    users = [],
    businessList = [],
    consumerList = [];


function createUserTags() {
    console.log("Creating user tags");

    db.users.find().each(function (err, user) {
        if (!err && user) {
            var userId = user._id;
            user.tags = Faker.Lorem.words();
            db.users.update({"_id": userId}, user, {safe: true}, function(err, rowCount) {
                if (rowCount == 1) {
                    console.log("Tags are added to users");
                    db.threads.find({"messages.recipients": userId}, {"messages":1, "_id": 1}).each(function (err, thread) {
                        var userId = new mongode.ObjectID(user.id);
                        if (!thread || !thread.messages) {
                            return;
                        }
                        for (var i = 0; i < thread.messages.length; i++) {
                            if (thread.messages[i].recipients.indexOf(userId)) {
                                var message = thread.messages[i];
                                var numberOfTags = Math.floor(Math.random() * user.tags.length);
                                message.tags = [];
                                for (var j = 0; j < numberOfTags; j++) {
                                    message.tags.push({userId: userId, tag: user.tags[i]});
                                }
                            }
                        }
                        db.threads.update({"_id": thread._id}, thread, {safe: true}, function (err, rowCount) {
                            if (rowCount == 1) {
                                console.log("Tags are added to messages");
                            }
                        });
                    });
                }
            });
        }
    });
}

function createMessageThreads(businessList, consumerList) {
    var threads = [];
    for (var i = 0; i < threadCount; i++) {
        // couple stores 2 people that make up the conversion, 1 business, 1 consumer
        var couple = [];
        var randomBusiness = Math.floor(Math.random() * businessList.length);
        var randomConsumer = Math.floor(Math.random() * consumerList.length);

        couple.push(businessList[randomBusiness], consumerList[randomConsumer]);
        var thread = {
            messages: [],
            subject: Faker.Lorem.sentence(),
            messageCount: Math.floor(Math.random() * messagesPerThread),
            date: null,
            expirationDate: null
        };
        // every date is after this date
        var lastDate = new Date(2010, 0, 1);
        for (var j = 0; j < thread.messageCount; j++) {
            // randomly choose 1 to be sender, the other will be recipient
            var senderIndex = Math.floor(Math.random() * couple.length);
            var sender = couple.splice(senderIndex, 1)[0];
            var recipient = couple[0];
            lastDate = utils.randomDate(lastDate, new Date());
            thread.messages.push({
                "_id": new mongode.ObjectID(),
                sender: sender._id,
                recipients: [recipient._id],
                body: Faker.Lorem.paragraphs(),
                date: lastDate,
                expirationDate: utils.randomDate(lastDate, new Date(2013, 1, 0))});
            couple.push(sender, recipient);
        }
        thread.date = lastDate; // thread date = last message date
        if (thread.messages.length != 0) {
            thread.expirationDate = thread.messages[thread.messages.length - 1].expirationDate;
        }
        threads.push(thread);
    }
    console.log("Inserting message threads to db ....");
    db.threads.insert(threads, {safe: true},  function(err, objects){
        if(err){
            console.warn(err.message);
        } else {
            console.log("Done")
//            createUserTags();
        }
    });
}

console.log("Cleaning up existing data");
db.users.remove();
db.messages.remove();
db.threads.remove();

for(var i = 1; i< userCount; i++){
    var user = {
        name: Faker.Name.findName(),
        email: Faker.Internet.email(),
        type: i % 2 ? "business" : "consumer",
        tags: []};


    if(user.type == "business"){
        businessList.push(user);
    } else {
        consumerList.push(user);
    }
    users.push(user);
}

console.log("Inserting users to db .....");
db.users.insert(users, {safe: true}, function(err, objects) {
    if (err) {
        console.warn(err.message);
    } else {
        createMessageThreads(businessList, consumerList)
    }
});

















