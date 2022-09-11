import { IncomingHttpHeaders } from 'http';
import { ParsedUrlQuery } from 'querystring';

interface IObjectKeys {
  [key: string]: string | undefined;
}

export interface DataResponse {
  trimmedPath?: string;
  queryStringObject?: ParsedUrlQuery;
  method?: string;
  headers: IncomingHttpHeaders;
  payload?: JSON;
}

export interface DataParsed {
  trimmedPath: string;
  queryStringObject: ParsedUrlQuery;
  method?: string;
  headers: IncomingHttpHeaders;
}

export interface LogServer {
  color: string;
  port: number;
  envName: string;
}

export interface RouterOptions {
  [index: string]: Function;
}
