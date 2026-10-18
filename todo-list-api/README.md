# To-Do List REST API

A small, modular REST API for managing tasks. Tasks are stored persistently in MongoDB through Mongoose.

## Features

- Create, list, retrieve, update, and delete tasks
- Input validation and clear JSON error responses
- MongoDB ObjectId validation and missing-task handling
- Timestamps on every task
- CORS support and environment-based configuration
- Server starts only after MongoDB connects successfully

## Technology

Node.js, Express, MongoDB, Mongoose, dotenv, cors, and Nodemon. The project uses ES modules.

## Project structure

```text
todo-list-api/
|-- config/
|   `-- db.js
|-- models/
|   `-- Task.js
|-- routes/
|   `-- taskRoutes.js
|-- .env.example
|-- .gitignore
|-- package.json
|-- README.md
`-- server.js
```

## Install and run

Requirements: Node.js 18 or newer and a reachable MongoDB instance.

From this directory, install dependencies and make your local environment file:

```bash
npm install
cp .env.example .env
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp` if needed. Edit `.env`, then start the API:

```bash
npm run dev
```

For a normal start, use `npm start`. The API defaults to `http://localhost:5000`; `GET /` returns a short health message. Nodemon restarts the development server when files change.

## Environment variables

```dotenv
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/todo_db
```

`.env` is ignored by Git. Do not commit credentials or connection strings containing secrets.

### Local MongoDB

Install and start MongoDB Community Server, then use the default URI above. The database `todo_db` and its task collection are created when the first task is stored.

### MongoDB Atlas

Create an Atlas cluster and database user, allow the client IP in Network Access, then set `MONGO_URI` in `.env` to the Atlas connection string. Replace its username, password, and database placeholders locally; do not put the real URI in source control. URL-encode special characters in the password.

If MongoDB cannot be reached or `MONGO_URI` is absent, startup fails with a clear terminal message and the Express server does not start.

## API

All task routes are prefixed with `/api/tasks`. Send and receive JSON. For requests with a body, set `Content-Type: application/json`. Task responses include `_id`, `title`, `description`, `completed`, `createdAt`, and `updatedAt`.

| Method | URL | Purpose | Success |
| --- | --- | --- | --- |
| POST | `/api/tasks` | Create a task | `201 Created` |
| GET | `/api/tasks` | List tasks, newest first | `200 OK` |
| GET | `/api/tasks/:id` | Get one task | `200 OK` |
| PUT | `/api/tasks/:id` | Update allowed task fields | `200 OK` |
| DELETE | `/api/tasks/:id` | Delete a task | `200 OK` |

### Create a task

```http
POST http://localhost:5000/api/tasks
Content-Type: application/json
```

```json
{
  "title": "Learn Node.js",
  "description": "Practice Express and MongoDB",
  "completed": false
}
```

The `title` is required and cannot be blank. `description` defaults to an empty string, and `completed` defaults to `false`.

Example response (`201 Created`):

```json
{
  "_id": "671234567890abcdef123456",
  "title": "Learn Node.js",
  "description": "Practice Express and MongoDB",
  "completed": false,
  "createdAt": "2026-10-16T12:00:00.000Z",
  "updatedAt": "2026-10-16T12:00:00.000Z",
  "__v": 0
}
```

### List tasks

```http
GET http://localhost:5000/api/tasks
```

Expected response (`200 OK`): an array of task objects, newest first. The array is empty when there are no tasks.

### Get one task

```http
GET http://localhost:5000/api/tasks/671234567890abcdef123456
```

Expected response (`200 OK`): the task object. An invalid ObjectId returns `400 Bad Request`; a valid ID with no matching task returns `404 Not Found`.

### Update a task

```http
PUT http://localhost:5000/api/tasks/671234567890abcdef123456
Content-Type: application/json
```

```json
{
  "completed": true
}
```

Any non-empty subset of `title`, `description`, and `completed` can be updated. A supplied title must be a non-empty string; `completed` must be a JSON boolean. Fields outside this allowlist are rejected.

Expected response (`200 OK`): the updated task object. Invalid input or ID returns `400 Bad Request`; an unknown task returns `404 Not Found`.

### Delete a task

```http
DELETE http://localhost:5000/api/tasks/671234567890abcdef123456
```

Expected response (`200 OK`):

```json
{ "message": "Task deleted successfully." }
```

Invalid IDs return `400 Bad Request`; unknown tasks return `404 Not Found`.

## Postman test guide

Create a Postman collection and set `baseUrl` to `http://localhost:5000`. For requests with bodies, choose **Body > raw > JSON**; Postman will set `Content-Type: application/json`.

| Test | Method and URL | Body | Expected |
| --- | --- | --- | --- |
| Health check | `GET {{baseUrl}}/` | None | `200`, `{"message":"To-Do List API is running."}` |
| Create | `POST {{baseUrl}}/api/tasks` | `{"title":"Buy groceries","description":"Milk and bread","completed":false}` | `201`, created task with timestamps |
| List | `GET {{baseUrl}}/api/tasks` | None | `200`, task array newest first |
| Read existing | `GET {{baseUrl}}/api/tasks/<id>` | None | `200`, task object |
| Update | `PUT {{baseUrl}}/api/tasks/<id>` | `{"completed":true}` | `200`, updated task |
| Delete | `DELETE {{baseUrl}}/api/tasks/<id>` | None | `200`, success message |
| Invalid ID | `GET {{baseUrl}}/api/tasks/not-an-object-id` | None | `400`, `{"error":"Invalid task ID."}` |
| Missing task | `GET {{baseUrl}}/api/tasks/671234567890abcdef123456` (use a valid ID not in DB) | None | `404`, `{"error":"Task not found."}` |
| Missing title | `POST {{baseUrl}}/api/tasks` | `{"description":"No title"}` | `400`, title validation error |
| Blank title | `PUT {{baseUrl}}/api/tasks/<id>` | `{"title":"   "}` | `400`, title validation error |
| Invalid completion | `PUT {{baseUrl}}/api/tasks/<id>` | `{"completed":"yes"}` | `400`, completion validation error |
| Unsupported field | `POST {{baseUrl}}/api/tasks` | `{"title":"Task","owner":"someone"}` | `400`, unsupported field error |
| Malformed JSON | `POST {{baseUrl}}/api/tasks` with raw body `{ "title": ` | Invalid JSON | `400`, malformed JSON error |

For a database connection failure, stop MongoDB or temporarily set an unreachable URI in `.env`, then run `npm run dev`. Expected: a startup failure message in the terminal and no listening server. Restore the working URI afterward. Never use real production credentials for this test.

Errors use JSON, for example `{"error":"Task not found."}`. In production, unexpected server errors return a generic message rather than internal details.

## Common issues

- **Server fails to start:** confirm MongoDB is running, `MONGO_URI` is correct, and `.env` is in this project directory.
- **Atlas connection times out:** allow your IP in Atlas Network Access and check DNS/network access.
- **Atlas authentication fails:** check the database user and URL-encode special characters in its password.
- **`400 Malformed JSON`:** check JSON syntax and the `Content-Type: application/json` header.
- **`400 Invalid task ID`:** use the `_id` returned by MongoDB, not a task title.
- **`404 Task not found`:** the ID is valid but no matching document exists; create a task or use its current ID.