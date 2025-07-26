import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import {
  IN_DEV,
  FIREBASE_DB_URL_DEV,
  FIREBASE_DB_URL_DEFAULT
} from '@env';

const firebaseConfig = {
  databaseURL: IN_DEV == "true" ? FIREBASE_DB_URL_DEV : FIREBASE_DB_URL_DEFAULT,
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

export default db; 