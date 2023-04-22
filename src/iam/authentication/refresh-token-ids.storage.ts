import { Injectable } from '@nestjs/common/decorators';
import { RedisService } from '../../redis/redis.service';
import { InvalidatedRefreshTokenError } from './errors';

@Injectable()
export class RefreshTokenIdsStorage {
  constructor(private redisService: RedisService) {}

  /**
   * Insert the <key, value> pair into the db.
   * @param userId user id
   * @param refreshTokenId refresh token id
   */
  async insert(userId: string, refreshTokenId: string): Promise<void> {
    await this.redisService.set(userId, refreshTokenId);
  }

  async validate(userId: string, tokenId: string): Promise<boolean> {
    const storedId = await this.redisService.get(userId);
    if (storedId !== tokenId) {
      throw new InvalidatedRefreshTokenError();
    }
    return true;
  }

  /**
   * Remove the ID entry from the db.
   * @param userId
   */
  async invalidate(userId: string): Promise<void> {
    await this.redisService.del(userId);
  }
}
