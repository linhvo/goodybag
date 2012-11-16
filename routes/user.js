
/*
 * GET users listing.
 */
var db = require('../database')

exports.list = function(req, res){
    db.users.find().toArray(function(error, array){
        console.log(array);
        res.send(array);
    });

};

exports.createUser = function(req, res){
    var user = {
        name: req.param("name" , null),
        email: req.param("email"),
        type: req.param("type")
    }

    db.users.insert(user, function(err, objects){
        if (err) {
            console.warn(err.meassage);
        }
        res.send(objects);
    });

}

