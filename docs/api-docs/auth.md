# Auth API

Base URL: `/api/auth`

## Endpoints

### Register

Register a new user (customer or owner).

- **URL:** `/register`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "username": "String",
    "email": "String",
    "password": "String",
    "role": "String ('customer' | 'owner')"
  }
  ```
- **Success Response:**
  - **Code:** 201
  - **Content:**
    ```json
    {
      "message": "User registered successfully.",
      "token": "JWT Token",
      "user": { "id": "...", "username": "...", "email": "...", "role": "..." }
    }
    ```

### Login

Authenticate a user and get a token.

- **URL:** `/login`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "email": "String",
    "password": "String"
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "token": "JWT Token",
      "user": { "id": "...", "username": "...", "email": "...", "role": "..." }
    }
    ```
