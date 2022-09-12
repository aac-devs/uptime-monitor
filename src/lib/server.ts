import http, { IncomingMessage, ServerResponse } from 'http';
import { parse, UrlWithParsedQuery } from 'url';
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

async function parseRequest(reqParams: int.RequestListenerData): Promise<int.ParsedData | boolean> {
  const { url, method, headers }: IncomingMessage = reqParams.request;

  if (!(url && method)) return false;
  const { pathname, query }: UrlWithParsedQuery = parse(url, true);

  if (!(pathname && query)) return false;
  return {
    trimmedPath: pathname.replace(/^\/+|\/+$/g, ''),
    queryStringObject: query,
    method: method.toLowerCase(),
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
    method,
    trimmedPath,
    headers,
    queryStringObject,
    payload: helpers.parseJsonToObject(buffer),
  };

  const handlerResponse: int.HandlerResponseData =
    trimmedPath in handlers.router ? await handlers.router[trimmedPath](handlerData) : await handlers.notFound();

  return { ...handlerResponse, trimmedPath, method };
}

async function handleResponse(data: int.ServerResponseData, { response }: int.RequestListenerData): Promise<void> {
  const { statusCode, error, payload, trimmedPath, method } = data;

  const answerMessage = error ? { error } : payload;

  response?.setHeader('Content-Type', 'application/json').writeHead(statusCode).end(JSON.stringify(answerMessage));
  helpers.logResponse({ statusCode, trimmedPath, method });
}

async function server(serverParams: int.RequestListenerData) {
  const params = await parseRequest(serverParams);
  if (typeof params === 'object') {
    await handleResponse(await handleRequest(params, serverParams), serverParams);
  }
}
