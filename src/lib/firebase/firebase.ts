import { initializeApp } from "firebase/app";
import { getMessaging } from 'firebase/messaging';

export const firebaseConfig = {
  apiKey: "AIzaSyBgHSgHP0TwIyR9SsQpewgnzzwbcoC7Bgo",
  authDomain: "mybox-113d8.firebaseapp.com",
  projectId: "mybox-113d8",
  storageBucket: "mybox-113d8.firebasestorage.app",
  messagingSenderId: "484626401070",
  appId: "1:484626401070:web:5f182fc626bb16a1ef1cbf",
  measurementId: "G-YYCVQTT3HV",
  vapidKey: "BGXwHRGr8VS7hkkth9xW3uR1vlExZgEGUdx8hBS8aUL8XQYOPNXQ66Axz55sNbPKbWyx2mq6Wg-ElKbM45GXwxw"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const messaging = getMessaging(firebaseApp);