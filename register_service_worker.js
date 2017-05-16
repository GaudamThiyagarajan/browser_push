var isSubscribed = JSON.parse(sessionStorage.getItem("isSubscribed"));
var isRefreshed = JSON.parse(sessionStorage.getItem("isRefreshed"));
var IsLoggedIn = JSON.parse(sessionStorage.getItem("isLoggedInType"));
$(document).ready(function(){
  if (isRefreshed == null){
    sessionStorage.setItem("isRefreshed",false);
    isRefreshed = false;
  }
  if (isSubscribed == null)
 {
  sessionStorage.setItem("isSubscribed",false);
  isSubscribed = false
}

const applicationServerPublicKey = publicServerKeyForPush;
const pushButton = document.querySelector('.js-push-btn');

var swRegistration = null;

var fingerprint_id;
var options = {excludeAddBehavior: true,excludeWebGL: true,excludeJsFonts: true,excludeFlashFonts: true,excludePlugins: true,excludeIEPlugins: true,excludeAdBlock: true};
new Fingerprint2(options).get(function(result){
  fingerprint_id = result;
});

if ('serviceWorker' in navigator && 'PushManager' in window) {
  console.log('Service Worker and Push is supported');

navigator.serviceWorker.register('/service-worker.js',{scope: '/'})
.then(function(swReg) {

  swRegistration = swReg;
  initialiseUI();
})
  .catch(function(error) {
    console.error('Service Worker Error', error);
  });
} else {
  console.warn('Push messaging is not supported');
}


function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}


function initialiseUI() {
  pushButton.addEventListener('click', function() {
      subscribeUser();
  });

  // Set the initial subscription value
  if (isRefreshed && (requestNotification != "false") && (browserType()=="chrome" || browserType()=="firefox" || browserType()=="opera" )){
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    isSubscribed = !(subscription === null);
    updateSubscriptionOnServer(subscription);
    sessionStorage.setItem("isRefreshed",false);
    isRefreshed = false;
    if (isSubscribed) {
      console.log('User IS subscribed.');
    } else {
      console.log('User is NOT subscribed.');
    }
  });
  }
}

function updateSubscriptionOnServer(subscription) {
  if (subscription) {

      try {
                var url = notif_domain + '' //ADD correct url
                var xmlhttp = new XMLHttpRequest();
                var jsonBody = JSON.stringify({
                  "subscription":subscription,
                  "user_id" : user_id,
                  "guest_id" : guest_id,
                  "browser_type" : browserType(),
                  "user_agent" : navigator.userAgent,
                  "fingerprint_id": fingerprint_id,
                  "type" : "web",
                  "vaccount_id" : 1,
                  "isRefreshed" : isRefreshed,
                  "isSubscribed" : isSubscribed,
                  "isLoggedIn" : IsLoggedIn
                  });
                  xmlhttp.open('POST', url);
                xmlhttp.setRequestHeader('content-type', 'application/json; charset=UTF-8');
                  xmlhttp.onload = function(){
                  if(this.status === 200){
                    console.log("Updated info successfully.");
                  }else if(this.status === 201){
                    console.log("Registered successfully.");
                  }else{
                    console.warn("Status code" + this.status + ": error.")
                  }
                };
                xmlhttp.onerror = function(e){
                  console.log("Error occured: ", e);
                };
                xmlhttp.send(jsonBody);
          } catch(e) {
                console.log('Cannot register on V: ' + e);
              }
  } 
}

function subscribeUser() {
  // use webpush gem to get server key both private and public https://github.com/zaru/webpush
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swRegistration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: applicationServerKey
})
.then(function(subscription) {
  updateSubscriptionOnServer(subscription);
  isSubscribed = true;
})
.catch(function(err) {
  console.log('Failed to subscribe the user: ', err);
});
}
});

function browserType(){
  // Opera 8.0+
var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

// Firefox 1.0+
var isFirefox = typeof InstallTrigger !== 'undefined';

// Safari 3.0+ "[object HTMLElementConstructor]" 
var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0 || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification);

// Internet Explorer 6-11
var isIE = /*@cc_on!@*/false || !!document.documentMode;

// Edge 20+
var isEdge = !isIE && !!window.StyleMedia;

// Chrome 1+
var isChrome = !!window.chrome && !!window.chrome.webstore;

// Blink engine detection
var isBlink = (isChrome || isOpera) && !!window.CSS;


if (isFirefox)
  return "firefox"

if (isChrome)
  return "chrome"

if (isOpera)
  return "opera"

if (isSafari)
  return "safari"

if (isEdge)
  return "edge"

if (isBlink)
  return "blink"

return "unknown"

}


$(window).load(function(){
  if (!isSubscribed && (requestNotification != "false") && (browserType()=="chrome" || browserType()=="firefox" || browserType()=="opera" ))
    {
      $( ".js-push-btn" ).trigger( "click" ); 
      sessionStorage.setItem("isSubscribed",true);
  }
  if (IsLoggedIn == null && is_user_logged_in )
    {
      sessionStorage.setItem("isLoggedInType",2);
      $( ".js-push-btn" ).trigger( "click" ); 
    }
  else if(IsLoggedIn == null)
    sessionStorage.setItem("isLoggedInType",1);
  else if (IsLoggedIn == 1 && is_user_logged_in )
    {
      sessionStorage.setItem("isLoggedInType",3);
      $( ".js-push-btn" ).trigger( "click" ); 
    }
});