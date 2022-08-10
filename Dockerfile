FROM node:16.16-bullseye

USER node

RUN mkdir /home/node/app

WORKDIR /home/node/app 

COPY --chown=node:node yarn.lock package.json ./

RUN rm -rf node_modules && yarn install --frozen-lockfile && yarn cache clean

COPY  . .

RUN yarn build

COPY .env ./dist/

WORKDIR /home/node/app/dist/

CMD node /home/node/app/dist/js/app.js
