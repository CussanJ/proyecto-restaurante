# Sistema de Gestión de Restaurante
Sistema de gestión de pedidos, inventario y productos basado en microservicios y API REST.

# Descripción
Este proyecto simula un sistema para restaurante que permite:
- Gestión de productos (menú)
- Gestión de pedidos
- Control de inventario
- Consumo de servicios mediante API REST
- Interfaz frontend en React
El sistema está dividido en microservicios independientes para simular una arquitectura distribuida.

# Arquitectura del sistema
- Microservicio de Productos
- Microservicio de Inventario
- Microservicio de Pedidos
- Frontend en React

# Tecnologías usadas
- Node.js + Express
- React
- Axios
- MongoDB
- Git + GitHub

## Entorno de Desarrollo Local

Este proyecto utiliza Docker para levantar automáticamente:

- Frontend React/Vite
- APIs Node.js/Express
- MongoDB
- Panel centralizado de logs (Dozzle)

Todo el entorno puede iniciarse con **un solo comando**.

---

## 📦 Requisitos Previos

Antes de comenzar necesitas tener instalado:

- Docker
- Docker Compose Plugin (`docker compose`)

Verifica que funcionen:

```bash
docker --version
docker compose version
```

---

# Inicio Rápido

## 1. Clona el proyecto

```bash
git clone <repo>
cd <repo>
```

---

## 2. Configura variables de entorno

Cada servicio backend ya incluye su propio archivo `.env`.

⚠️ IMPORTANTE:

El servicio `auth-service` necesita configurar credenciales reales de Gmail.

Edita:

```text
backend/auth-service/.env
```

y reemplaza:

```env
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_app_password
JWT_SECRET=SUPER_SECRET
```

---

## 🔐 Gmail NO usa tu contraseña normal

Google bloquea accesos SMTP tradicionales.

Debes generar una **App Password**:

### Pasos

1. Activar autenticación en dos pasos
2. Entrar aquí:

[https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

3. Crear una nueva App Password
4. Copiarla en:

```env
EMAIL_PASS=
```

---

### 3. Levantar todo el entorno

```bash
docker compose up -d --build
```

La primera vez:

* descargará imágenes,
* instalará dependencias,
* construirá contenedores.

Las siguientes veces será mucho más rápido gracias al cache de Docker.

---

## 🌐 URLs del Proyecto

| Servicio       | URL                                            |
| -------------- | ---------------------------------------------- |
| Frontend       | [http://localhost:5173](http://localhost:5173) |
| Productos API  | [http://localhost:3001](http://localhost:3001) |
| Inventario API | [http://localhost:3002](http://localhost:3002) |
| Pedidos API    | [http://localhost:3003](http://localhost:3003) |
| Auth API       | [http://localhost:3004](http://localhost:3004) |
| Logs (Dozzle)  | [http://localhost:8030](http://localhost:8030) |
| MongoDB        | mongodb://localhost:27017                      |

---

## 📜 Ver Logs

El proyecto incluye **Dozzle**, un panel web para visualizar logs en tiempo real.

Abre:

```text
http://localhost:8030
```

Ahí podrás:

* ver errores,
* inspeccionar logs,
* monitorear APIs,
* debuggear problemas rápidamente.

---

## 🛑 Detener el Entorno

```bash
docker compose down
```

---

## 🔄 Reiniciar Servicios

```bash
docker compose restart
```

---

# ♻️ Reconstruir Contenedores

Si cambias:

* dependencias,
* Dockerfiles,
* configuración importante,

usa:

```bash
docker compose up -d --build
```

---

# 📁 Persistencia de MongoDB

MongoDB usa un volumen persistente Docker.

Tus datos NO se pierden al reiniciar contenedores.

---

## 📂 Uploads de Productos

Las imágenes subidas se guardan en:

```text
backend/productos-service/uploads
```

Esto permite:

* persistencia,
* debugging,
* acceso local a archivos.

---

## Hot Reload

Todos los servicios están configurados para:

* recargar automáticamente,
* reflejar cambios en caliente,
* sin reconstruir contenedores.

Solo guarda archivos y Docker actualizará automáticamente.

---

## Limpiar TODO (incluyendo base de datos)

⚠️ Esto elimina contenedores Y datos de MongoDB.

```bash
docker compose down -v
```

---

## 🆘 Problemas comunes

### Puerto ocupado

Si aparece algo como:

```text
port is already allocated
```

significa que otro proceso ya usa ese puerto.

Puedes verificar:

```bash
sudo lsof -i :3001
```

---

## Docker no inicia

Linux:

```bash
sudo systemctl start docker
```

---

# ✅ Stack Tecnológico

* Node.js
* Express
* React
* Vite
* MongoDB
* Docker
* Docker Compose
* Dozzle


