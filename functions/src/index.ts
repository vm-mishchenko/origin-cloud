import * as functions from 'firebase-functions';
import {backupDatabases} from './api/backup-databases';
import {setUpNewUser} from './api/user';
import {STATIC_CONFIG} from './core/config';
import * as firebaseAdmin from './core/firebase-admin';

firebaseAdmin.initialize();
// firebaseAdmin.initializeCloudApp();

exports.setUpNewUser = functions.auth.user().onCreate((user) => setUpNewUser(user));
exports.backupDatabases = functions.pubsub.topic(STATIC_CONFIG.pubsub.backupCloudant).onPublish(() => backupDatabases());

console.log(`ada  s!!!!!d`);
backupDatabases().then(() => {
    console.log(`donasdasde!`);
});


