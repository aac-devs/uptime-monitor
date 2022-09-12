// import server from './lib/server';

// export default {
//   init() {
//     server.init();
//   },
// }.init();

import { main } from './lib/server';
import * as file from './lib/data';
import { getErrorMessage } from './helpers/data.helpers';

// console.log(fileFactory);
(async function () {
  try {
    let resp: object = {};
    const userFiles = file.fileFactory('.data/users');
    const _5557778889File = userFiles('5557778889');

    await _5557778889File(file.FileOption.DELETE);

    // const tokenFiles = file.fileFactory('.data/tokens');
    // const firstTokenFile = tokenFiles('first-token');

    /*     resp = await aac_devsFile(file.FileOption.DELETE);
    console.log({ resp });

    resp = await aac_devsFile(file.FileOption.EXISTS);
    console.log({ resp });

    resp = await aac_devsFile(file.FileOption.CREATE, { aac: 'devs' });
    console.log({ resp });

    resp = await aac_devsFile(file.FileOption.EXISTS);
    console.log({ resp });

    resp = await firstTokenFile(file.FileOption.DELETE);
    console.log({ resp });

    resp = await firstTokenFile(file.FileOption.CREATE, { first: 'second' });
    console.log({ resp });

    resp = await aac_devsFile(file.FileOption.READ_DIRECTORY);
    console.log({ resp });

    resp = await firstTokenFile(file.FileOption.READ_DIRECTORY);
    console.log({ resp });
 */
  } catch (error) {
    console.log(getErrorMessage(error));
  }
})();

main();
