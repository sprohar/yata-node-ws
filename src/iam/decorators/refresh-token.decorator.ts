import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { COOKIE_REFRESH_TOKEN_KEY } from '../iam.constants';

export const RefreshToken = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.cookies[COOKIE_REFRESH_TOKEN_KEY] ?? request.cookies;
  },
);
