#!/bin/bash

set -e

SERVICES=(
  "auth-service"
  "inventario-service"
  "pedidos-service"
  "productos-service"
)

DOCKERFILE_CONTENT='FROM node:20-alpine

RUN apk add --no-cache tini

WORKDIR /app

COPY package*.json ./

RUN npm install && \
    npm cache clean --force

COPY . .

ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["npm", "run", "dev"]
'

DOCKERIGNORE_CONTENT='node_modules
npm-debug.log
.git
.gitignore
Dockerfile
.dockerignore
.env
coverage
dist
'

echo ""
echo "=========================================="
echo "   CONFIGURANDO DOCKERFILES BACKEND"
echo "=========================================="
echo ""

for SERVICE in "${SERVICES[@]}"
do
  SERVICE_PATH="./backend/$SERVICE"

  echo "📦 Procesando: $SERVICE"

  if [ ! -d "$SERVICE_PATH" ]; then
    echo "⚠️  No existe: $SERVICE_PATH"
    echo ""
    continue
  fi

  DOCKERFILE_PATH="$SERVICE_PATH/Dockerfile"
  DOCKERIGNORE_PATH="$SERVICE_PATH/.dockerignore"

  # Crear Dockerfile si no existe
  if [ ! -f "$DOCKERFILE_PATH" ]; then
    echo "$DOCKERFILE_CONTENT" > "$DOCKERFILE_PATH"
    echo "✅ Dockerfile creado"
  else
    echo "⏭️  Dockerfile ya existe"
  fi

  # Crear .dockerignore si no existe
  if [ ! -f "$DOCKERIGNORE_PATH" ]; then
    echo "$DOCKERIGNORE_CONTENT" > "$DOCKERIGNORE_PATH"
    echo "✅ .dockerignore creado"
  else
    echo "⏭️  .dockerignore ya existe"
  fi

  echo ""
done

echo "=========================================="
echo "   FINALIZADO"
echo "=========================================="
echo ""