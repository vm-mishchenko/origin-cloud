import * as functions from 'firebase-functions';
import {backupDatabases} from './api/backup-databases';
import {setUpNewUser} from './api/user';
import {STATIC_CONFIG} from './core/config';
import {FirebaseApp} from './core/firebase-app';

// initialize access to firebase
const firebaseApp = new FirebaseApp();

exports.setUpNewUser = functions.auth.user().onCreate((user) => {
  return setUpNewUser(firebaseApp, user);
});
exports.backupDatabases = functions.pubsub.topic(STATIC_CONFIG.pubsub.backupCloudant).onPublish(() => {
  return backupDatabases(firebaseApp);
});

