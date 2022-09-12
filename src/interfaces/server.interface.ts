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

export interface PayloadData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  password?: string;
  tosAgreement?: boolean;
}

export interface HandlerData extends ParsedData {
  payload?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    password?: string;
    tosAgreement?: boolean;
  };
}

export interface HandlerResponseData {
  statusCode: number;
  payload?: object;
  error?: string;
}

export interface ServerResponseData extends HandlerResponseData {
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
