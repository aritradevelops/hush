FROM node:23-alpine as builder

WORKDIR /usr/lib/app

COPY package*.json tsconfig.json ./

RUN npm ci

COPY src src

COPY locales locales

COPY @types @types

COPY views views
RUN ls

RUN npm run build

RUN rm -fr node_modules/

RUN npm ci --omit=dev

RUN ls

FROM node:23-alpine

ARG NODE_ENV=production

WORKDIR /usr/lib/app

USER node

COPY package*.json ./

COPY --from=builder /usr/lib/app/dist/ dist/
COPY --from=builder /usr/lib/app/node_modules node_modules/
COPY --from=builder /usr/lib/app/locales/ locales/
COPY --from=builder /usr/lib/app/views/ views/


EXPOSE 3000

CMD ["npm", "run", "prod"]