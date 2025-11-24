# Chat API

Base URL: `/api/chat`

## Endpoints

### Send Message

Send a message. Creates a new chat if one doesn't exist between the customer and resort.

- **URL:** `/send`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "customer_id": "ObjectId",
    "resort_id": "ObjectId",
    "sender": "String ('customer' | 'owner')",
    "text": "String"
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** Updated/Created Chat object

### Get User Chats

Get all chats for a specific user (customer).

- **URL:** `/user/:user_id`
- **Method:** `GET`
- **URL Params:** `user_id` (ObjectId)
- **Success Response:**
  - **Code:** 200
  - **Content:** Array of chat objects

### Get Resort Chats

Get all chats for a specific resort.

- **URL:** `/resort/:resort_id/chats`
- **Method:** `GET`
- **URL Params:** `resort_id` (ObjectId)
- **Success Response:**
  - **Code:** 200
  - **Content:** Array of chat objects

### Get Chat History

Get paginated chat history.

- **URL:** `/:id`
- **Method:** `GET`
- **URL Params:** `id` (ObjectId - Chat ID)
- **Query Params:**
  - `limit`: Number (default 5)
  - `skip`: Number (default 0)
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "chat": { ... },
      "messages": [ ... ],
      "pagination": { "total": ..., "limit": ..., "skip": ... }
    }
    ```

### Load More Messages

Load more messages for a chat (pagination helper).

- **URL:** `/:id/load-more`
- **Method:** `GET`
- **URL Params:** `id` (ObjectId - Chat ID)
- **Query Params:**
  - `limit`: Number
  - `skip`: Number
- **Success Response:**
  - **Code:** 200
  - **Content:** Array of message objects

### Mark as Read

Mark messages in a chat as read (Implementation details depend on controller logic, usually updates a flag).

- **URL:** `/:id/read`
- **Method:** `PUT`
- **URL Params:** `id` (ObjectId - Chat ID)
- **Success Response:**
  - **Code:** 200

### Delete Chat

Soft delete a chat.

- **URL:** `/:id`
- **Method:** `DELETE`
- **URL Params:** `id` (ObjectId - Chat ID)
- **Success Response:**
  - **Code:** 200
