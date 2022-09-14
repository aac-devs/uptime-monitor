import * as int from '../lib/interfaces';
import * as files from '../lib/data';
import * as helpers from '../lib/helpers';
import { ParsedUrlQuery } from 'querystring';

const usersFiles = files.fileFactory('.data/users');
const tokenFiles = files.fileFactory('.data/tokens');
const { gThan0, eTo10, eTo20 } = helpers;

export async function verifyToken(id: string, phone: string): Promise<boolean> {
  try {
    const tokenData = await tokenFiles(id)(files.FileOption.READ);
    const tokenToValidate: int.StoredTokenData = tokenData.payload;
    if (tokenToValidate.phone === phone && tokenToValidate.expires > Date.now()) return true;
    return false;
  } catch (error) {
    return false;
  }
}

export async function post(q: void, h: void, body: int.IncommingBody | undefined): Promise<int.HandlerRes> {
  if (body === undefined || !(body.phone && body.password))
    return {
      statusCode: 400,
      error: "'body' fields are missing or at least one 'body' field is missing",
      payload: undefined,
    };

  const bd = helpers.trimWhiteSpaces(body);

  if (!(eTo10(bd?.phone) && gThan0(bd?.password)))
    return {
      statusCode: 400,
      error: "At least one 'body' field does not meet the requirements",
      payload: undefined,
    };

  if (!(await usersFiles(bd.phone)(files.FileOption.EXISTS)))
    return { statusCode: 400, error: 'Specified user does not exist', payload: undefined };

  try {
    const {
      payload: { password: storedPassword },
    } = await usersFiles(bd.phone)(files.FileOption.READ);

    if (storedPassword !== helpers.hash(bd.password))
      return {
        statusCode: 400,
        error: "Password did not match the specified user's stored password",
        payload: undefined,
      };

    const expires = Date.now() + 1000 * 60 * 60;
    const tokenId: string | undefined = helpers.createRandomString(20);

    if (!(bd.phone && tokenId)) return { statusCode: 400, error: 'Could not create the new token', payload: undefined };

    const tokenObject: int.StoredTokenData = { phone: bd.phone, tokenId, expires };
    const { message } = await tokenFiles(tokenId)(files.FileOption.CREATE, tokenObject);
    return {
      statusCode: 200,
      error: undefined,
      payload: { message: message.replace('File', 'Token'), data: tokenObject },
    };
  } catch (error) {
    return { statusCode: 404, error: helpers.getErrorMessage(error), payload: undefined };
  }
}

export async function get(queryParams: ParsedUrlQuery): Promise<int.HandlerRes> {
  if (Object.keys(queryParams).length !== 1 || queryParams.id === undefined)
    return {
      statusCode: 400,
      error: "Only 'id' parameter is allowed or 'id' parameter is missing",
      payload: undefined,
    };

  const id: string = typeof queryParams.id === 'string' ? queryParams.id.trim() : queryParams.id[0];

  if (!helpers.eTo20(id)) return { statusCode: 400, error: "Digits length of 'id' field isn't 20", payload: undefined };

  if (!(await tokenFiles(id)(files.FileOption.EXISTS)))
    return { statusCode: 400, error: 'Specified user does not exist', payload: undefined };

  try {
    const { payload } = await tokenFiles(id)(files.FileOption.READ);
    return { statusCode: 200, error: undefined, payload: { message: 'Token data readed successfully', data: payload } };
  } catch (error) {
    return { statusCode: 404, error: helpers.getErrorMessage(error), payload: undefined };
  }
}

export async function put(q: void, h: void, body: int.IncommingBody | undefined): Promise<int.HandlerRes> {
  if (body === undefined || !(body.id && body.extend))
    return {
      statusCode: 400,
      error: "'body' fields are missing or at least one 'body' field is missing",
      payload: undefined,
    };

  const bd = helpers.trimWhiteSpaces(body);

  if (!(eTo20(bd?.id) && bd?.extend))
    return {
      statusCode: 400,
      error: "At least one 'body' field does not meet the requirements",
      payload: undefined,
    };

  if (!(await tokenFiles(bd.id)(files.FileOption.EXISTS)))
    return { statusCode: 400, error: 'Specified user does not exist', payload: undefined };

  try {
    const tokenData = await tokenFiles(bd.id)(files.FileOption.READ);
    const tokenToUpdate: int.StoredTokenData = tokenData.payload;
    const { expires } = tokenToUpdate;
    if (expires < Date.now())
      return {
        statusCode: 400,
        error: 'The token has already expired, and cannot be extended',
        payload: undefined,
      };

    const editedToken = { ...tokenToUpdate, expires: Date.now() + 1000 * 60 * 60 };

    const { message } = await tokenFiles(bd.id)(files.FileOption.UPDATE, editedToken);
    return {
      statusCode: 200,
      error: undefined,
      payload: { message: message.replace('File', 'User'), data: editedToken },
    };
  } catch (error) {
    return { statusCode: 404, error: helpers.getErrorMessage(error), payload: undefined };
  }
}

export async function del(queryParams: ParsedUrlQuery): Promise<int.HandlerRes> {
  if (Object.keys(queryParams).length !== 1 || queryParams.id === undefined)
    return {
      statusCode: 400,
      error: "Only 'id' parameter is allowed or 'id' parameter is missing",
      payload: undefined,
    };

  const id: string = typeof queryParams.id === 'string' ? queryParams.id.trim() : queryParams.id[0];

  if (!helpers.eTo20(id)) return { statusCode: 400, error: "Digits length of 'id' field isn't 20", payload: undefined };

  if (!(await tokenFiles(id)(files.FileOption.EXISTS)))
    return { statusCode: 400, error: 'Specified token does not exist', payload: undefined };

  try {
    const { message } = await tokenFiles(id)(files.FileOption.DELETE);
    return { statusCode: 200, error: undefined, payload: { message: message.replace('File', 'Token') } };
  } catch (error) {
    return { statusCode: 404, error: helpers.getErrorMessage(error), payload: undefined };
  }
}

/** ANNOTATIONS:
 * { message: message.replace('File', 'User')} because 'usersFiles' returns { message: 'File ...' } by default.
 */
