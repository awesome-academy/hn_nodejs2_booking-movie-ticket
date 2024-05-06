import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import logger from 'morgan';
import i18next from 'i18next';
import i18nextMiddleware from 'i18next-http-middleware';
import i18nextBackend from 'i18next-fs-backend';
import flash from 'connect-flash';
import { AppDataSource } from './config/database';
import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { RootRoute } from './routes';
import { StatusEnum } from './enum/status.enum';
import methodOverride from 'method-override';
import cors from 'cors';
import { initializeTransactionalContext } from 'typeorm-transactional';
import ngrok from 'ngrok';

async function main() {
  initializeTransactionalContext();
  const app = express();
  const host = process.env.HOST;
  const port = +process.env.PORT;

  app.locals.keepingSeats = {};

  app.locals.billRequestDto = {};

  try {
    await AppDataSource.initialize();
  } catch (err) {
    console.error('Error during Data Source initialization', err);
  }
  console.log('Data Source has been initialized!');
  // Serve static files
  app.use(express.static(path.join(__dirname, 'public')));

  // Parse URL-encoded and JSON bodies
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // middleware for method override
  // because form html only support GET, POST method not support
  // PUT, DELETE method
  app.use(methodOverride('_method'));

  // Middleware set header X-Frame-Options against click jacking
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    next();
  });

  await i18next
    .use(i18nextBackend)
    .use(i18nextMiddleware.LanguageDetector)
    .init({
      fallbackLng: 'vi',
      preload: ['vi', 'en'],
      supportedLngs: ['vi', 'en'],
      saveMissing: true,
      backend: {
        loadPath: path.join(__dirname, 'locales/{{lng}}/{{ns}}.json'),
        addPath: path.join(__dirname, 'locales/{{lng}}/{{ns}}.missing.json'),
      },
      detection: {
        order: ['querystring', 'cookie'],
        caches: ['cookie'],
        lookupQuerystring: 'locale', //query string on url (?locale=en/vi)
        lookupCookie: 'locale',
        ignoreCase: true,
        cookieSecure: false,
      },
    });

  app.use(i18nextMiddleware.handle(i18next));

  // Use cookie-parser middleware
  app.use(cookieParser('keyboard cat'));
  // session middleware config
  app.use(
    session({
      secret: process.env.SESSION_SECRET_KEY,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,
      },
    }),
  );
  app.use(flash());

  // Set view engine
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  // Parse cookies
  app.use(cookieParser());

  // HTTP logger
  app.use(logger('dev'));

  // CORS middleware
  app.use('*', cors());

  // Global variables
  app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.activeHeader = null;
    next();
  });

  // Use router
  const rootRoute = container.resolve(RootRoute);
  app.use(rootRoute.getRouter());

  // Error handling middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    switch (err.status) {
      case StatusEnum.NOT_FOUND:
        res.render('error/error', {
          title: `${err.message}`,
          content: err.message,
        });
        break;
      case StatusEnum.BAD_REQUEST:
        res.render('error/error', {
          title: 'Error 400',
          content: `${err.message}`,
        });
        break;
      case StatusEnum.FORBIDDEN:
        res.render('error/error', {
          title: 'Error 403',
          content: `${err.message}`,
        });
        break;
      default: // error when render view
        console.log('>> error:', err);
        res.render('error', {
          stackTrace: err.stack || err.message,
        });
    }
  });

  app.all('*', (req: Request, res: Response, next: NextFunction) => {
    res.status(404).render('error/error', {
      title: 'Error 404',
      content: '404 Not Found',
    });
  });

  // Start server
  app.listen(port, host, () => {
    console.log(`App listening on port ${port}`);
    ngrok
      .connect(port)
      .then((ngrokUrl) => {
        process.env.momo_IpnUrl = ngrokUrl;
        console.log(`Ngrok tunnel in: ${ngrokUrl}`);
      })
      .catch((error) => {
        console.log(`Couldn't tunnel ngrok: ${error}`);
      });
  });
}

main();
