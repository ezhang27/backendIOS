import { AuthenticatedRequest } from '../clerk/auth';
import { Router as ExpressRouter, RequestHandler, IRouterMatcher } from 'express';

declare global {
  namespace Express {
    interface Router extends ExpressRouter {
      get: CustomRouterMatcher<this>;
      post: CustomRouterMatcher<this>;
      put: CustomRouterMatcher<this>;
      delete: CustomRouterMatcher<this>;
      patch: CustomRouterMatcher<this>;
      options: CustomRouterMatcher<this>;
      head: CustomRouterMatcher<this>;
    }
  }
}

interface CustomRouterMatcher<T> extends IRouterMatcher<T> {
  (path: string, ...handlers: Array<RequestHandler<any, any, any, any> | ((req: AuthenticatedRequest, res: any, next: any) => any)>): T;
}

export {}; 