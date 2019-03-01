import {UserRecord} from 'firebase-functions/lib/providers/auth';
import {getAppCouchDbConfig} from '../../core/config';
import * as firebaseAdmin from '../../core/firebase-admin';
import {CloudantManager, ICouchDbConfig} from '../../modules/cloudant';

interface IUserCouchDbConfig extends ICouchDbConfig {
    domain: string;
}

export function setUpNewUser(user: UserRecord) {
    return getAppCouchDbConfig().then((appCouchDbConfig) => {
        const cloudantManager = new CloudantManager(
            appCouchDbConfig.username,
            appCouchDbConfig.password,
            appCouchDbConfig.domain
        );

        return cloudantManager.connect().then(() => {
            return cloudantManager.provisionNewCouchDb(user.uid).then((couchDbConfig) => {
                const userCouchDbConfig: IUserCouchDbConfig = {
                    domain: appCouchDbConfig.domain,
                    ...couchDbConfig
                };

                const userRef = firebaseAdmin.admin.database().ref(`users/${user.uid}`);

                return userRef.update({couchDbConfig: userCouchDbConfig});
            });
        });
    });
}
