#!/bin/bash

set -e

declare -A SERVICES

SERVICES["auth-service"]=3004
SERVICES["inventario-service"]=3002
SERVICES["pedidos-service"]=3003
SERVICES["productos-service"]=3001

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

for SERVICE in "${!SERVICES[@]}"
do
  PORT=${SERVICES[$SERVICE]}
  SERVICE_PATH="./backend/$SERVICE"

  echo "📦 Procesando: $SERVICE"

  if [ ! -d "$SERVICE_PATH" ]; then
    echo "⚠️  No existe: $SERVICE_PATH"
    echo ""
    continue
  fi

  DOCKERFILE_PATH="$SERVICE_PATH/Dockerfile"
  DOCKERIGNORE_PATH="$SERVICE_PATH/.dockerignore"

  cat > "$DOCKERFILE_PATH" <<EOF
FROM node:24-alpine

# Init process para manejo correcto de señales
RUN apk add --no-cache tini

WORKDIR /app

# Copiamos dependencias primero para aprovechar cache
COPY package*.json ./

# Instalación limpia
RUN npm ci

# Copiamos el resto del proyecto
COPY . .

# Variables para entorno de desarrollo
ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true

# evita problemas de permisos en algunos entornos
RUN chown -R node:node /app

USER node

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["npm", "run", "dev"]
EOF

  echo "✅ Dockerfile actualizado (Puerto $PORT)"

  cat > "$DOCKERIGNORE_PATH" <<EOF
$DOCKERIGNORE_CONTENT
EOF

  echo "✅ .dockerignore actualizado"

  echo ""
done

echo "=========================================="
echo "   FINALIZADO"
echo "=========================================="
echo ""