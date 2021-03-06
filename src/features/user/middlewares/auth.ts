import { Express } from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import config from 'config';
import { expiresIn } from '../utils/date';
import { User } from '../models/user';
import { UsersRepository } from '../repositories';
import { Strategy as LocalStrategy } from 'passport-local';
import { CompareHashFunction } from '../utils/hash';
import { RedisStore } from 'connect-redis';

export const initializeAuthentication = (
  app: Express,
  redisStore: RedisStore,
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

          if (!user || !(await compareHash(user.password, password))) {
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
      store: redisStore,
      resave: false,
      saveUninitialized: false,
      secret: config.get('authentication.secret'),
      cookie: {
        httpOnly: true,
        signed: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production' ? true : false,
        expires: expiresIn(config.get<number>('authentication.ttl')),
      },
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
};
