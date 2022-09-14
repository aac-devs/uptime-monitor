import * as int from './interfaces';
import * as usersRoutes from '../routes/users.routes';
import * as tokensRoutes from '../routes/tokens.routes';
import { ParsedUrlQuery } from 'querystring';
import { IncomingHttpHeaders } from 'http';

async function ping(): Promise<int.HandlerRes> {
  return { statusCode: 200, payload: { message: 'ping respond' } };
}

async function notFound(): Promise<int.HandlerRes> {
  return { statusCode: 404, payload: { message: 'not found respond' } };
}

const users = handlerFactory(usersRoutes);
const tokens = handlerFactory(tokensRoutes);

function handlerFactory(handlerRoute: int.HandlerRoute): Function {
  return async function (
    method: string,
    queryParams: ParsedUrlQuery | undefined,
    headers: IncomingHttpHeaders | undefined,
    incommingBody: int.IncommingBody | undefined
  ): Promise<int.HandlerRes> {
    const handlerMethod = method === 'delete' ? 'del' : method;
    if (handlerMethod in handlerRoute) return await handlerRoute[handlerMethod](queryParams, headers, incommingBody);
    return { statusCode: 405, error: undefined, payload: { message: 'method not allowed' } };
  };
}

export const router: int.RouterOptions = {
  ping,
  notFound,
  users,
  tokens,
};
