import {FirebaseApp} from '../../core/firebase-app';

export function removeOldBackupFiles(firebaseApp: FirebaseApp, numberBackupsDateToLeave: number): Promise<any> {
  return firebaseApp.database().appConfig().then(async (appConfig) => {
    const bucket = firebaseApp.app.storage().bucket(appConfig.firebase.storages.backupDatabase.name);
    const [backupFiles] = await bucket.getFiles();

    // [<timestamp-1-day-1>, <timestamp-1-day-2>]
    // there are might be several backups in one day
    // we wanna leave all backups for the last <numberBackupsDateToLeave> days
    let uniqueSortedBackupTimestamps = [...new Set(backupFiles.map((file) => {
      return extractBackupDateFromFileName(file.name);
    }))].sort((a, b) => {
      // newest at the beginning
      if (Number(a) > Number(b)) {
        return -1;
      } else {
        return 1;
      }
    });

    const dateUniqueSet = new Set();
    // uniq backup date, e.g. contains unique date even though that date might had several backups
    const uniqueDateSortedBackupMetadatas = uniqueSortedBackupTimestamps.map((uniqueBackupTimestamps, index) => {
      const date = new Date(Number(uniqueBackupTimestamps));
      const dayPrecisionRepresentation = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

      return {
        index,
        uniqueBackupTimestamps,
        dayPrecisionRepresentation
      };
    }).filter((uniqueSortedBackupMetadata) => {
      if (dateUniqueSet.has(uniqueSortedBackupMetadata.dayPrecisionRepresentation)) {
        return false;
      } else {
        dateUniqueSet.add(uniqueSortedBackupMetadata.dayPrecisionRepresentation);
        return true;
      }
    });

    if (uniqueDateSortedBackupMetadatas.length <= numberBackupsDateToLeave) {
      console.log(`Success: No backups will be removed.`);
      console.log(`Current backups numbers: ${uniqueDateSortedBackupMetadatas.length} less than allowed: ${numberBackupsDateToLeave}`);
      return Promise.resolve();
    }

    const backupTimestampsToRemove = uniqueSortedBackupTimestamps.slice(uniqueDateSortedBackupMetadatas[numberBackupsDateToLeave].index);

    console.log(`Start removing files with following backup dates:`);
    console.log(backupTimestampsToRemove);

    return backupTimestampsToRemove.map((backupDateToRemove) => {
      return bucket.deleteFiles({
        prefix: backupDateToRemove
      }).then(() => {
        console.log(`File with ${backupDateToRemove} prefix was successfully removed.`);
      });
    });
  });
}

// <backup-date>/file.txt -> <backup-date>
function extractBackupDateFromFileName(backupFileName): string {
  return backupFileName.split('/')[0];
}
