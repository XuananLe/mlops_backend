FROM node:16-alpine as builder

ENV PORT=5500

RUN mkdir /app
COPY ./package.json /app
COPY ./yarn.lock /app
WORKDIR /app
RUN yarn global add pm2
RUN yarn

COPY . .
CMD ["yarn", "dev"]
EXPOSE 5500
