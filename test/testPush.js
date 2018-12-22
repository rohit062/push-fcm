const FCM  = require('../../push-fcm');

const serverKey = "creds.serverKey";
const tookan = "creds.tookan";
const fcm = new FCM(serverKey);

fcm.send({
  registration_ids: [tookan, tookan],
  // time_to_live : "10000000000000000",
  notification: {
    title: "title",
    body: "body"
  }
})
  .then(result => {
    console.log(result)
  })
  .catch(err => console.log(err))