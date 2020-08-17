import { Express, RequestHandler } from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import config from 'config';
import { expiresIn } from '../utils/date';
import { User } from '../models/user';
import { UsersRepository } from '../repositories';
import { Strategy as LocalStrategy } from 'passport-local';
import { CompareHashFunction } from '../utils/hash';

export const initializeAuthentication = (
  app: Express,
  userRepository: UsersRepository,
  compareHash: CompareHashFunction
) => {
  passport.serializeUser<User, number>((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser<User, number>(async (id, done) => {
    try {
      const user = await userRepository.findOne({ id });
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          const user = await userRepository.findOne({ email });

          if (!user || !compareHash(user.password, password)) {
            return done(null, false, { message: 'Wrong username or password' });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  app.use(cookieParser(config.get('authentication.secret')));
  app.use(
    session({
      resave: false,
      saveUninitialized: false,
      secret: config.get('authentication.secret'),
      cookie: {
        httpOnly: true,
        signed: true,
        secure: process.env.NODE_ENV === 'production' ? true : false,
        expires: expiresIn(config.get<number>('authentication.ttl')),
      },
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
};

export const authenticated: RequestHandler = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.status(401);
    next(new Error('Not authenticated.'));
  }
};
