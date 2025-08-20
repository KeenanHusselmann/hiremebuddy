// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
  apiKey: "AIzaSyCTFfrHgcU7AGSdb2oALmuLOUfKBBLoJIU",
  authDomain: "hiremebuddy-82e2a.firebaseapp.com",
  projectId: "hiremebuddy-82e2a",
  storageBucket: "hiremebuddy-82e2a.firebasestorage.app",
  messagingSenderId: "48834374487",
  appId: "1:48834374487:web:b13b889cedea652ed36c12"
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/hiremebuddy-logo.png',
    badge: '/hiremebuddy-logo.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log('Notification click received.');

  event.notification.close();

  // Handle the click - navigate to the URL if provided
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});