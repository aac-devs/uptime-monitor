/**
 * SERVER.JS
 *
 */

// Dependencies
import http from 'http';
import https from 'https';
import path from 'path';
import url from 'url';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { StringDecoder } from 'string_decoder';
import config from './config.mjs';
import helpers from './helpers.mjs';
import handlers from './handlers.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { httpPort, httpsPort, envName } = config;
const { colorCode, parseJsonToObject } = helpers;

export default {
  logServer(color, port, envName) {
    console.log(
      `\x1b[${colorCode(color)}m%s\x1b[0m`,
      `The server is listening on port ${port} in ${envName} mode`
    );
  },

  httpServer() {
    http
      .createServer((req, res) => {
        this.unifiedServer(req, res);
      })
      .listen(httpPort, () => this.logServer('cyan', httpPort, envName));
  },

  httpsServer() {
    https
      .createServer(
        {
          key: readFileSync(path.join(__dirname, '/../https/key.pem')),
          cert: readFileSync(path.join(__dirname, '/../https/cert.pem')),
        },
        (req, res) => this.unifiedServer(req, res)
      )
      .listen(httpsPort, () => this.logServer('magenta', httpsPort, envName));
  },

  parseRequest({ url: reqUrl, method, headers }) {
    const { pathname, query } = url.parse(reqUrl, true);
    return {
      trimmedPath: pathname.replace(/^\/+|\/+$/g, ''),
      queryStringObject: query,
      method: method.toLowerCase(),
      headers,
    };
  },

  unifiedServer(req, res) {
    const { trimmedPath, queryStringObject, method, headers } =
      this.parseRequest(req);

    // Get the payload, if any
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => (buffer += decoder.write(data)));

    req.on('end', () => {
      buffer += decoder.end();

      const chosenHandler =
        typeof this.router[trimmedPath] !== 'undefined'
          ? this.router[trimmedPath]
          : this.router.notFound;

      const data = {
        trimmedPath,
        queryStringObject,
        method,
        headers,
        payload: parseJsonToObject(buffer),
      };

      this.handleRequest({ fn: chosenHandler, data, res });
    });
  },

  async handleRequest({ fn, data, res }) {
    try {
      const { method, trimmedPath } = data;
      const resp = await fn(data);
      const { statusCode = 200, payload = {} } = resp;
      const payloadString = JSON.stringify(payload);

      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      if (statusCode == 200)
        return console.log(
          '\x1b[32m%s\x1b[0m',
          `${method.toUpperCase()} /${trimmedPath} ${statusCode}`
        );

      console.log(
        '\x1b[31m%s\x1b[0m',
        `${method.toUpperCase()} /${trimmedPath} ${statusCode}`
      );
    } catch (error) {
      console.log(error);
    }
  },

  router: {
    ping: handlers.ping,
    notFound: handlers.notFound,
  },

  init() {
    this.httpServer();
    this.httpsServer();
  },
};
