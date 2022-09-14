import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'http';
import { ParsedUrlQuery } from 'querystring';
import { StringDecoder } from 'string_decoder';

export interface RequestListenerData {
  request: IncomingMessage;
  response?: ServerResponse;
}

export interface ParsedData {
  trimmedPath: string;
  queryStringObject: ParsedUrlQuery;
  method: string;
  headers: IncomingHttpHeaders;
}

export interface IncommingBody {
  phone?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  tosAgreement?: boolean;
  id?: string;
  extend?: boolean;
}

export interface StoredTokenData {
  phone: string;
  tokenId: string;
  expires: number;
}

export interface HandlerRoute {
  [index: string]: Function;
  post: Function;
  get: Function;
  put: Function;
  del: Function;
}

export interface HandlerRes {
  statusCode: number;
  payload?: object;
  error?: string;
}

export interface ServerResponseData extends HandlerRes {
  trimmedPath?: string;
  method?: string;
}

export interface RequestEndParams {
  decoder: StringDecoder;
  request: IncomingMessage;
}

export interface RouterOptions {
  [index: string]: Function;
}

export interface LogData {
  statusCode: number;
  method?: string;
  trimmedPath?: string;
}

export interface FileManager {
  dirPath?: string;
  (fileName: string): Function;
}

export interface ManageFileOptions {
  [index: string]: Function;
}
