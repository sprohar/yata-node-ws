import { Injectable } from '@nestjs/common';
import { HashingService } from './hashing.service';
import { hash, verify } from 'argon2';

@Injectable()
export class ArgonService implements HashingService {
  hash(data: string | Buffer): Promise<string> {
    return hash(data)
  }
  compare(data: string | Buffer, encrypted: string): Promise<boolean> {
    return verify(encrypted, data);
  }
}
