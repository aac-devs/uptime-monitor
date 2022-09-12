import * as int from '../interfaces/server.interface';

export async function post(data: int.HandlerData): Promise<int.HandlerResponseData> {
  return { statusCode: 200, error: undefined, payload: { message: 'tokens post' } };
}

export async function get(data: int.HandlerData): Promise<int.HandlerResponseData> {
  return { statusCode: 200, error: undefined, payload: { message: 'tokens get' } };
}

export async function put(data: int.HandlerData): Promise<int.HandlerResponseData> {
  return { statusCode: 200, error: undefined, payload: { message: 'tokens put' } };
}

export async function del(data: int.HandlerData): Promise<int.HandlerResponseData> {
  return { statusCode: 200, error: undefined, payload: { message: 'tokens delete' } };
}
