# User API

Base URL: `/api/users`

## Endpoints

### Get All Users

Get a list of all users.

- **URL:** `/`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:** Array of user objects

### Get User by ID

Get details of a specific user.

- **URL:** `/:id`
- **Method:** `GET`
- **URL Params:** `id` (ObjectId)
- **Success Response:**
  - **Code:** 200
  - **Content:** User object

### Update User

Update generic user details.

- **URL:** `/:id`
- **Method:** `PUT`
- **URL Params:** `id` (ObjectId)
- **Body:** Fields to update
- **Success Response:**
  - **Code:** 200
  - **Content:** Updated user object

### Update User Profile

Update user profile information (username, email).

- **URL:** `/:id/profile`
- **Method:** `PUT`
- **URL Params:** `id` (ObjectId)
- **Body:**
  ```json
  {
    "username": "String",
    "email": "String"
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "message": "...", "user": ... }`

### Change Password

Change user password.

- **URL:** `/:id/password`
- **Method:** `PUT`
- **URL Params:** `id` (ObjectId)
- **Body:**
  ```json
  {
    "currentPassword": "String",
    "newPassword": "String"
  }
  ```
- **Success Response:**
  - **Code:** 200

### Delete User

Soft delete a user.

- **URL:** `/:id`
- **Method:** `DELETE`
- **URL Params:** `id` (ObjectId)
- **Success Response:**
  - **Code:** 200
