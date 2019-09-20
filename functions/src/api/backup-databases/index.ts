import {CloudantManager} from '../../core/cloudant';
import {FirebaseApp} from '../../core/firebase-app';

export function backupDatabases(firebaseApp: FirebaseApp) {
  return firebaseApp.database().appConfig()
    .then((appConfig) => {
      const cloudantManager = new CloudantManager(
        appConfig.ibm.couchDb.username,
        appConfig.ibm.couchDb.password,
        appConfig.ibm.couchDb.domain
      );

      const backupFolderPath = `${Date.now()}`;
      const bucket = firebaseApp.app.storage().bucket(appConfig.firebase.storages.backupDatabase.name);

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
