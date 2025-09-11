FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache git

COPY package*.json yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 5173

CMD ["yarn", "dev", "--host", "0.0.0.0"]