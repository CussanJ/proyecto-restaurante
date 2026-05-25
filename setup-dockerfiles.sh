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
FROM node:20-alpine

RUN apk add --no-cache tini

WORKDIR /app

COPY package*.json ./

RUN npm ci && \\
    npm cache clean --force

COPY . .

ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true

EXPOSE $PORT

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