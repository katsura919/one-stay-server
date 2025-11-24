# Room API

Base URL: `/api/rooms`

## Public Endpoints

### Get All Rooms

Get a list of all rooms.

- **URL:** `/`
- **Method:** `GET`
- **Query Params:**
  - `resort_id`: ObjectId (Optional - filter by resort)
- **Success Response:**
  - **Code:** 200
  - **Content:** Array of room objects

### Get Room by ID

Get details of a specific room.

- **URL:** `/:id`
- **Method:** `GET`
- **URL Params:** `id` (ObjectId)
- **Success Response:**
  - **Code:** 200
  - **Content:** Room object

### Get Rooms by Resort

Get all rooms for a specific resort.

- **URL:** `/resort/:resortId`
- **Method:** `GET`
- **URL Params:** `resortId` (ObjectId)
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "resort": {...}, "rooms": [...] }`

## Protected Endpoints (Require Authentication)

### Create Room

Create a new room.

- **URL:** `/`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "resort_id": "ObjectId",
    "room_type": "String",
    "capacity": "Number",
    "price_per_night": "Number",
    "status": "String"
  }
  ```
- **Success Response:**
  - **Code:** 201
  - **Content:** Created room object

### Update Room

Update an existing room.

- **URL:** `/:id`
- **Method:** `PUT`
- **URL Params:** `id` (ObjectId)
- **Body:** Fields to update
- **Success Response:**
  - **Code:** 200
  - **Content:** Updated room object

### Delete Room

Soft delete a room.

- **URL:** `/:id`
- **Method:** `DELETE`
- **URL Params:** `id` (ObjectId)
- **Success Response:**
  - **Code:** 200
