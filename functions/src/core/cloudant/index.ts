import {ApiKey, ServerScope} from '@cloudant/cloudant';
import {DocumentScope} from 'nano';
import {Backup} from './backup';
import {CloudantManagerApi} from './manager-api';

const Cloudant = require('@cloudant/cloudant');

export interface ICouchDbConfig {
  key: string;
  password: string;
  name: string;
}

export class CloudantDoc {
  constructor(readonly _id: string, readonly docScope: DocumentScope<any>) {
  }

  update(newData) {
    return this.docScope.bulk({
      docs: [
        newData
      ]
    });
  }

  toJSON() {
    return this.docScope.get(this._id);
  }
}

/**
 * Performs bulk doc update operations.
 * */
export class CloudantTransaction {
  private filterFn: (doc) => boolean = () => true;

  constructor(readonly docScope: DocumentScope<any>) {
  }

  /** Take function that filter the docs that ultimately should be updated. */
  filter(filterFn: (doc) => boolean) {
    this.filterFn = filterFn;

    return this;
  }

  /** Applies map function to the doc and save it. */
  update(mapFn: (doc: any) => any) {
    return this.docScope.list({
      include_docs: true
    }).then((docListResponse) => {
      const updatedDocs = docListResponse.rows
        .filter((doc) => {
          return this.filterFn(doc.doc);
        })
        .map((doc) => {
          return mapFn(doc.doc);
        });

      // UNCOMMENT BEFORE UPDATE !!!
      return this.docScope.bulk({
        docs: updatedDocs
      });
    });
  }
}

export class CloudantDatabase {
  constructor(readonly name: string, private cloudant: ServerScope) {
  }

  docs() {
    return this.cloudant.db.use(this.name).list().then((docListResponse) => {
      return docListResponse.rows.map((doc) => {
        console.log(doc);
      });
    });
  }

  doc(_id: string) {
    return new CloudantDoc(_id, this.cloudant.db.use(this.name));
  }

  docCount() {
    return this.cloudant.db.get(this.name).then((dbInfo) => {
      return dbInfo.doc_count;
    });
  }

  delDocCount() {
    return this.cloudant.db.get(this.name).then((dbInfo) => {
      return dbInfo.doc_del_count;
    });
  }

  /** Performs bulk operations on the docs */
  transaction() {
    return new CloudantTransaction(this.cloudant.db.use(this.name));
  }
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

  database(name: string) {
    return new CloudantDatabase(name, this.cloudant);
  }

  databases(): Promise<string[]> {
    return this.cloudant.db.list();
  }

  private getCloudantUrl() {
    return `https://${this.username}:${this.password}@${this.domain}`;
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
      Cloudant({url: this.getCloudantUrl()}, (err: any, cloudant: ServerScope) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(cloudant);
      });
    });
  }
}
