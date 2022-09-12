import crypto from 'crypto';
import config from '../lib/config';

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

export function trimWhiteSpaces(stringObject: object | undefined): object | undefined {
  if (stringObject) {
    const keyValuesArray: [string, string | boolean][] = Object.entries(stringObject);
    const trimmedValuesArray: [string, string | boolean][] = keyValuesArray.map((keyValue) =>
      typeof keyValue[1] === 'string' ? [keyValue[0], keyValue[1].trim()] : [keyValue[0], keyValue[1]]
    );
    let keyValuesObject = {};
    trimmedValuesArray.forEach((keyValue) => (keyValuesObject = { ...keyValuesObject, [keyValue[0]]: keyValue[1] }));
    return keyValuesObject;
  }
  return undefined;
}

export function hash(password: string | undefined): string | undefined {
  if (password && gThan0(password)) {
    return crypto.createHmac('sha256', config.hashingSecret).update(password).digest('hex');
  }
  return undefined;
}
