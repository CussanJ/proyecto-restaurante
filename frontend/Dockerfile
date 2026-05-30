FROM node:24-alpine

# Manejo correcto de señales
RUN apk add --no-cache tini

WORKDIR /app

# 1. Copiamos los archivos de dependencias asignando el usuario 'node' de una vez
COPY --chown=node:node package*.json ./

# Instalación limpia
RUN npm ci

# 2. Copiamos el código fuente asignando el usuario 'node' desde el inicio
# Esto evita tener que correr un "chown -R" después.
COPY --chown=node:node . .

# Variables importantes para Vite dentro de Docker
ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true
ENV HOST=0.0.0.0

# --- ELIMINAMOS EL RUN CHOWN -R QUE TARDABA 150 SEGUNDOS ---

USER node

EXPOSE 8103

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["npm", "run", "dev", "--", "--host"]