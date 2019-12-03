const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

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
          return response.status(201).json({message: 'Data stored', id: request.body.id});
        })
        .catch(function(err) {
          return response.status(500).json({error: err});
        });
    });
   });
