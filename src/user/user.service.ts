import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './user.dto';
import { UserAlereadyExists } from './errors/UserAlreadyExists';
import { CryptoService } from '../crypto/crypto.service';

export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cryptoService: CryptoService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User();

    user.username = createUserDto.username;
    user.email = createUserDto.email;
    user.password = await this.cryptoService.hashString(createUserDto.password);

    if (await this.userExists(user)) {
      throw new UserAlereadyExists();
    }

    await this.userRepository.insert(user);

    return user;
  }

  private async userExists(user: User): Promise<boolean> {
    return (
      (await this.userRepository.findOneBy([
        { username: user.username },
        { email: user.email },
      ])) !== null
    );
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOneBy({ username });
  }

  async usernameExists(username: string): Promise<boolean> {
    return (await this.userRepository.countBy({ username })) > 0;
  }

  async emailExists(email: string): Promise<boolean> {
    return (await this.userRepository.countBy({ email })) > 0;
  }
}
