import { Test, TestingModule } from '@nestjs/testing';
import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptoService],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should hash a string', async () => {
    const hash = await service.hashString('test');

    expect(hash).toBeDefined();
    expect(hash).not.toBe('test');
  });

  it('should return different hashes for different strings', async () => {
    const hash1 = service.hashString('test1');
    const hash2 = service.hashString('test2');

    expect(hash1).not.toBe(hash2);
  });

  it('should compare a string with a hash', async () => {
    const hash = await service.hashString('test');
    const result = await service.compareStringWithHash('test', hash);

    expect(result).toBe(true);
  });

  it('should return false for different strings', async () => {
    const hash = await service.hashString('test');
    const result = await service.compareStringWithHash('test1', hash);

    expect(result).toBe(false);
  });
});
