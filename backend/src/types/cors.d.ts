declare module 'cors' {
  import express = require('express');
  function cors(options?: cors.CorsOptions): express.RequestHandler;
  namespace cors {
    interface CorsOptions {
      origin?: string | RegExp | (string | RegExp)[] | boolean | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void);
      credentials?: boolean;
      methods?: string | string[];
      allowedHeaders?: string | string[];
      exposedHeaders?: string | string[];
      maxAge?: number;
      preflightContinue?: boolean;
      optionsSuccessStatus?: number;
    }
  }
  export = cors;
}
