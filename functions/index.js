const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const webpush = require('web-push');
const {VAPID_PRIVATE_KEY} = require('./config');
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

var serviceAccount = require("./instababas-key.json"); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://instababs-api.firebaseio.com"
});

exports.storePostData = functions.https.onRequest(function(request, response) {
    console.log("Insdie Function");
    cors(request, response, function() {
    console.log("Request Body", request.body);
      admin.database().ref('posts').push({
        id: request.body.id,
        title: request.body.title,
        location: request.body.location,
        image: request.body.image
      })
        .then(function() {
            //console.log('Inside then()....');
            webpush.setVapidDetails('mailto:info@webdevelopmentexperts.com.au',
            'BFEGAJI7Fwq-yZ5jI5PI2qHWNb9DmRVR6NnXIDbRfDzu7QbfMHG7C1gzKe4Aa9b_wSD62qF9YeKypTlkFW34SLQ',
            VAPID_PRIVATE_KEY
            )
            return admin.database().ref('subscriptions').once('value')
        })
        .then(function(subscriptions){

            subscriptions.forEach(function(sub){
                //console.log("sub keys", sub.val().keys)
                var pushConfig = {
                    endpoint: sub.val().endpoint,
                    keys: {
                        auth: sub.val().keys.auth,
                        p256dh: sub.val().keys.p256dh
                    }
                }

                //console.log("pushConfig", pushConfig);

                webpush.sendNotification(pushConfig, JSON.stringify({
                    title: 'New Post',
                    content: 'New Post added',
                    openUrl: '/help'
                }))
                .catch(function(err){ 
                    console.log(err);
                })
            })
            return response.status(201).json({message: 'Data stored', id: request.body.id});
        })
        .catch(function(err) {
            return response.status(500).json({error: err});
        });
    });
   });
