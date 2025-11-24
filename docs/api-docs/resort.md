# Resort API

Base URL: `/api/resorts`

## Public Endpoints

### Get All Resorts

Get a list of all resorts.

- **URL:** `/`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:** Array of resort objects

### Search Resorts

Search for resorts based on criteria.

- **URL:** `/search`
- **Method:** `GET`
- **Query Params:** (Implementation dependent, e.g., `name`, `location`)
- **Success Response:**
  - **Code:** 200
  - **Content:** Array of resort objects

### Get Featured Resorts

Get a list of featured resorts with enhanced data (ratings, prices).

- **URL:** `/featured`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:** Array of enhanced resort objects

### Get Resort by Owner

Get the resort owned by a specific user.

- **URL:** `/owner/:owner_id`
- **Method:** `GET`
- **URL Params:** `owner_id` (ObjectId)
- **Success Response:**
  - **Code:** 200
  - **Content:** Resort object

### Get Resort by ID

Get details of a specific resort.

- **URL:** `/:id`
- **Method:** `GET`
- **URL Params:** `id` (ObjectId)
- **Success Response:**
  - **Code:** 200
  - **Content:** Resort object

## Protected Endpoints (Require Authentication & Owner Role)

### Get My Resort

Get the resort owned by the logged-in user.

- **URL:** `/my/resort`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:** Resort object

### Create Resort

Create a new resort.

- **URL:** `/`
- **Method:** `POST`
- **Content-Type:** `multipart/form-data` (if uploading image)
- **Body:**
  - `resort_name`: String
  - `description`: String
  - `location`: JSON String (`{ "address": "...", "latitude": ..., "longitude": ... }`)
  - `image`: File (Optional)
- **Success Response:**
  - **Code:** 201
  - **Content:** Created resort object

### Update Resort

Update an existing resort.

- **URL:** `/:id`
- **Method:** `PUT`
- **Content-Type:** `multipart/form-data`
- **URL Params:** `id` (ObjectId)
- **Body:** Fields to update
- **Success Response:**
  - **Code:** 200
  - **Content:** Updated resort object

### Upload Resort Image

Upload or update the resort image.

- **URL:** `/:id/image`
- **Method:** `PUT`
- **Content-Type:** `multipart/form-data`
- **URL Params:** `id` (ObjectId)
- **Body:**
  - `image`: File
- **Success Response:**
  - **Code:** 200

### Delete Resort

Soft delete a resort.

- **URL:** `/:id`
- **Method:** `DELETE`
- **URL Params:** `id` (ObjectId)
- **Success Response:**
  - **Code:** 200
