# Amenity API

Base URL: `/api/amenities` (Assuming standard prefix, adjust if needed)

## Endpoints

### Create Amenity

Create a new amenity for a resort.

- **URL:** `/`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "resort_id": "ObjectId",
    "name": "String"
  }
  ```
- **Success Response:**
  - **Code:** 201
  - **Content:** Created amenity object

### Get All Amenities

Get a list of all amenities.

- **URL:** `/`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:** Array of amenity objects

### Get Amenities by Resort

Get all amenities for a specific resort.

- **URL:** `/resort/:resort_id`
- **Method:** `GET`
- **URL Params:** `resort_id` (ObjectId)
- **Success Response:**
  - **Code:** 200
  - **Content:** Array of amenity objects

### Get Amenity by ID

Get details of a specific amenity.

- **URL:** `/:id`
- **Method:** `GET`
- **URL Params:** `id` (ObjectId)
- **Success Response:**
  - **Code:** 200
  - **Content:** Amenity object

### Update Amenity

Update an existing amenity.

- **URL:** `/:id`
- **Method:** `PUT`
- **URL Params:** `id` (ObjectId)
- **Body:**
  ```json
  {
    "name": "String"
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** Updated amenity object

### Delete Amenity

Soft delete an amenity.

- **URL:** `/:id`
- **Method:** `DELETE`
- **URL Params:** `id` (ObjectId)
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "message": "Amenity deleted successfully" }`
