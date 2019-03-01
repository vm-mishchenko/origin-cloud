export interface IAppConfig {
    name: string;
    ibm: IIBMConfig
    firebase: IAppFirebaseConfig
}

export interface IAppFirebaseConfig {
    storages: {
        backupDatabase: IAppFirebaseStorageConfig
    }
}

export interface IAppFirebaseStorageConfig {
    name: string;
}

export interface IIBMConfig {
    couchDb: IAppCouchDbConfig
}

export interface IAppCouchDbConfig {
    username: string;
    password: string;
    domain: string;
}

