export const admin = require('firebase-admin');
const serviceAccount = require('../../../keys/dev-origin-of-your-ideas-aaba30fd5a10.json');

export function initialize() {
    return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://dev-origin-of-your-ideas.firebaseio.com'
    });
}

export function initializeCloudApp() {
    return admin.initializeApp();
}
