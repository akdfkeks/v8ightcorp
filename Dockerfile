FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./

RUN yarn install --production=true

COPY . .

RUN yarn run build

FROM node:20

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["yarn", "run", "start:prod"]