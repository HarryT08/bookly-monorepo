import i18 from './i18n';
import en from './generic/en';
import es from './generic/es';
import resourcesEn from './resources/en';
import resourcesEs from './resources/es';
import navigationEn from './navigation/en';
import navigationEs from './navigation/es';

i18.addResourceBundle('en', 'generic', en);
i18.addResourceBundle('es', 'generic', es);
i18.addResourceBundle('en', 'resources', resourcesEn);
i18.addResourceBundle('es', 'resources', resourcesEs);
i18.addResourceBundle('en', 'navigation', navigationEn);
i18.addResourceBundle('es', 'navigation', navigationEs);

export default i18;
