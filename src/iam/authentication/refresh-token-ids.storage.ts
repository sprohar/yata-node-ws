import { Injectable } from '@nestjs/common/decorators';
import {
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common/interfaces';
import { RedisService } from '../../redis/redis.service';
import { InvalidatedRefreshTokenError } from './errors';

@Injectable()
export class RefreshTokenIdsStorage
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  constructor(private redisService: RedisService) {}

  onApplicationBootstrap() {}

  onApplicationShutdown(_signal?: string) {
    this.redisService.quit();
  }

  /**
   * Insert the <key, value> pair into the db.
   * @param userId key
   * @param tokenId value
   */
  async insert(userId: string, tokenId: string): Promise<void> {
    await this.redisService.set(this.getKey(userId), tokenId);
  }

  async validate(userId: string, tokenId: string): Promise<boolean> {
    const storedId = await this.redisService.get(this.getKey(userId));
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
    await this.redisService.del(this.getKey(userId));
  }

  private getKey(userId: string): string {
    return `user-${userId}`;
  }
}
