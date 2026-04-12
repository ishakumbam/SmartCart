import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type Target = 'body' | 'query' | 'params';

export const validate =
  <T>(schema: ZodSchema<T>, target: Target = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.parse(req[target]);
    Object.assign(req[target], parsed);
    next();
  };
