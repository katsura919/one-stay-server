# Reservation API

Base URL: `/api/reservations`

## Public Endpoints

### Check Availability

Check if a room is available for a specific date range.

- **URL:** `/availability/:roomId`
- **Method:** `GET`
- **URL Params:** `roomId` (ObjectId)
- **Query Params:**
  - `start_date`: Date (YYYY-MM-DD)
  - `end_date`: Date (YYYY-MM-DD)
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "available": Boolean,
      "room": { ... },
      "booking_details": { "total_price": Number, "nights": Number, ... }
    }
    ```

### Get Booked Dates

Get a list of dates when the room is already booked.

- **URL:** `/booked-dates/:roomId`
- **Method:** `GET`
- **URL Params:** `roomId` (ObjectId)
- **Success Response:**
  - **Code:** 200
  - **Content:** Array of date strings

## Protected Endpoints (Require Authentication)

### Create Reservation

Create a new reservation.

- **URL:** `/`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "room_id": "ObjectId",
    "start_date": "Date",
    "end_date": "Date"
  }
  ```
- **Success Response:**
  - **Code:** 201
  - **Content:** Created reservation object

### Get User Reservations

Get all reservations for the logged-in customer.

- **URL:** `/my-reservations`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:** Array of reservation objects

### Cancel Reservation

Cancel a reservation.

- **URL:** `/:reservationId`
- **Method:** `DELETE`
- **URL Params:** `reservationId` (ObjectId)
- **Success Response:**
  - **Code:** 200

### Get Owner Reservations

Get all reservations for resorts owned by the logged-in owner.

- **URL:** `/owner-reservations`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:** Array of reservation objects

### Update Reservation Status

Update the status of a reservation (e.g., approve, reject).

- **URL:** `/:reservationId/status`
- **Method:** `PUT`
- **URL Params:** `reservationId` (ObjectId)
- **Body:**
  ```json
  {
    "status": "String ('approved' | 'rejected' | ...)"
  }
  ```
- **Success Response:**
  - **Code:** 200

### Complete Reservation

Mark a reservation as completed.

- **URL:** `/:reservationId/complete`
- **Method:** `PUT`
- **URL Params:** `reservationId` (ObjectId)
- **Success Response:**
  - **Code:** 200

## Admin/System Endpoints

### Auto Complete Reservations

Trigger auto-completion of past reservations.

- **URL:** `/auto-complete`
- **Method:** `POST`
- **Success Response:**
  - **Code:** 200

### Get All Reservations

Get all reservations in the system.

- **URL:** `/`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200

### Get Reservation by ID

Get details of a specific reservation.

- **URL:** `/:reservationId`
- **Method:** `GET`
- **URL Params:** `reservationId` (ObjectId)
- **Success Response:**
  - **Code:** 200
