function addNotification(data,tag,objectStore){

                var notificationData = {
                                          notificationId:data.notification_id,
                                          tag:tag,
                                          data:data,
                                          user_id: data.user_id
                                        };
                
                var request = objectStore.add(notificationData);
                
                request.onsuccess = function(event){
                    console.log('added notification on success');
                };
      }

      function deliver(data,tag,domain){
        var request = indexedDB.open("dbname.notifications",1);
        var db;
        const  options = {
                  body: data.description,  
                  icon: data.big_image,  
                  tag: tag,  
                  data: data
                };

        request.onsuccess = function (event){
            db = event.target.result;
            var transaction = db.transaction(["myNotifications"],"readwrite");
                var objectStore = transaction.objectStore("myNotifications");
                var delivered = false;
                var index = objectStore.index("notificationId"); //Query, Order
                var request = index.get(data.notification_id); 
                request.onsuccess = function(event){
                    var result = event.target.result;
                    if (result){
                        if (data.notification_id === result.notificationId){
                           delivered = true;
                        }
                    }
                     if (!delivered)
                      {
                                self.registration.showNotification(data.title,options).then(function()
                                {
                                  fetch(domain + '/browser_notification_delivered', {
                                   headers: {
                                       'Accept': 'application/json',
                                       'Content-Type': 'application/json'
                                       },
                                    method: "POST",
                                    body: JSON.stringify({user_id:data.user_id, notification_id: data.notification_id,vaccount_id:1,type:"web"})
                                  })
                                })
                          addNotification(data,tag,objectStore);
                      }
                };
        };
            
        request.onerror = function(event){
                
        };
            
        request.onupgradeneeded = function(event){
                //newly created db
            db = event.target.result;
            var objectStore = db.createObjectStore("myNotifications",{keyPath:"Id",autoIncrement:true});
            var store = objectStore.createIndex("notificationId","notificationId",{unique:true});
            objectStore.createIndex("tag","tag",{unique:false});// defines field and gives indexing capability
            objectStore.createIndex("data","data",{unique:false}); 
            objectStore.createIndex("user_id","user_id",{unique:false}); 
            }
          }

self.addEventListener('push', function(event) {
      var data = JSON.parse(event.data.text());
      var domain = data.domain;
        if (domain == null)
          domain = ""
          if (data.notifiable_type == "ProductCategory")
            {
              tag = data.notifiable_type
            }
          else
            {
              tag = data.notification_id
          }
        deliver(data,tag,domain);
  });


self.addEventListener('notificationclick', function(event) { 
    var notification = event.notification;
    var domain = notification.data.domain;
      if (domain == null)
        domain = ""
        var options = { tag : notification.tag };
        self.registration.getNotifications(options).then(function(notifications) {
             for(var m = 0; m< notifications.length; m++){
                notifications[m].close();
             }
          });        
    event.waitUntil(  
     clients.matchAll({  
        type: "window"  
      })
      .then(function(clientList) {  
        for (var i = 0; i < clientList.length; i++) {  
          var client = clientList[i];  
          if (client.url == notification.data.url && 'focus' in client)  
            client.focus();  
        }  
        if (clients.openWindow) {
          clients.openWindow(notification.data.url);  
       }
      })
    );
        fetch(domain + '/browser_notification_read', {
           headers: {
               'Accept': 'application/json',
               'Content-Type': 'application/json'
               },
            method: "POST",
            body: JSON.stringify({user_id:notification.data.user_id, notification_id: notification.data.notification_id,vaccount_id:1,type:"web"})
          });
        return;
});

self.addEventListener('notificationclose', function (event){
        var options = { tag : event.notification.tag };
        self.registration.getNotifications(options).then(function(notifications) {
             for(var m = 0; m< notifications.length; m++){
                notifications[m].close();
             }
          });        
        return;
});