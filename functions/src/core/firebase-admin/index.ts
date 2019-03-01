export const admin = require('firebase-admin');
const serviceAccount = require('../../../keys/seed-3611e-firebase-adminsdk-hz0z2-bf5f7cde0a.json');

export function initialize() {
    return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://seed-3611e.firebaseio.com'
    });
}

export function initializeCloudApp() {
    return admin.initializeApp();
}
