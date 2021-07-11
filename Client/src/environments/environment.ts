// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyARUCz9Wc864vcTUf8EK51pMH1t9jpFnTc',
    authDomain: 'noots-storm.firebaseapp.com',
    databaseURL: 'https://noots-storm.firebaseio.com',
    projectId: 'noots-storm',
    storageBucket: 'noots-storm.appspot.com',
    messagingSenderId: '69998033878',
  },
  writeAPI: 'http://localhost:5000',
  storage: 'https://nootsdevstorage.blob.core.windows.net',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
