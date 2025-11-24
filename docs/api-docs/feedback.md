# Feedback API

Base URL: `/api/feedback`

## Endpoints

### Create Feedback

Submit feedback for a completed reservation. Requires Authentication.

- **URL:** `/`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "reservation_id": "ObjectId",
    "rating": "Number (1-5)",
    "comment": "String",
    "feedback_type": "String ('customer_to_owner' | 'owner_to_customer')"
  }
  ```
- **Success Response:**
  - **Code:** 201
  - **Content:** Created feedback object

### Update Feedback

Update existing feedback. Requires Authentication.

- **URL:** `/:id`
- **Method:** `PUT`
- **Headers:** `Authorization: Bearer <token>`
- **URL Params:** `id` (ObjectId)
- **Body:**
  ```json
  {
    "rating": "Number (1-5)",
    "comment": "String"
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** Updated feedback object

### Delete Feedback

Delete feedback. Requires Authentication.

- **URL:** `/:id`
- **Method:** `DELETE`
- **Headers:** `Authorization: Bearer <token>`
- **URL Params:** `id` (ObjectId)
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "message": "Feedback deleted successfully" }`

### Get Feedbacks for Room

Get all customer reviews for a specific room.

- **URL:** `/room/:room_id`
- **Method:** `GET`
- **URL Params:** `room_id` (ObjectId)
- **Success Response:**
  - **Code:** 200
  - **Content:** Array of feedback objects

### Get User Feedback Summary

Get a summary of feedback given and received by a user.

- **URL:** `/user/:user_id`
- **Method:** `GET`
- **URL Params:** `user_id` (ObjectId)
- **Success Response:**
  - **Code:** 200
  - **Content:** Summary object

### Check Feedback Eligibility

Check if the current user is eligible to leave feedback for a reservation. Requires Authentication.

- **URL:** `/eligibility/:reservation_id`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **URL Params:** `reservation_id` (ObjectId)
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "canLeaveFeedback": Boolean, "reason": "String" }`
