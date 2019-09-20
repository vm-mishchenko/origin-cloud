import * as admin from 'firebase-admin';
import {IAppConfig} from '../config/config.types';

/** Application specific firebase db representation. */
export class FirebaseDatabase {
  constructor(private db: admin.database.Database) {
  }

  couchDbConfig() {
    return this.appConfig().then((appConfig) => {
      return appConfig.ibm.couchDb;
    });
  }

  appConfig(): Promise<IAppConfig> {
    return this.db.ref(`appConfig`).once('value')
      .then((snapshot: any) => snapshot.toJSON());
  }
}
