import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ActiveUserData } from '../active-user-data';
import { REQUEST_USER_KEY } from '../iam.constants';

export const ActiveUser = createParamDecorator(
  /**
   *
   * @param field The field to "pick" from the user object.
   * @param ctx The current execution context.
   * @returns If a `field` parameter is given, then the value of the corresponding field is returned;
   * otherwise the `user` property from the `Request` object is returned.
   */
  (field: keyof ActiveUserData, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: ActiveUserData | undefined = request[REQUEST_USER_KEY];
    return field ? user[field] : user;
  },
);
