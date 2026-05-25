FROM node:20-alpine

RUN apk add --no-cache tini

WORKDIR /app

COPY package*.json ./

RUN npm ci && \
    npm cache clean --force

COPY . .

ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true

EXPOSE 3004

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["npm", "run", "dev"]
