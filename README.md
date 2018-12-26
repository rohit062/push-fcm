# push-fcm
Node js module to Google's Firebase Cloud Messaging (FCM). Supports both android and iOS
It supports both callback and promise style of code.

## Install
via [npm](https://www.npmjs.com)

```
npm install push-fcm
```

### Usage
 - Generate a Server Key from firebase console and pass it to the FCM constructor.
 - Create a message object and call the send() function.

###### Code Example Callback style
```
    var FCM = require('push-fcm');
    var serverKey = 'SERVER KEY';
    var fcm = new FCM(serverKey);

    var message = {
        to: 'registration_token', 
        collapse_key: 'your_collapse_key',
        
        notification: {
            title: 'TITLE', 
            body: 'BODY' 
        },
        
        data: { somekey : "someData" }
    };
    
    fcm.send(message, function(err, response){
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });
```


###### Code Example Promise style
```
    var FCM = require('push-fcm');
    var serverKey = 'SERVER KEY';
    var fcm = new FCM(serverKey);

    var message = {
        to: 'registration_token', 
        collapse_key: 'your_collapse_key',
        
        notification: {
            title: 'TITLE', 
            body: 'BODY' 
        },
        
        data: { somekey : "someData" }
    };
    
    fcm.send(message).then(response => {
       console.log("Successfully sent with response: ", response);
    })
    .catch(err => { 
    console.log("Something has gone wrong!");
    });
```

To send push to multiple devices change key in message body "to" to "registration_ids" and pass the array of device token to it 

```
    var message = {
       registration_ids: [], // length must be upto 1000
        collapse_key: 'your_collapse_key',
        
        notification: {
            title: 'TITLE', 
            body: 'BODY' 
        },
        
        data: { somekey : "someData" }
    };
```
