import { Injectable } from '@nestjs/common';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { I18nContext } from 'nestjs-i18n';
import { Logger } from '@bookly-monorepo/logging';

@Injectable()
export class ProfileService {
  constructor(private readonly logger: Logger) {}

  async getProfile(user: any, i18n: I18nContext) {
    // Simulación de obtención de perfil
    this.logger.info('Profile fetched', { userId: user?.id });
    return {
      message: await i18n.t('profile.FETCH_SUCCESS'),
      profile: { id: user?.id, email: user?.email },
    };
  }

  async updateProfile(user: any, updateProfileDto: UpdateProfileDto, i18n: I18nContext) {
    // Simulación de actualización de perfil
    this.logger.info('Profile updated', { userId: user?.id });
    return {
      message: await i18n.t('profile.UPDATE_SUCCESS'),
      profile: { ...updateProfileDto, id: user?.id },
    };
  }
}
