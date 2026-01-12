importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBgHSgHP0TwIyR9SsQpewgnzzwbcoC7Bgo",
  authDomain: "mybox-113d8.firebaseapp.com",
  projectId: "mybox-113d8",
  storageBucket: "mybox-113d8.firebasestorage.app",
  messagingSenderId: "484626401070",
  appId: "1:484626401070:web:5f182fc626bb16a1ef1cbf",
  measurementId: "G-YYCVQTT3HV"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  try {
    const notificationTitle = payload.notification?.title;
    const notificationBody = payload.notification?.body;

    if (notificationTitle && notificationBody) {
      const notificationOptions = {
        body: notificationBody,
        icon: "https://myboxbrasil-assets.s3.sa-east-1.amazonaws.com/img/2.png",
      };

      self.registration.showNotification(
        notificationTitle,
        notificationOptions
      );
    }
  } catch (error) {
    console.error("Erro ao exibir a notificação:", error);
  }
});
