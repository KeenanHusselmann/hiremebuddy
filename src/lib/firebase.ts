import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyCTFfrHgcU7AGSdb2oALmuLOUfKBBLoJIU",
  authDomain: "hiremebuddy-82e2a.firebaseapp.com",
  projectId: "hiremebuddy-82e2a",
  storageBucket: "hiremebuddy-82e2a.firebasestorage.app",
  messagingSenderId: "48834374487",
  appId: "1:48834374487:web:b13b889cedea652ed36c12",
  measurementId: "G-THZD0J9PB1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
export const messaging = getMessaging(app);

export { getToken, onMessage };