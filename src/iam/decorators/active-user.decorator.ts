import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ActiveUserData } from '../active-user-data';

export const ActiveUser = createParamDecorator(
  /**
   *
   * @param field The field to "pick" from the user object.
   * @param ctx The current execution context.
   * @returns If a `field` parameter is given, then the value of the corresponding field is returned;
   * otherwise the `user` property from the `Request` object is returned.
   */
  (field: keyof ActiveUserData, ctx: ExecutionContext) => {
    // https://www.npmjs.com/package/express-oauth2-jwt-bearer
    const request = ctx.switchToHttp().getRequest();
    // const user: ActiveUserData | undefined = request[REQUEST_USER_KEY];
    const auth = request['auth'];
    const payload = auth.payload;
    return field ? payload?.[field] : payload;
  },
);
