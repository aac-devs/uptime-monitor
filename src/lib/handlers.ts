import * as int from '../interfaces/server.interface';

export const router: int.RouterOptions = {
  ping,
  notFound,
  users,
};

export async function ping(): Promise<int.HandlerResponseData> {
  return { statusCode: 200, payload: { message: 'ping respond' } };
}

export async function notFound(): Promise<int.HandlerResponseData> {
  return { statusCode: 404, payload: { message: 'not found respond' } };
}

export async function users(data: int.ParsedData): Promise<int.HandlerResponseData> {
  const { method = '' } = data;
  if (['post', 'get', 'put', 'delete'].includes(method)) {
    return { statusCode: 200, payload: { message: 'users respond' } };
  }
  return { statusCode: 405, payload: { message: 'method not allowed' } };
}
