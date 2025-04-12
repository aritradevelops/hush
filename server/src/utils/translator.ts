import i18next from "i18next";
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';
class Translator {
  constructor() {
    i18next
      .use(Backend)
      .use(middleware.LanguageDetector)
      .init({
        fallbackLng: 'en',
        backend: {
          loadPath: './locales/{{lng}}/translation.json',
        },
      });
  }
  translate() {
    return middleware.handle(i18next);
  }
}

export default new Translator();