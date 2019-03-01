import {ServerScope} from '@cloudant/cloudant';
import {WriteStream} from 'fs';
import {CloudantManagerApi} from './manager-api';

const couchbackup = require('@cloudant/couchbackup');

export class Backup {
    constructor(private cloudant: ServerScope, private api: CloudantManagerApi) {
    }

    backupAllDatabases(writeStreamProvider: (databaseName: string) => WriteStream): Promise<any> {
        return this.cloudant.db.list()
            .then((databaseNames) => {
                const promises = databaseNames.map((databaseName) => {
                    return this.backupDatabase(databaseName, writeStreamProvider);
                });

                return Promise.all(promises).then(() => databaseNames);
            });
    }

    backupDatabase(databaseName: string, writeStreamProvider: (databaseName: string) => WriteStream): Promise<any> {
        const databaseUrl = `${this.api.getCloudantUrl()}/${databaseName}`;
        const writeStream = writeStreamProvider(databaseName);

        return this.backupDatabase_(databaseUrl, writeStream);
    }

    private backupDatabase_(databaseUrl: string, writeStream: WriteStream): Promise<any> {
        return new Promise((resolve, reject) => {
            couchbackup.backup(
                databaseUrl,
                writeStream,
                (err: any) => {
                    if (err) {
                        reject();
                    }

                    resolve();
                }
            );
        });
    }
}
