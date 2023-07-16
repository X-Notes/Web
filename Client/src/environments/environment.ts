// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  google: {
    client_id: '1024902505455-dudik34jj7lnog037erpeu1hchn7c12i.apps.googleusercontent.com',
  },
  writeAPI: '', // proxy
  adminAPI: 'http://localhost:3333',
};

// storage emulator endpoint

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
