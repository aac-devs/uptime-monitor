import * as int from '../interfaces/server.interface';
import * as files from '../lib/data';
import * as usersHelpers from '../helpers/users.helpers';
import * as dataHelpers from '../helpers/data.helpers';
import { ParsedUrlQuery } from 'querystring';

export const routerMethod: int.RouterOptions = {
  post,
  get,
  put,
  delete: del,
};

const usersFiles = files.fileFactory('.data/users');

export async function post(data: int.HandlerData): Promise<int.HandlerResponseData> {
  const payload: int.PayloadData | undefined = usersHelpers.trimWhiteSpaces(data.payload);
  if (payload === undefined) return { statusCode: 400, error: 'Missing required fields', payload: undefined };

  const { gThan0, eTo10 } = usersHelpers;
  const { firstName, lastName, phone, password, tosAgreement } = payload;

  if (!(gThan0(firstName) && gThan0(lastName) && eTo10(phone) && gThan0(password) && tosAgreement))
    return { statusCode: 400, error: 'Missing required fields', payload: undefined };

  if (await usersFiles(phone)(files.FileOption.EXISTS))
    return { statusCode: 400, error: 'A user with that phone number already exists', payload: undefined };

  const hashedPassword: string | undefined = usersHelpers.hash(password);
  if (!hashedPassword) return { statusCode: 500, error: "Could not hash the user's password", payload: undefined };

  try {
    const fileData: int.PayloadData = { ...payload, password: hashedPassword.toString() };
    const { message } = await usersFiles(phone)(files.FileOption.CREATE, fileData);
    return { statusCode: 200, error: undefined, payload: { message: message.replace('File', 'User') } };
  } catch (error) {
    return { statusCode: 500, error: dataHelpers.getErrorMessage(error), payload: undefined };
  }
}

export async function get(data: int.HandlerData): Promise<int.HandlerResponseData> {
  const queryString: ParsedUrlQuery = data.queryStringObject;

  if (!queryString?.phone || Array.isArray(queryString?.phone))
    return { statusCode: 400, error: 'Missing required fields', payload: undefined };

  const phone = queryString.phone.trim();
  if (!usersHelpers.eTo10(phone))
    return { statusCode: 400, error: "Digits length of 'phone' field isn't 10", payload: undefined };

  // TODO: Verify with token

  if (!(await usersFiles(phone)(files.FileOption.EXISTS)))
    return { statusCode: 400, error: 'Specified user does not exist', payload: undefined };

  try {
    const {
      payload: { password, ...rest },
    } = await usersFiles(phone)(files.FileOption.READ);
    return { statusCode: 200, error: undefined, payload: rest };
  } catch (error) {
    return { statusCode: 404, error: dataHelpers.getErrorMessage(error), payload: undefined };
  }
}

export async function put(data: int.HandlerData): Promise<int.HandlerResponseData> {
  const payload: int.PayloadData | undefined = usersHelpers.trimWhiteSpaces(data.payload);
  if (payload === undefined) return { statusCode: 400, error: 'Missing required fields', payload: undefined };

  const { gThan0, eTo10 } = usersHelpers;
  const { firstName, lastName, phone, password } = payload;

  if (!eTo10(phone)) return { statusCode: 400, error: 'Missing required field', payload: undefined };

  if (!(gThan0(firstName) || gThan0(lastName) || gThan0(password)))
    return { statusCode: 400, error: 'Missing fields to update', payload: undefined };

  // TODO: Verify with token

  if (!(await usersFiles(phone)(files.FileOption.EXISTS)))
    return { statusCode: 400, error: 'Specified user does not exist', payload: undefined };

  try {
    const { payload: payloadToUpdate } = await usersFiles(phone)(files.FileOption.READ);
    const editedPayload: int.PayloadData = {
      ...payloadToUpdate,
      firstName: firstName ? firstName : payloadToUpdate.firstName,
      lastName: lastName ? lastName : payloadToUpdate.lastName,
      password: password ? usersHelpers.hash(password)?.toString() : payloadToUpdate.password,
    };

    const { message } = await usersFiles(phone)(files.FileOption.UPDATE, editedPayload);
    return { statusCode: 200, error: undefined, payload: { message: message.replace('File', 'User') } };
  } catch (error) {
    return { statusCode: 500, error: dataHelpers.getErrorMessage(error), payload: undefined };
  }
}

export async function del(data: int.HandlerData): Promise<int.HandlerResponseData> {
  const queryString: ParsedUrlQuery = data.queryStringObject;

  if (!queryString?.phone || Array.isArray(queryString?.phone))
    return { statusCode: 400, error: 'Missing required fields', payload: undefined };

  const phone = queryString.phone.trim();
  if (!usersHelpers.eTo10(phone))
    return { statusCode: 400, error: "Digits length of 'phone' field isn't 10", payload: undefined };

  // TODO: Verify with token

  if (!(await usersFiles(phone)(files.FileOption.EXISTS)))
    return { statusCode: 400, error: 'Specified user does not exist', payload: undefined };

  try {
    const { message } = await usersFiles(phone)(files.FileOption.DELETE);
    return { statusCode: 200, error: undefined, payload: { message: message.replace('File', 'User') } };
  } catch (error) {
    return { statusCode: 500, error: dataHelpers.getErrorMessage(error), payload: undefined };
  }
}

/** ANNOTATIONS:
 * { message: message.replace('File', 'User')} because 'usersFiles' returns { message: 'File ...' } by default.
 */
