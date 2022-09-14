// export default {
//   init() {
//     server.init();
//   },
// }.init();

import { main } from './lib/server';
import * as file from './lib/data';
import { getErrorMessage } from './lib/helpers';

(async function () {
  try {
    let resp: object = {};
    const userFiles = file.fileFactory('.data/users');
    const _5557778889File = userFiles('5557778889');

    await _5557778889File(file.FileOption.DELETE);
  } catch (error) {
    console.log(getErrorMessage(error));
  }
});

main();
