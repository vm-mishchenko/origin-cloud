import {CloudantManager} from '../../core/cloudant';
import {FirebaseApp, PROD_SERVICE_ACCOUNT_OPTIONS} from '../../core/firebase-app';

const firebaseApp = new FirebaseApp(PROD_SERVICE_ACCOUNT_OPTIONS);

firebaseApp.database().couchDbConfig()
  .then((couchDbConfig) => {
    const cloudantManager = new CloudantManager(
      couchDbConfig.username,
      couchDbConfig.password,
      couchDbConfig.domain
    );

    cloudantManager.connect().then(() => {
      const cloudantDatabase = cloudantManager.database('PASS_USER_DATABASE_HERE');

      cloudantDatabase.transaction()
        .filter((doc) => {
          return doc.type === 'page-body' && doc.body.layout;
        })
        .update((doc) => {
          if (doc.body.layout) {
            // old schema that should be updated
            doc.body = doc.body.bricks;
          }

          return doc;
        })
        .then(() => {
          console.log(`DONE`);
        })
        .catch((e) => {
          console.log(`Doc Update is finished unsuccessfully`);
          console.log(e);
        });
    })
      .catch((e) => {
        console.log(`Cannot connect to cloudant database`);
        console.log(e);
      });
  })
  .catch((e) => {
    console.log(`Cannot retrieve couch db config`);
    console.log(e);
  });
