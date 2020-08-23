import {UserRecord} from 'firebase-functions/lib/providers/auth';
import {CloudantManager, ICouchDbConfig} from '../../core/cloudant';
import {FirebaseApp} from '../../core/firebase-app';

interface IUserCouchDbConfig extends ICouchDbConfig {
  domain: string;
}

export function setUpNewUser(firebaseApp: FirebaseApp, user: UserRecord) {
  return firebaseApp.database().couchDbConfig().then((appCouchDbConfig) => {
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

        const userRef = firebaseApp.app.database().ref(`users/${user.uid}`);

        return userRef.update({couchDbConfig: userCouchDbConfig});
      });
    });
  });
}
