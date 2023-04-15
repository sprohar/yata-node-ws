import { SetMetadata } from '@nestjs/common';
import { AuthType } from '../enums';
import { AUTH_TYPE_KEY } from './auth.decorator';

export const Public = () => SetMetadata(AUTH_TYPE_KEY, [AuthType.NONE]);
