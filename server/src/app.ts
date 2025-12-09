import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request } from "express";
import morgan from "morgan";
import { BadRequestError } from "./errors/http/bad-request.error";
import { NotFoundError } from "./errors/http/not-found.error";
import db from "./lib/db";
import env from "./lib/env";
import errorHandler from "./lib/error-handler";
import { isAuthRequest } from "./middlewares/is-auth";
import { Router } from "./utils/router";
import translator from "./utils/translator";
import path from "path";
import { requestLogger } from "./middlewares/request-logger";
const app = express();
const router = new Router();
app.set('trust proxy', true)
app.use(cors({ origin: env.get('CLIENT_URL'), credentials: true }))
app.use(translator.translate());
app.use(express.json({
  verify: (req: Request, res, buf, encoding) => {
    try {
      if (buf.length)
        JSON.parse(buf.toString());
    } catch (e) {
      throw new BadRequestError(req.t('invalid_json_body'));
    }
  }
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.raw({ limit: 10 * 1 << 20 }))
app.use(cookieParser());
if (env.get('APP_ENV') === 'local' && env.get('MEDIA_PROVIDER') === 'localfs') {
  console.debug('here')
  app.use('/uploads', express.static(path.join(process.cwd(), '/uploads'), {
    acceptRanges: true,
    lastModified: true,
  }))
}

// app.use(morgan('combined'));
app.use(requestLogger())
app.get('/api/v1/ready', (_req, res) => { res.json({ message: 'OK' }); });
app.get('/api/v1/health-check', async (_req, res) => { res.json({ db: await db.healthCheck() }); });
app.all('/api/v1/:module/:action?/:id?', isAuthRequest(), router.handle);
app.all('*', (_, __, next) => { next(new NotFoundError()) });
app.use(errorHandler());

export default app;