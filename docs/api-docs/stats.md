# Stats API

Base URL: `/api/stats`

## Endpoints

### Get Resort Stats

Get comprehensive statistics for a resort (rating, rooms, reservations, feedbacks).

- **URL:** `/resort/:resortId`
- **Method:** `GET`
- **URL Params:** `resortId` (ObjectId)
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "success": true,
      "stats": {
        "averageRating": Number,
        "totalRooms": Number,
        "totalReservations": Number,
        "totalFeedbacks": Number,
        "ratingBreakdown": { ... }
      }
    }
    ```

### Get Resort Average Rating

Get the average rating of a resort.

- **URL:** `/resort/:resortId/rating`
- **Method:** `GET`
- **URL Params:** `resortId` (ObjectId)
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "averageRating": Number }`

### Get Resort Total Rooms

Get the total number of rooms in a resort.

- **URL:** `/resort/:resortId/rooms`
- **Method:** `GET`
- **URL Params:** `resortId` (ObjectId)
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "totalRooms": Number }`

### Get Resort Total Reservations

Get the total number of reservations for a resort. Requires Authentication.

- **URL:** `/resort/:resortId/reservations`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **URL Params:** `resortId` (ObjectId)
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "totalReservations": Number }`

### Get Resort Total Feedbacks

Get the total number of feedbacks for a resort.

- **URL:** `/resort/:resortId/feedbacks`
- **Method:** `GET`
- **URL Params:** `resortId` (ObjectId)
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "totalFeedbacks": Number }`
