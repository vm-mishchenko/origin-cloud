import * as firebaseAdmin from '../firebase-admin';
import {IAppConfig, IAppCouchDbConfig} from './config.types';

export const STATIC_CONFIG = {
    pubsub: {
        backupCloudant: 'backup-cloudant'
    }
};

export function getAppConfig(): Promise<IAppConfig> {
    return firebaseAdmin.admin.database()
        .ref(`appConfig`).once('value')
        .then((snapshot: any) => snapshot.toJSON());
}

export function getAppCouchDbConfig(): Promise<IAppCouchDbConfig> {
    return getAppConfig().then((appConfig) => appConfig.ibm.couchDb);
}

