import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../modules/user/user.entity';
import { LoginDto } from './dto/login.dto';
import { MobileLoginDto, VerifyOtpDto, SocialLoginDto } from './dto/auth-actions.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email, isActive: true },
      relations: ['roles', 'roles.permissions'],
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }

    return null;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.generateTokenResponse(user);
  }

  async sendOtp(mobileLoginDto: MobileLoginDto) {
    const { phoneNumber } = mobileLoginDto;

    // Find or create user
    let user = await this.userRepository.findOne({
      where: { phoneNumber },
    });

    if (!user) {
      user = this.userRepository.create({
        phoneNumber,
        authProvider: 'mobile',
        isActive: true, // Auto-activate for mobile users? Or verification needed?
        // Other fields like name will be filled during onboarding
      });
      await this.userRepository.save(user);
    }

    // Generate fake OTP
    const otp = '123456'; // Fixed for testing as per request "fake sms service"
    const otpExpiresAt = new Date();
    otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 10); // 10 mins expiry

    // Save OTP (need to update Entity to allow saving these, already done)
    // We need to use query builder or save with specific logic if select: false is an issue, 
    // but repository.save handles entities.
    // However, since OTP is select: false, we might need to be careful not to overwrite it if we loaded user without it?
    // Actually simpler: just update the columns.
    await this.userRepository.update(user.id, {
      otp,
      otpExpiresAt,
    });

    console.log(`[FAKE SMS] OTP for ${phoneNumber} is ${otp}`);

    return {
      message: 'OTP sent successfully',
      debug_otp: otp, // For convenience in development
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { phoneNumber, otp } = verifyOtpDto;

    // We need to select OTP fields to verify
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.otp')
      .addSelect('user.otpExpiresAt')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('roles.permissions', 'permissions')
      .where('user.phoneNumber = :phoneNumber', { phoneNumber })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.otp !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    if (user.otpExpiresAt < new Date()) {
      throw new UnauthorizedException('OTP expired');
    }

    // Clear OTP
    await this.userRepository.update(user.id, {
      otp: null,
      otpExpiresAt: null,
    });

    return this.generateTokenResponse(user);
  }

  async socialLoginStub(socialLoginDto: SocialLoginDto) {
    const { email, provider, name } = socialLoginDto;

    let user = await this.userRepository.findOne({
      where: { email }, // Assuming email is unique across providers or we link them
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      user = this.userRepository.create({
        email,
        authProvider: provider,
        name: name || 'New User',
        isActive: true,
      });
      await this.userRepository.save(user);
    } else {
      // Use existing user, maybe update provider if different? 
      // For now, simpler is better.
    }

    return this.generateTokenResponse(user);
  }

  private generateTokenResponse(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload);

    // Return user info without sensitive data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, otp, otpExpiresAt, ...userInfo } = user as any;

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      user: userInfo,
    };
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
