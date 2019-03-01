import {ApiKey, ServerScope} from '@cloudant/cloudant';
import {Backup} from './backup';
import {CloudantManagerApi} from './manager-api';

const Cloudant = require('@cloudant/cloudant');

export interface ICouchDbConfig {
    key: string;
    password: string;
    name: string;
}

export class CloudantManager {
    backup: Backup;

    private cloudant!: ServerScope;
    private api: CloudantManagerApi;

    constructor(private username: string, private password: string, private domain: string) {
    }

    connect(): Promise<any> {
        return this.getCloudantInstance().then((cloudant) => {
            this.cloudant = cloudant;
            this.initialize();
        });
    }

    provisionNewCouchDb(userUid: string): Promise<ICouchDbConfig> {
        const databaseName = `user-${userUid.toLowerCase()}`;
        let apiKeyResult: ApiKey;

        return this.cloudant.db.create(databaseName)
            .then(() => {
                return Promise.all([
                    this.cloudant.generate_api_key(),
                    this.cloudant.use(databaseName).get_security()
                ]).then(([apiKey, databaseSecurity]) => {
                    // CAUTION: If the database was just provisioned, it won't have the
                    // "cloudant" name-space on it yet. On subsequent requests, however,
                    // it may be defined if the security has been updated.
                    // https://www.bennadel.com/blog/3208-provisioning-cloudant-couchdb-databases-from-auth0-for-a-database-per-user-architecture-in-angular-2-4-1.htm
                    // databaseSecurity = databaseSecurity || {};

                    // Hold on to the key so that we can return it in the final resolve.
                    apiKeyResult = apiKey;

                    // Grant the new API key permissions on the given database.
                    databaseSecurity[apiKey.key] = ['_reader', '_writer', '_replicator'];

                    // Persist the permissions back to Cloudant.
                    return this.cloudant.use(databaseName).set_security(databaseSecurity);
                }).then(() => {
                    const {key, password} = apiKeyResult;

                    return {
                        name: databaseName,
                        key,
                        password
                    };
                });
            });
    }

    private initialize() {
        this.api = new CloudantManagerApi(
            this.username,
            this.password,
            this.domain,
            this.cloudant
        );

        this.backup = new Backup(this.cloudant, this.api);
    }

    private getCloudantInstance(): Promise<ServerScope> {
        return new Promise((resolve, reject) => {
            Cloudant({url: this.api.getCloudantUrl()}, (err: any, cloudant: ServerScope) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(cloudant);
            });
        });
    }
}
