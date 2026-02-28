// SERVICE WORKER — Ramadan 2026 India
// Background Notifications: Sehri & Iftar in Hindi + English
const CACHE = 'ramadan2026-v7';
const BASE = '/Ramadan-2026-India/';
const FILES = [BASE, BASE+'index.html', BASE+'manifest.json', BASE+'icon192.png', BASE+'icon512.png'];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) {
    return Promise.allSettled(FILES.map(function(f){ return c.add(f).catch(function(err){ console.warn('[SW] skip:',f); }); }));
  }).then(function(){ return self.skipWaiting(); }));
});

self.addEventListener('activate', function(e) {
  e.waitUntil(caches.keys().then(function(keys) {
    return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener('fetch', function(e) {
  if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request).then(function(cached) {
    var net=fetch(e.request).then(function(r){
      if(r&&r.status===200){var cl=r.clone();caches.open(CACHE).then(function(c){c.put(e.request,cl);});}
      return r;
    }).catch(function(){ return caches.match(BASE+'index.html').then(function(r){ return r||new Response('Offline',{status:503}); }); });
    return cached||net;
  }));
});

// Alarm store
var _alarms={};

self.addEventListener('message', function(e) {
  if(!e.data)return;
  if(e.data.type==='SCHEDULE_ALARM'){
    var a=e.data.alarm;
    if(!a||a.ms<=0)return;
    if(_alarms[a.alarmType])clearTimeout(_alarms[a.alarmType]);
    console.log('[SW] Alarm scheduled:',a.alarmType,'in',Math.round(a.ms/60000),'min');
    _alarms[a.alarmType]=setTimeout(function(){
      fireNotif(a);
      delete _alarms[a.alarmType];
    }, a.ms);
  }
  if(e.data.type==='CANCEL_ALARMS'){
    Object.keys(_alarms).forEach(function(k){clearTimeout(_alarms[k]);});
    _alarms={};
  }
});

function fireNotif(alarm){
  if(!self.registration.showNotification)return;
  var t = alarm.alarmType || '';
  var isIftar = t === 'iftar';
  var isIftarWarn = t === 'iftar-warn';
  var isSehri = t === 'sehri';
  var isSehriWarn = t === 'sehri-warn';

  var vibrate;
  if(isIftar)         vibrate = [300,100,300,100,600,100,300]; // celebratory
  else if(isIftarWarn) vibrate = [200,80,200,80,200];
  else if(isSehri)    vibrate = [200,100,200];                 // soft alert
  else                vibrate = [100,60,100];                  // gentle warning

  var actions;
  if(isIftar || isIftarWarn) {
    actions = [{action:'open',title:'🌙 Open App'},{action:'dua',title:'🤲 Iftar Dua'}];
  } else {
    actions = [{action:'open',title:'⏰ Open App'},{action:'dua',title:'🤲 Niyyah Dua'}];
  }

  var opts={
    body: alarm.body||'',
    icon: BASE+'icon192.png',
    badge: BASE+'icon192.png',
    tag: t,
    renotify: true,
    requireInteraction: isIftar || isSehri, // stay on screen for key moments
    vibrate: vibrate,
    silent: false,
    data:{url:BASE,alarmType:t},
    actions: actions
  };
  return self.registration.showNotification(alarm.title||'Ramadan 2026', opts)
    .then(function(){
      return self.clients.matchAll({type:'window',includeUncontrolled:true});
    }).then(function(clients){
      clients.forEach(function(c){ c.postMessage({type:'ALARM_FIRED',alarmType:t}); });
    }).catch(function(err){ console.error('[SW] Notif error:',err); });
}

self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  var url = BASE + (e.action === 'dua' ? '#duas' : '');
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(clients){
    for(var i=0;i<clients.length;i++){
      if(clients[i].url.includes(BASE)&&'focus'in clients[i])return clients[i].focus();
    }
    if(self.clients.openWindow)return self.clients.openWindow(url);
  }));
});

self.addEventListener('push', function(e) {
  if(!e.data)return;
  try{ var d=e.data.json(); e.waitUntil(fireNotif(d)); }catch(err){ console.warn('[SW] Push parse error:',err); }
});
