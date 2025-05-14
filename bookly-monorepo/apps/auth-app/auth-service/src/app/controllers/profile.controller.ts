import { Controller, Get, Put, Body, Req } from '@nestjs/common';
import { ProfileService } from '../services/profile.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { Logger } from '@bookly-monorepo/logging';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService, private readonly logger: Logger) {}

  @Get()
  async getProfile(@Req() req, @I18n() i18n: I18nContext) {
    this.logger.info('Get profile', { userId: req.user?.id });
    return this.profileService.getProfile(req.user, i18n);
  }

  @Put()
  async updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto, @I18n() i18n: I18nContext) {
    this.logger.info('Update profile', { userId: req.user?.id });
    return this.profileService.updateProfile(req.user, updateProfileDto, i18n);
  }
}
