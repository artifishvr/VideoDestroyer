FROM node:lts
ENV NODE_ENV=production

RUN npm install -g pnpm

WORKDIR /app

COPY ["package.json", "pnpm-lock.yaml", "./"]

RUN pnpm install --prod

COPY . .

CMD ["node", "./bin/www"]

EXPOSE 3000