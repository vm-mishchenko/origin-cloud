// export const admin = require('firebase-admin');
import * as admin from 'firebase-admin';
import {FirebaseDatabase} from '../firebase-database';

const devServiceAccount = require('../../../keys/dev-origin-of-your-ideas-aaba30fd5a10.json');
const prodServiceAccount = require('../../../keys/origin-of-your-ideas-552a1448db69.json');

export const DEV_SERVICE_ACCOUNT_OPTIONS = {
  credential: admin.credential.cert(devServiceAccount),
  databaseURL: 'https://dev-origin-of-your-ideas.firebaseio.com'
};

export const PROD_SERVICE_ACCOUNT_OPTIONS = {
  credential: admin.credential.cert(prodServiceAccount),
  databaseURL: 'https://origin-of-your-ideas.firebaseio.com'
};

export class FirebaseApp {
  admin = admin;
  app: admin.app.App = admin.initializeApp(this.options);

  constructor(private options?: admin.AppOptions) {
  }

  database() {
    return new FirebaseDatabase(this.app.database());
  }
}
