import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.users.findOne({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.users.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      name: dto.name.trim(),
      businessName: dto.businessName?.trim() || `${dto.name.trim()}'s Studio`,
    });
    await this.users.save(user);
    return this.tokenResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findOne({ where: { email: dto.email.toLowerCase() } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return this.tokenResponse(user);
  }

  async me(userId: string) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return this.publicUser(user);
  }

  private tokenResponse(user: User) {
    const accessToken = this.jwt.sign({ sub: user.id, email: user.email });
    return { accessToken, user: this.publicUser(user) };
  }

  private publicUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      businessName: user.businessName,
      currency: user.currency,
    };
  }
}
