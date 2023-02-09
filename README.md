# Yet Another To-Do App (YATA)

---

Yet another to-do app created with JavaScript, specifically [NestJS](https://nestjs.com/).

## Getting Started

Install the following:

- [Node.js](https://nodejs.org/en/)
- [Docker](https://www.docker.com/)

Create a `.env` file at the root of the project. The file should contain:

```Properties
DATABASE_URL="postgresql://postgres:password_123@localhost:5434/yata?schema=public"
```

Ensure that Docker is running on your machine. Open a terminal at the root of the project and run the following to create the Postgres database:

```
docker compose up dev-db --detach
```

Once the installation process is complete you can start the server:

```shell
npm run start
```

Navigate to http://localhost:3000/api to see the Swagger document.
