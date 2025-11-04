// firebase-messaging-sw.js
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyAB7b6Wic5zGrTkhrmtIqX0GzzPKNyd6Kw",
  authDomain: "patient-booking-nd2.firebaseapp.com",
  projectId: "patient-booking-nd2",
  storageBucket: "patient-booking-nd2.firebasestorage.app",
  messagingSenderId: "273988104826",
  appId: "1:273988104826:web:034d4fb9c66be1756dc1c3",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, { body });
});
