
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , message = require('./routes/message')
  , thread = require('./routes/thread')
  , tag = require('./routes/tag')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/users/:userId/tags', tag.list);
app.get('/users/:userId/threads', tag.listThreadsByTag);
app.get('/threads', thread.list);
app.get('/users/:userId/tags', tag.list);
app.get('/users/:userId/threads', tag.listThreadsByTag);
// get full info about a thread including all messages
app.get('/threads/:id', thread.getThread)

app.get('/users');
app.post('/users', user.createUser);
app.post('/users/:userId/threads/:threadId/tags', tag.createTag);
// get list of threads organized by folder (inbox, sent, expired). No messages are returned to improve performance
app.post('/threads', thread.createThread);
// called when user replied / forward, in other word, add messages to an existing thread
app.post('/threads/:threadId/messages', message.createMessage)
//create tags for messages
app.post('/users/userId/tags', tag.createTag);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

