import fs from 'fs';
import util from 'util';
import * as path from 'path';
import { parseJsonToObject } from '../helpers/server.helper';
import { getErrorMessage } from '../helpers/data.helpers';
import * as int from '../interfaces/data.interface';

export enum FileOption {
  CREATE = 'createFile',
  READ = 'readFile',
  UPDATE = 'updateFile',
  DELETE = 'deleteFile',
  READ_DIRECTORY = 'readDirectory',
  EXISTS = 'existsFile',
}

const manageFileOption: int.ManageFileOptions = {
  createFile,
  readFile,
  updateFile,
  deleteFile,
  readDirectory,
  existsFile,
};

async function createFile(base: string, stringData: string): Promise<object> {
  try {
    const fileDescriptor = await util.promisify(fs.open)(base, 'wx');
    await util.promisify(fs.write)(fileDescriptor, stringData);
    await util.promisify(fs.close)(fileDescriptor);
    return { message: 'File created successfully' };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

async function readFile(base: string): Promise<object> {
  try {
    return { payload: parseJsonToObject(await util.promisify(fs.readFile)(base, 'utf-8')) };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

async function updateFile(base: string, stringData: string): Promise<object> {
  try {
    const fileDescriptor = await util.promisify(fs.open)(base, 'r+');
    await util.promisify(fs.ftruncate)(fileDescriptor);
    await util.promisify(fs.write)(fileDescriptor, stringData);
    await util.promisify(fs.close)(fileDescriptor);
    return { message: 'File updated successfully' };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

async function deleteFile(base: string): Promise<object> {
  try {
    await util.promisify(fs.unlink)(base);
    return { message: 'File deleted successfully' };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

async function readDirectory(base: string): Promise<object> {
  try {
    const fileNames = await util.promisify(fs.readdir)(base);
    if (Array.isArray(fileNames) && fileNames.length > 0) {
      return { payload: fileNames.map((fileName) => fileName.replace('.json', '')) };
    }
    return { message: 'There are no files in the directory' };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

async function existsFile(base: string): Promise<boolean> {
  try {
    await util.promisify(fs.readFile)(base, 'utf-8');
    return true;
  } catch (error) {
    return false;
  }
}

export function fileFactory(dirName: string): Function {
  const manageFile: int.FileManager = (fileName: string) => {
    const baseFile: string = `${manageFile.dirPath}/${fileName}.json`;
    return async function (option: string, data?: object): Promise<object> {
      try {
        if (option in manageFileOption) {
          const base = option === FileOption.READ_DIRECTORY ? `${manageFile.dirPath}/` : baseFile;
          return await manageFileOption[option](base, JSON.stringify(data));
        }
        throw new Error(`ERRDEV: '${option}' option is Not defined in 'manageFileOption' object`);
      } catch (error) {
        throw new Error(getErrorMessage(error).split(',')[0]);
      }
    };
  };
  manageFile.dirPath = path.resolve(`${dirName}`);
  return manageFile;
}

/*
(async function operation() {
  try {
    let respuesta: object = {};

    const manageUserFiles = fileFactory('.data/users');
    const manageTokensFiles = fileFactory('.data/tokens');
    const file1 = manageUserFiles('circle-square');
    // respuesta = await file1('createFile', { circle: 'square' });

    // const file2 = manageUserFiles('5557778888');
    // const file3 = manageTokensFiles('arana');

    respuesta = await file1('readFile');
    console.log('Respuesta final:', respuesta);

    respuesta = await file1('deleteFile');
    console.log('Respuesta final:', respuesta);

    // respuesta = await file1('updateFile', { apples: 'oranges' });
    // console.log('Respuesta final:', respuesta);

    respuesta = await file1('readFile');
    console.log('Respuesta final:', respuesta);

    // respuesta = await file1('readFile');
    // console.log('Respuesta final:', respuesta);
    // respuesta = await file3('readFile');
    // console.log('Respuesta final:', respuesta);

    // respuesta = await file2('readFile');
    // console.log('Respuesta final:', respuesta);
  } catch (error) {
    console.log(getErrorMessage(error));
  }
});
 */
