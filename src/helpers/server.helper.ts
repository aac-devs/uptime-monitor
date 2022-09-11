import * as int from '../interfaces/server.interface';

export function parseJsonToObject(str: string): object {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (err) {
    return {};
  }
}

export function requestEndPromisify(params: int.RequestEndParams): Promise<string> {
  const { decoder, request } = params;
  return new Promise((resolve) => request.on('end', () => resolve(decoder.end())));
}

export function logResponse(params: int.LogData): void {
  const { statusCode, trimmedPath, method } = params;
  const color = statusCode === 200 ? '32' : '31';
  const colorConfig = `\x1b[${color}m%s\x1b[0m`;
  const message = `${method?.toUpperCase()} /${trimmedPath} ${statusCode}`;

  console.log(colorConfig, message);
}

//   colorCode(colorString: string) {
//     if (colorString === 'magenta') return '35';
//     if (colorString === 'cyan') return '36';
//   },
// };
