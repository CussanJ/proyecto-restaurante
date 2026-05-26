FROM node:24-alpine

# Manejo correcto de señales
RUN apk add --no-cache tini

WORKDIR /app

# Copiamos dependencias primero
COPY package*.json ./

# Instalación limpia
RUN npm ci

# Copiamos código fuente
COPY . .

# Variables importantes para Vite dentro de Docker
ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true

# MUY IMPORTANTE:
# permite que Vite escuche fuera del contenedor
ENV HOST=0.0.0.0

# Permisos seguros
RUN chown -R node:node /app

USER node

EXPOSE 5173

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["npm", "run", "dev", "--", "--host"]