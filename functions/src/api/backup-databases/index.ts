import {CloudantManager} from '../../modules/cloudant';
import {getAppConfig} from '../../core/config';
import * as firebaseAdmin from '../../core/firebase-admin';

export function backupDatabases() {
  return getAppConfig()
    .then((appConfig) => {
      const cloudantManager = new CloudantManager(
        appConfig.ibm.couchDb.username,
        appConfig.ibm.couchDb.password,
        appConfig.ibm.couchDb.domain
      );

      const backupFolderPath = `${Date.now()}`;
      const bucket = firebaseAdmin.admin.storage().bucket(appConfig.firebase.storages.backupDatabase.name);

      return cloudantManager.connect().then(() => {
        return cloudantManager.backup.backupAllDatabases((databaseName) => {
          return bucket.file(createDatabaseBackupName(backupFolderPath, databaseName)).createWriteStream();
        });
      });
    });
}

function createDatabaseBackupName(backupFolderPath: string, databaseName: string): string {
  return `${backupFolderPath}/${databaseName}.txt`;
}
