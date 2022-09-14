import * as int from '../lib/interfaces';
import * as files from '../lib/data';
import * as helpers from '../lib/helpers';
import { ParsedUrlQuery } from 'querystring';

const usersFiles = files.fileFactory('.data/users');
const { gThan0, eTo10 } = helpers;

export async function post(q: void, h: void, body: int.IncommingBody | undefined): Promise<int.HandlerRes> {
  if (body === undefined || !(body.firstName && body.lastName && body.phone && body.password && body.tosAgreement))
    return {
      statusCode: 400,
      error: "'body' fields are missing or at least one 'body' field is missing",
      payload: undefined,
    };

  const bd = helpers.trimWhiteSpaces(body);

  if (!(gThan0(bd?.firstName) && gThan0(bd?.lastName) && eTo10(bd?.phone) && gThan0(bd?.password) && bd?.tosAgreement))
    return {
      statusCode: 400,
      error: "At least one 'body' field does not meet the requirements",
      payload: undefined,
    };

  if (await usersFiles(bd?.phone)(files.FileOption.EXISTS))
    return { statusCode: 400, error: 'A user with that phone number already exists', payload: undefined };

  const hashedPassword: string | undefined = helpers.hash(bd?.password);
  if (!hashedPassword) return { statusCode: 500, error: "Could not hash the user's password", payload: undefined };

  try {
    const fileData: int.IncommingBody = { ...bd, password: hashedPassword.toString() };
    const { message } = await usersFiles(bd?.phone)(files.FileOption.CREATE, fileData);
    const { password, ...rest } = fileData;
    return { statusCode: 200, error: undefined, payload: { message: message.replace('File', 'User'), data: rest } };
  } catch (error) {
    return { statusCode: 500, error: helpers.getErrorMessage(error), payload: undefined };
  }
}

export async function get(queryParams: ParsedUrlQuery): Promise<int.HandlerRes> {
  if (Object.keys(queryParams).length !== 1 || queryParams.phone === undefined)
    return {
      statusCode: 400,
      error: "Only 'phone' parameter is allowed or 'phone' parameter is missing",
      payload: undefined,
    };

  const phone: string = typeof queryParams.phone === 'string' ? queryParams.phone.trim() : queryParams.phone[0];

  if (!helpers.eTo10(phone))
    return { statusCode: 400, error: "Digits length of 'phone' field isn't 10", payload: undefined };

  // // TODO: Verify with token

  if (!(await usersFiles(phone)(files.FileOption.EXISTS)))
    return { statusCode: 400, error: 'Specified user does not exist', payload: undefined };

  try {
    const {
      payload: { password, ...rest },
    } = await usersFiles(phone)(files.FileOption.READ);
    return { statusCode: 200, error: undefined, payload: { message: 'User data readed successfully', data: rest } };
  } catch (error) {
    return { statusCode: 404, error: helpers.getErrorMessage(error), payload: undefined };
  }
}

export async function put(q: void, h: void, body: int.IncommingBody | undefined): Promise<int.HandlerRes> {
  if (body === undefined || !body.phone)
    return {
      statusCode: 400,
      error: "'body' fields are missing or 'phone' field is missing",
      payload: undefined,
    };

  const bd = helpers.trimWhiteSpaces(body);

  if (!(gThan0(bd?.firstName) || gThan0(bd?.lastName) || gThan0(bd?.password)))
    return { statusCode: 400, error: 'Missing fields to update', payload: undefined };

  // // TODO: Verify with token

  if (!(await usersFiles(bd.phone)(files.FileOption.EXISTS)))
    return { statusCode: 400, error: 'Specified user does not exist', payload: undefined };

  try {
    const { payload: payloadToUpdate } = await usersFiles(bd.phone)(files.FileOption.READ);
    const editedPayload: int.IncommingBody = {
      ...payloadToUpdate,
      firstName: bd.firstName ? bd.firstName : payloadToUpdate.firstName,
      lastName: bd.lastName ? bd.lastName : payloadToUpdate.lastName,
      password: bd.password ? helpers.hash(bd.password)?.toString() : payloadToUpdate.password,
    };

    const { message } = await usersFiles(bd.phone)(files.FileOption.UPDATE, editedPayload);
    const { password: p, ...rest } = editedPayload;
    return {
      statusCode: 200,
      error: undefined,
      payload: { message: message.replace('File', 'User'), data: rest },
    };
  } catch (error) {
    return { statusCode: 500, error: helpers.getErrorMessage(error), payload: undefined };
  }
}

export async function del(queryParams: ParsedUrlQuery): Promise<int.HandlerRes> {
  if (Object.keys(queryParams).length !== 1 || queryParams.phone === undefined)
    return {
      statusCode: 400,
      error: "Only 'phone' parameter is allowed or 'phone' parameter is missing",
      payload: undefined,
    };

  const phone: string = typeof queryParams.phone === 'string' ? queryParams.phone.trim() : queryParams.phone[0];

  if (!helpers.eTo10(phone))
    return { statusCode: 400, error: "Digits length of 'phone' field isn't 10", payload: undefined };

  // TODO: Verify with token

  if (!(await usersFiles(phone)(files.FileOption.EXISTS)))
    return { statusCode: 400, error: 'Specified user does not exist', payload: undefined };

  try {
    const { message } = await usersFiles(phone)(files.FileOption.DELETE);

    // TODO: Delete token ?? checks

    return { statusCode: 200, error: undefined, payload: { message: message.replace('File', 'User') } };
  } catch (error) {
    return { statusCode: 500, error: helpers.getErrorMessage(error), payload: undefined };
  }
}

/** ANNOTATIONS:
 * { message: message.replace('File', 'User')} because 'usersFiles' returns { message: 'File ...' } by default.
 */
