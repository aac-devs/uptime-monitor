import http, { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import { StringDecoder } from 'string_decoder';
import config from './config';
import * as handlers from './handlers';
import * as int from '../interfaces/server.interface';
import * as helpers from '../helpers/server.helper';
const { httpPort: port, envName } = config;

export function main() {
  try {
    http
      .createServer((request: IncomingMessage, response: ServerResponse) => server({ request, response }))
      .listen(3000, () =>
        console.log(`\x1b[35m%s\x1b[0m`, `The server is listening on port ${port} in ${envName} mode`.toUpperCase())
      );
  } catch (error) {
    console.log(error);
  }
}

async function parseRequest(reqParams: int.RequestListenerData): Promise<int.ParsedData> {
  const { url, method, headers } = reqParams.request;
  const { pathname, query } = parse(url || '', true);

  return {
    trimmedPath: pathname?.replace(/^\/+|\/+$/g, '') || '',
    queryStringObject: query,
    method: method?.toLowerCase(),
    headers,
  };
}

async function handleRequest(parsed: int.ParsedData, reqRes: int.RequestListenerData): Promise<int.ServerResponseData> {
  const { trimmedPath, method, queryStringObject, headers } = parsed;
  const { request } = reqRes;
  const decoder = new StringDecoder('utf-8');

  let buffer = '';
  request.on('data', (data) => (buffer += decoder.write(data)));
  const remainingData = await helpers.requestEndPromisify({ decoder, request });
  buffer += remainingData;

  const handlerData: int.HandlerData = {
    trimmedPath,
    queryStringObject,
    method,
    headers,
    payload: helpers.parseJsonToObject(buffer),
  };

  const handlerResponse: int.HandlerResponseData =
    trimmedPath in handlers.router ? await handlers.router[trimmedPath](handlerData) : await handlers.notFound();

  return { ...handlerResponse, trimmedPath, method };
}

async function handleResponse(data: int.ServerResponseData, { response }: int.RequestListenerData): Promise<void> {
  const { statusCode, error, payload, trimmedPath, method } = data;

  response?.setHeader('Content-Type', 'application/json').writeHead(statusCode).end(JSON.stringify(payload));
  helpers.logResponse({ statusCode, trimmedPath, method });
}

async function server(serverParams: int.RequestListenerData) {
  await handleResponse(await handleRequest(await parseRequest(serverParams), serverParams), serverParams);
}
