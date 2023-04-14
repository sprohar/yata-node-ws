# Yet Another To-Do App (YATA)

Yet another to-do app created with JavaScript, specifically [NestJS](https://nestjs.com/).

## Getting Started

Install the following:

- [Node.js](https://nodejs.org/en/)
- [Docker](https://www.docker.com/)
- [Redis](https://redis.io/docs/getting-started/installation/)

Create a `.env` file at the root of the project. The file should contain:

```Properties
DATABASE_URL="postgresql://postgres:password_123@localhost:5434/yata?schema=public"

JWT_SECRET=jwtSecret123
JWT_TOKEN_AUDIENCE=localhost:4200
JWT_TOKEN_ISSUER=localhost:3000
JWT_ACCESS_TOKEN_TTL=1200
JWT_REFRESH_TOKEN_TTL=86400

APP_PORT=3000

REDIS_HOST=localhost
REDIS_PORT=6379
```

### Using Docker

If Docker is your preference, then ensure that Docker is running on your machine.
Open a terminal at the root of the project and run the following to create the Postgres database:

```
docker compose up dev-db --detach
```

### Without Docker

Ensure that you have an instance of Postgres running on your machine and run the following commands:

```
npm run db:push
```

```
npm run db:seed
```

This will create and seed the database.

## Run the Application

Once the installation process is complete you can start the server:

```shell
npm run start
```

Navigate to http://localhost:3000/api to see the Swagger document.
