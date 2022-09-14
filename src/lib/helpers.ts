import crypto from 'crypto';
import * as int from './interfaces';
import config from './config';

function greaterThan(value: number): Function {
  return (stringValue: string): string | boolean => {
    if (stringValue) return stringValue.length > value ? stringValue : false;
    return false;
  };
}

export const gThan0 = greaterThan(0);

function equalTo(value: number): Function {
  return (stringValue: string): string | boolean => {
    if (stringValue) return stringValue.length === value ? stringValue : false;
    return false;
  };
}

export const eTo10 = equalTo(10);
export const eTo20 = equalTo(20);

export function trimWhiteSpaces(stringObject: int.IncommingBody): int.IncommingBody {
  const keyValuesArray: [string, string | boolean][] = Object.entries(stringObject);
  const trimmedValuesArray: [string, string | boolean][] = keyValuesArray.map((keyValue) =>
    typeof keyValue[1] === 'string' ? [keyValue[0], keyValue[1].trim()] : [keyValue[0], keyValue[1]]
  );
  let keyValuesObject: int.IncommingBody = {};
  trimmedValuesArray.forEach((keyValue) => (keyValuesObject = { ...keyValuesObject, [keyValue[0]]: keyValue[1] }));
  return keyValuesObject;
}

export function hash(password: string | undefined): string | undefined {
  if (password && gThan0(password))
    return crypto.createHmac('sha256', config.hashingSecret).update(password).digest('hex');
  return undefined;
}

export function createRandomString(strLength: number): string | undefined {
  if (strLength < 1) return undefined;
  const possibleCharacters: string = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let generatedString = '';
  let randomCharacter: string;
  for (let i = 1; i <= strLength; i++) {
    randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
    generatedString += randomCharacter;
  }
  return generatedString;
}

export function parseJsonToObject(str: string): object | undefined {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (err) {
    return undefined;
  }
}

export function requestEndPromisify(params: int.RequestEndParams): Promise<string> {
  const { decoder, request } = params;
  return new Promise((resolve) => request.on('end', () => resolve(decoder.end())));
}

export function logResponse(params: int.LogData): void {
  const { statusCode, trimmedPath, method } = params;
  const color = statusCode === 200 ? '32' : '31';
  const colorConfig = `\x1b[${color}m%s\x1b[0m`;
  const message = `${method?.toUpperCase()} /${trimmedPath} ${statusCode}`;
  console.log(colorConfig, message);
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}
