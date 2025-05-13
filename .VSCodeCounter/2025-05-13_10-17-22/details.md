# Details

Date : 2025-05-13 10:17:22

Directory d:\\Web\\Work\\NextJs\\idigitek\\idigitek-server

Total : 74 files,  6333 codes, 1488 comments, 1310 blanks, all 9131 lines

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [README.md](/README.md) | Markdown | 130 | 0 | 30 | 160 |
| [package.json](/package.json) | JSON | 68 | 0 | 0 | 68 |
| [src/app.ts](/src/app.ts) | TypeScript | 68 | 16 | 24 | 108 |
| [src/config/database.ts](/src/config/database.ts) | TypeScript | 32 | 8 | 8 | 48 |
| [src/config/env.ts](/src/config/env.ts) | TypeScript | 37 | 9 | 9 | 55 |
| [src/config/logger.ts](/src/config/logger.ts) | TypeScript | 43 | 6 | 5 | 54 |
| [src/controllers/ContentElement.controller.ts](/src/controllers/ContentElement.controller.ts) | TypeScript | 85 | 0 | 23 | 108 |
| [src/controllers/ContentTranslation.controller.ts](/src/controllers/ContentTranslation.controller.ts) | TypeScript | 78 | 34 | 24 | 136 |
| [src/controllers/WebSite.controller.ts](/src/controllers/WebSite.controller.ts) | TypeScript | 187 | 41 | 36 | 264 |
| [src/controllers/auth.controller.ts](/src/controllers/auth.controller.ts) | TypeScript | 106 | 43 | 35 | 184 |
| [src/controllers/language.controller.ts](/src/controllers/language.controller.ts) | TypeScript | 61 | 8 | 26 | 95 |
| [src/controllers/section.controller.ts](/src/controllers/section.controller.ts) | TypeScript | 185 | 53 | 64 | 302 |
| [src/controllers/sectionItem.controller.ts](/src/controllers/sectionItem.controller.ts) | TypeScript | 97 | 33 | 27 | 157 |
| [src/controllers/subSection.controller.ts](/src/controllers/subSection.controller.ts) | TypeScript | 168 | 61 | 48 | 277 |
| [src/controllers/upload.controller.ts](/src/controllers/upload.controller.ts) | TypeScript | 55 | 15 | 12 | 82 |
| [src/controllers/user.controller.ts](/src/controllers/user.controller.ts) | TypeScript | 164 | 57 | 37 | 258 |
| [src/custom.d.ts](/src/custom.d.ts) | TypeScript | 11 | 0 | 1 | 12 |
| [src/middleware/auth.middleware.ts](/src/middleware/auth.middleware.ts) | TypeScript | 82 | 18 | 13 | 113 |
| [src/middleware/errorHandler.middleware.ts](/src/middleware/errorHandler.middleware.ts) | TypeScript | 167 | 42 | 22 | 231 |
| [src/middleware/rateLimiter.middleware.ts](/src/middleware/rateLimiter.middleware.ts) | TypeScript | 35 | 9 | 3 | 47 |
| [src/middleware/requestId.middlerware.ts](/src/middleware/requestId.middlerware.ts) | TypeScript | 8 | 6 | 3 | 17 |
| [src/middleware/requestLogger.middleware.ts](/src/middleware/requestLogger.middleware.ts) | TypeScript | 24 | 6 | 5 | 35 |
| [src/middleware/section.middleware.ts](/src/middleware/section.middleware.ts) | TypeScript | 31 | 11 | 10 | 52 |
| [src/middleware/validator.middleware.ts](/src/middleware/validator.middleware.ts) | TypeScript | 43 | 11 | 7 | 61 |
| [src/models/ContentElement.model.ts](/src/models/ContentElement.model.ts) | TypeScript | 48 | 1 | 3 | 52 |
| [src/models/ContentTranslation.model.ts](/src/models/ContentTranslation.model.ts) | TypeScript | 34 | 1 | 4 | 39 |
| [src/models/WebSite.model.ts](/src/models/WebSite.model.ts) | TypeScript | 27 | 1 | 4 | 32 |
| [src/models/languages.model.ts](/src/models/languages.model.ts) | TypeScript | 35 | 0 | 3 | 38 |
| [src/models/sectionItems.model.ts](/src/models/sectionItems.model.ts) | TypeScript | 52 | 0 | 2 | 54 |
| [src/models/sections.model.ts](/src/models/sections.model.ts) | TypeScript | 53 | 2 | 4 | 59 |
| [src/models/subSections.model.ts](/src/models/subSections.model.ts) | TypeScript | 73 | 3 | 4 | 80 |
| [src/models/user.model.ts](/src/models/user.model.ts) | TypeScript | 142 | 14 | 22 | 178 |
| [src/models/webSiteUser.model.ts](/src/models/webSiteUser.model.ts) | TypeScript | 34 | 1 | 5 | 40 |
| [src/routes/auth.routes.ts](/src/routes/auth.routes.ts) | TypeScript | 7 | 2 | 7 | 16 |
| [src/routes/contentElement.routes.ts](/src/routes/contentElement.routes.ts) | TypeScript | 14 | 7 | 8 | 29 |
| [src/routes/contentTranslation.routes.ts](/src/routes/contentTranslation.routes.ts) | TypeScript | 41 | 40 | 10 | 91 |
| [src/routes/index.ts](/src/routes/index.ts) | TypeScript | 7 | 1 | 3 | 11 |
| [src/routes/language.routes.ts](/src/routes/language.routes.ts) | TypeScript | 11 | 1 | 2 | 14 |
| [src/routes/section.routes.ts](/src/routes/section.routes.ts) | TypeScript | 35 | 13 | 13 | 61 |
| [src/routes/sectionItem.routes.ts](/src/routes/sectionItem.routes.ts) | TypeScript | 13 | 4 | 6 | 23 |
| [src/routes/subSection.routes.ts](/src/routes/subSection.routes.ts) | TypeScript | 20 | 6 | 8 | 34 |
| [src/routes/user.routes.ts](/src/routes/user.routes.ts) | TypeScript | 77 | 47 | 13 | 137 |
| [src/routes/webSite.routes.ts](/src/routes/webSite.routes.ts) | TypeScript | 21 | 5 | 9 | 35 |
| [src/server.ts](/src/server.ts) | TypeScript | 39 | 8 | 8 | 55 |
| [src/services/ContentElement.service.ts](/src/services/ContentElement.service.ts) | TypeScript | 194 | 67 | 46 | 307 |
| [src/services/ContentTranslation.service.ts](/src/services/ContentTranslation.service.ts) | TypeScript | 237 | 65 | 43 | 345 |
| [src/services/WebSite.service.ts](/src/services/WebSite.service.ts) | TypeScript | 186 | 60 | 46 | 292 |
| [src/services/auth.service.ts](/src/services/auth.service.ts) | TypeScript | 204 | 67 | 54 | 325 |
| [src/services/cloudinary.service.ts](/src/services/cloudinary.service.ts) | TypeScript | 48 | 23 | 10 | 81 |
| [src/services/language.service.ts](/src/services/language.service.ts) | TypeScript | 148 | 13 | 28 | 189 |
| [src/services/section.service.ts](/src/services/section.service.ts) | TypeScript | 421 | 99 | 97 | 617 |
| [src/services/sectionItem.service.ts](/src/services/sectionItem.service.ts) | TypeScript | 288 | 83 | 60 | 431 |
| [src/services/subSection.service.ts](/src/services/subSection.service.ts) | TypeScript | 663 | 173 | 136 | 972 |
| [src/services/user.service.ts](/src/services/user.service.ts) | TypeScript | 362 | 69 | 64 | 495 |
| [src/types/ContentElement.type.ts](/src/types/ContentElement.type.ts) | TypeScript | 35 | 1 | 3 | 39 |
| [src/types/ContentTranslation.type.ts](/src/types/ContentTranslation.type.ts) | TypeScript | 24 | 0 | 3 | 27 |
| [src/types/SectionElement.types.ts](/src/types/SectionElement.types.ts) | TypeScript | 15 | 0 | 1 | 16 |
| [src/types/WebSite.type.ts](/src/types/WebSite.type.ts) | TypeScript | 23 | 0 | 4 | 27 |
| [src/types/express.d.ts](/src/types/express.d.ts) | TypeScript | 26 | 1 | 3 | 30 |
| [src/types/languages.types.ts](/src/types/languages.types.ts) | TypeScript | 33 | 19 | 5 | 57 |
| [src/types/moongoseExtinstions.d.ts](/src/types/moongoseExtinstions.d.ts) | TypeScript | 11 | 1 | 2 | 14 |
| [src/types/sectionItem.types.ts](/src/types/sectionItem.types.ts) | TypeScript | 30 | 0 | 5 | 35 |
| [src/types/sub.section.types.ts](/src/types/sub.section.types.ts) | TypeScript | 28 | 0 | 2 | 30 |
| [src/types/user.types.ts](/src/types/user.types.ts) | TypeScript | 79 | 1 | 11 | 91 |
| [src/types/userSection.type.ts](/src/types/userSection.type.ts) | TypeScript | 29 | 0 | 2 | 31 |
| [src/types/xss-clean.d.ts](/src/types/xss-clean.d.ts) | TypeScript | 5 | 1 | 2 | 8 |
| [src/utils/encryption.ts](/src/utils/encryption.ts) | TypeScript | 35 | 18 | 8 | 61 |
| [src/utils/jwt.ts](/src/utils/jwt.ts) | TypeScript | 61 | 19 | 10 | 90 |
| [src/utils/responseHandler.ts](/src/utils/responseHandler.ts) | TypeScript | 82 | 21 | 11 | 114 |
| [src/validations/auth.validator.ts](/src/validations/auth.validator.ts) | TypeScript | 98 | 21 | 13 | 132 |
| [src/validations/language.validation.ts](/src/validations/language.validation.ts) | TypeScript | 0 | 0 | 1 | 1 |
| [src/validations/user.validation.ts](/src/validations/user.validation.ts) | TypeScript | 166 | 21 | 30 | 217 |
| [tsconfig.json](/tsconfig.json) | JSON with Comments | 39 | 1 | 0 | 40 |
| [vercel.json](/vercel.json) | JSON | 15 | 0 | 0 | 15 |

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)