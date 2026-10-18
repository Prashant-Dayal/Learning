# Notes App Backend

A Node.js + Express REST API for a notes app. MongoDB stores users and notes; JWT protects all note routes.

## Features

- User registration and login
- Password hashing with bcrypt
- JWT authentication middleware
- Create, read, update, and delete notes
- Request validation and consistent HTTP status codes

## Setup

Requirements: Node.js LTS and a local MongoDB instance or MongoDB Atlas database.

```bash
npm install
```

Copy `.env.example` to `.env`, then set `MONGO_URI` and a strong random `JWT_SECRET`.

Start development server:

```bash
npm run dev
```

API base URL: `http://localhost:5000`

## Authentication endpoints

### `POST /api/auth/register`

```json
{
  "name": "Asha Sharma",
  "email": "asha@example.com",
  "password": "StrongPass123"
}
```

### `POST /api/auth/login`

```json
{
  "email": "asha@example.com",
  "password": "StrongPass123"
}
```

Both return a JWT `token` on success.

## Notes endpoints

All `/api/notes` endpoints require this header:

```text
Authorization: Bearer <your-jwt-token>
```

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notes` | List your notes |
| GET | `/api/notes/:id` | Get one of your notes |
| POST | `/api/notes` | Create a note |
| PATCH | `/api/notes/:id` | Update title and/or content |
| DELETE | `/api/notes/:id` | Delete a note |

### Create note request

```json
{
  "title": "Meeting notes",
  "content": "Prepare the project update."
}
```

### Update note request

```json
{
  "title": "Updated meeting notes"
}
```

## Testing with Postman

1. Register or log in and copy the returned token.
2. For a notes request, select **Authorization → Bearer Token** and paste the token.
3. Create a note, copy its `_id`, then test GET, PATCH, and DELETE.
4. Register a second account and confirm it cannot access the first account's notes.

## Security

- Passwords are hashed with bcrypt and are never returned.
- JWTs are signed with a secret and expire.
- Every note query is scoped to the authenticated owner.
- Do not commit `.env`; use HTTPS in production.
