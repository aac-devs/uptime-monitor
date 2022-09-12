import * as int from '../interfaces/server.interface';

export async function post(data: int.HandlerData): Promise<int.HandlerResponseData> {
  return { statusCode: 200, error: undefined, payload: { message: 'checks post' } };
}

export async function get(data: int.HandlerData): Promise<int.HandlerResponseData> {
  return { statusCode: 200, error: undefined, payload: { message: 'checks get' } };
}

export async function put(data: int.HandlerData): Promise<int.HandlerResponseData> {
  return { statusCode: 200, error: undefined, payload: { message: 'checks put' } };
}

export async function del(data: int.HandlerData): Promise<int.HandlerResponseData> {
  return { statusCode: 200, error: undefined, payload: { message: 'checks delete' } };
}
