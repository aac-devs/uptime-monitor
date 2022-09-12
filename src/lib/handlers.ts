import * as int from '../interfaces/server.interface';
import * as usersRoutes from '../routes/users.routes';

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

export async function users(data: int.HandlerData): Promise<int.HandlerResponseData> {
  const { method = '', ...rest } = data;
  if (method in usersRoutes.routerMethod) {
    return await usersRoutes.routerMethod[method](rest);
  }
  return { statusCode: 405, error: undefined, payload: { message: 'method not allowed' } };
}
