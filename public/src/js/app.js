
var deferredPrompt;
var enableNotificationsButton = document.querySelectorAll('.enable-notifications');


if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/service-worker.js')
    .then(function () {
      console.log('Service worker registered!');
    })
    .catch(function(err) {
      console.log(err);
    });
}

window.addEventListener('beforeinstallprompt', function(event) {
  console.log('beforeinstallprompt fired');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

function displayConfirmNotification() {
  if('serviceWorker' in navigator){
    var options = {
      body: 'You successfully subscribe to our Notification Service',
      icon: '/src/images/icons/app-icon-96x96.png',
      image: '/src/images/sf-boat.png',
      dir: 'ltr',
      lang: 'en-AU',
      vibrate: [100, 50, 200],
      badge: '/src/images/icons/app-icon-96x96.png',
      tag: 'confirm-notification',
      renotify: true,
      actions: [
        { action: 'confirm', title: 'ok', icon : '/src/images/icons/app-icon-96x96.png'},
        { action: 'cancel', title: 'ok', icon : '/src/images/icons/app-icon-96x96.png'}
      ]
    }
    navigator.serviceWorker.ready
    .then(function(swreg){
      swreg.showNotification('Successfully subscribed!', options)
    })
  }
}

function configurePushSub(){
  // if(!('serviceWorker' in navigator)){
  //   return
  // }
  var reg;
  navigator.serviceWorker.ready 
    .then(function(swreg){
      reg = swreg;
      return swreg.pushManager.getSubscription();
    })
    .then(function(sub){
      if(sub === null){
        var vapidPublicKey = 'BFEGAJI7Fwq-yZ5jI5PI2qHWNb9DmRVR6NnXIDbRfDzu7QbfMHG7C1gzKe4Aa9b_wSD62qF9YeKypTlkFW34SLQ';
        var convertedKey = urlBase64ToUint8Array(vapidPublicKey);
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey
        })
      }else{

      }
    })
    .then(function(newSub){
      return fetch('https://instababs-api.firebaseio.com/subscriptions.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(newSub)
      })
    })
    .then(function(res){
      if(res.ok){
        displayConfirmNotification();
      }
    })
    .catch(function(err){
      console.log(err);
    })
}

function askForNotification(){
  console.log('button cliked');
  Notification.requestPermission(function(result){
    console.log('User Choice', result);
    if(result !== 'granted'){
      console.log('No notification permission granted');
      //displayConfirmNotification()
    }else{
      configurePushSub()
    }
  });
}

if('Notification' in window && 'serviceWorker' in navigator){
  console.log("%cNotification in Window", "color:orange", enableNotificationsButton.length);
  for(var i=0; i < enableNotificationsButton.length; i++){
    enableNotificationsButton[i].style.display = 'block';
    enableNotificationsButton[i].addEventListener('click', askForNotification)
  }
  
}
