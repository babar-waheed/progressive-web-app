
var deferredPrompt;
var enableNotificationsButton = document.querySelectorAll('.enable-notifications');


if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
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
  var options = {
    body: 'You successfully subscribe to our Notification Service'
  }
  new Notification('Successfully subscribed!', options);
}

function askForNotification(){
  console.log('button cliked');
  Notification.requestPermission(function(result){
    console.log('User Choice', result);
    if(result !== 'granted'){
      console.log('No notification permission granted');
      displayConfirmNotification()
    }else{

    }
  });
}

if('Notification' in window){
  console.log("%cNotification in Window", "color:orange", enableNotificationsButton.length);
  for(var i=0; i < enableNotificationsButton.length; i++){
    enableNotificationsButton[i].style.display = 'block';
    enableNotificationsButton[i].addEventListener('click', askForNotification)
  }
  
}
