# Resource Models
## User
A User consists of businesses and consumers. A User resource model contains the following fields:

* id: String - A unique identifier
* name: String
* email: String
* type: String - Only accepts "business" or "consumer"
* tags: Array[String] - Collection of tags of this users. Please refer to Tag resource model for more information

## Thread
A Thread represents a series of communication between businesses and consumers and vice versa. A Thread resource model contains the following fields

* subject: String - A common subject shared by all messages in a thread
* messageCount: Integer - The number of messages in this thread
* date: Date time - The timestamp of the last message
* expirationDate: Date time - A latest expiration date among all messages' expirationDate.
* messages: Array[Message] - A collection of messages in this thread
* tags: Array[Tag] - A collection of tag object which consists of the owner of the tag and the tag itself. Please refer to Tag resource model for more information

## Message
A message represents a single communication between businesses and consumers and vice versa. A Message resource model contains the following fields

* sender: String - An ID of sending user
* recipients: Array[String] - Array of receiving user Id
* body: String - Body of the message
* date: Date time - The timestamp of the message
* expirationDate - The date at which this message is considered expired, set by the sender

## Tag
A tag represents a label a recipient assigns to his or her messages. Therefore it is a tuple of user ID and the tag itself. A thread has many tag object representing a list of tags that its recipients have assigned. For performance reason, a User resource model also contains a list of tag values, e.g. just the value of the tags that belongs to him, not the full tag object.

* userId: String - An ID of tag's owner
* tag: String - Tag

# API

## GET USER LIST
Retrieve information about all users.
Synopsis: GET {}
Request Parameters: N/A
Example Request: Retrieve information about all users.
```
    GET /users
    Host: localhost:3000
    Accept: application/vnd.com.sun.cloud.Snapshot+json
```
Example Response:
```
	{
	   name: "Sienna Hodkiewicz",
	email: "Michael.Hessel@cecil.uk",
	type: "business",
	tags: [ ],
	_id: "50a599389701562d1d000001"
	},
	{
	name: "Korbin Greenfelder",
	email: "Leanna_Barrows@lew.com",
	type: "consumer",
	tags: [ ],
	_id: "50a599389701562d1d000002"
	}
```
## GET MESSAGES(THREADS) OF AN USER
Retrieve list if thread organized by folder (inbox, sent, expired) or by specific consumer/business. No messages are returned to improve performance
Synopsis: GET {}
Request Parameters: userId, folder, senderID

Example Request: Retrieve messages of user whose userId = 50a599389701562d1d000002 in Inbox
```	
	GET /threads?userId=50a599389701562d1d000002
	Host: localhost:3000
```

Example Response:
```javascript
	{
	subject: "doloribus dolor deserunt",
	messageCount: 4,
	date: "2012-09-07T21:09:06.664Z",
	expirationDate: "2012-11-18T16:06:48.327Z",
	_id: "50a599389701562d1d000053"
	},
	{
	subject: "et fugit eos sequi",
	messageCount: 3,
	date: "2011-11-08T22:28:16.373Z",
	expirationDate: "2012-12-08T12:45:16.616Z",
	_id: "50a599389701562d1d00005d"
	}
```
## GET MESSAGES OF A THREAD
Retrieve all messages in a thread of an user
Synopsis: GET {}
Request Parameters: userId, threadId
Example Request:   
``` 
GET /threads/50a599389701562d1d00005d
Host: localhost:3000
```
Example Response:
```
{
_id: "50a599389701562d1d00002b",
sender: "50a599389701562d1d000001",
recipients: [

"50a599389701562d1d000002"
],
body: "pariatur asperiores quis itaque sit id et architecto et quaerat qui consequatur facilis voluptas et ullam illo unde iusto reiciendis atque nobis labore maxime distinctio sunt ratione qui facere ullam eligendi fugit aut inventore qui nobis aspernatur beatae soluta praesentium vel sapiente quasi et earum laboriosam nam et rerum ut quod quis dicta est veniam et dolor temporibus laboriosam eligendi minima eius accusantium esse animi perferendis ex eos dolorem ut ipsum facere aut occaecati dolorem inventore non maxime quas voluptas consequatur nemo et eos ea voluptates quaerat perferendis quos ut qui velit est rem voluptas laborum accusamus fugit deleniti ea illo sint vero adipisci corporis doloremque voluptate dolore repellat qui velit harum aut qui porro quam",
date: "2010-07-11T15:56:02.254Z",
expirationDate: "2012-09-15T21:39:54.288Z"
},
```
## GET LIST OF TAGS BY USER
Retrieve all tags name of an user
Synopsis: GET {}
Request Parameters: userId
Example Request:  
```  
GET /threads/50a599389701562d1d00005d/tags
Host: localhost:3000
```
Example Response:
```
{
tag: [tag1, tag2]
_id: "50a599389701562d1d00005d"
},
```
## GET LIST OF MESSAGES(THREADS) BY USER AND TAG
Retrieve all messages(threads) of an user with tags
Synopsis: GET {}
Request Parameters: userId, tag
Example Request: 
```   
GET /threads/50a599389701562d1d00005d/
Host: localhost:3000
```
Example Response:
```
{
subject: "et fugit eos sequi",
messageCount: 3,
date: "2011-11-08T22:28:16.373Z",
tag: [tag1, tag2]
expirationDate: "2012-12-08T12:45:16.616Z",
_id: "50a599389701562d1d00005d"
}
```
## CREATE NEW USER
Synopsis: POST {}
Request Parameters: name, email, type(business/consumer)
Result: new user is added to users collection

## CREATE NEW MESSAGE
Synopsis: POST {}
Request Parameters: sender, recipient, subject, body, expiration date
Result: new message is created in message collection

## CREATE NEW THREAD
Synopsis: POST {}
Request Parameters: subject, expiration date, number of messages in thread, messageID, date
Result: new thread with new expiration date is created

## CREATE NEW TAG
Synopsis: POST {}
Request Parameters: userID, threadID, tag name
Result: add new tag to the message and list of tag of an user

# Error code
* 001 - User doesn't exist
* 002 - Error looking up user
* 003 - Error updating user
* 004 - Thread doesn't exist
* 005 - Error looking up thread
* 006 - Thread doesn't belong to user
* 007 - Error updating thread
* 008 - Invalid arguments
* 009 - Cannot send messages between same type of users
* 010 - Expiration date must be before today
* 011 - Sender cannot be empty
* 012 - Recipients cannot be empty

# Limitations:
* Lack of security checks: Because thread is the central resource, when users requesting for a thread, all of its messages including those not addressed to the requesting user will be returned. 
* Limited data validation: There are basic data validation implemented including ID checks, message can only be sent from business to consumer and vice versa. However, this is not comprehensive validation
* Attachments feature wasn't implemented
* Tags are created on threads level, it should be developed more for messages, different tags for different messages in the same thread.

