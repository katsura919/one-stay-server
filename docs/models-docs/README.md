# One Stay Server Models Documentation

This directory contains documentation for the Mongoose models used in the One Stay Server application.

## Table of Contents

- [User Model](#user-model)
- [Resort Model](#resort-model)
- [Room Model](#room-model)
- [Reservation Model](#reservation-model)
- [Amenity Model](#amenity-model)
- [Chat Model](#chat-model)
- [Feedback Model](#feedback-model)

---

## User Model

Represents a user of the application, which can be either a customer or a resort owner.

**File:** `src/models/user-model.js`

| Field       | Type    | Required | Unique | Description                                          |
| :---------- | :------ | :------- | :----- | :--------------------------------------------------- |
| `username`  | String  | Yes      | Yes    | The unique username of the user.                     |
| `email`     | String  | Yes      | Yes    | The unique email address of the user.                |
| `password`  | String  | Yes      | No     | The hashed password of the user.                     |
| `role`      | String  | Yes      | No     | The role of the user. Enum: `['customer', 'owner']`. |
| `createdAt` | Date    | No       | No     | Timestamp of creation. Defaults to `Date.now`.       |
| `deleted`   | Boolean | No       | No     | Soft delete flag. Defaults to `false`.               |

---

## Resort Model

Represents a resort owned by a user (owner).

**File:** `src/models/resort-model.js`

| Field                | Type     | Required | Reference | Description                                      |
| :------------------- | :------- | :------- | :-------- | :----------------------------------------------- |
| `owner_id`           | ObjectId | Yes      | `User`    | The ID of the owner (User) who owns this resort. |
| `resort_name`        | String   | Yes      | -         | The name of the resort.                          |
| `location`           | Object   | Yes      | -         | Object containing location details.              |
| `location.address`   | String   | Yes      | -         | The physical address of the resort.              |
| `location.latitude`  | Number   | Yes      | -         | Latitude coordinate.                             |
| `location.longitude` | Number   | Yes      | -         | Longitude coordinate.                            |
| `description`        | String   | No       | -         | A description of the resort.                     |
| `image`              | String   | No       | -         | URL or path to the resort's image.               |
| `createdAt`          | Date     | No       | -         | Timestamp of creation. Defaults to `Date.now`.   |
| `deleted`            | Boolean  | No       | -         | Soft delete flag. Defaults to `false`.           |

---

## Room Model

Represents a room within a resort.

**File:** `src/models/room-model.js`

| Field             | Type     | Required | Reference | Description                                                   |
| :---------------- | :------- | :------- | :-------- | :------------------------------------------------------------ |
| `resort_id`       | ObjectId | Yes      | `Resort`  | The ID of the resort this room belongs to.                    |
| `room_type`       | String   | Yes      | -         | The type of the room (e.g., "Single", "Double", "Suite").     |
| `capacity`        | Number   | Yes      | -         | The maximum number of people the room can accommodate.        |
| `price_per_night` | Number   | Yes      | -         | The cost per night for the room.                              |
| `status`          | String   | Yes      | -         | The current status of the room (e.g., 'available', 'booked'). |
| `createdAt`       | Date     | No       | -         | Timestamp of creation. Defaults to `Date.now`.                |
| `deleted`         | Boolean  | No       | -         | Soft delete flag. Defaults to `false`.                        |

---

## Reservation Model

Represents a booking made by a user for a specific room.

**File:** `src/models/reservation-model.js`

| Field         | Type     | Required | Reference | Description                                                                                                                |
| :------------ | :------- | :------- | :-------- | :------------------------------------------------------------------------------------------------------------------------- |
| `user_id`     | ObjectId | Yes      | `User`    | The ID of the user making the reservation.                                                                                 |
| `room_id`     | ObjectId | Yes      | `Room`    | The ID of the room being reserved.                                                                                         |
| `start_date`  | Date     | Yes      | -         | The start date of the reservation.                                                                                         |
| `end_date`    | Date     | Yes      | -         | The end date of the reservation.                                                                                           |
| `total_price` | Number   | Yes      | -         | The total price for the stay.                                                                                              |
| `status`      | String   | No       | -         | Status of the reservation. Enum: `['pending', 'approved', 'rejected', 'completed', 'cancelled']`. Defaults to `'pending'`. |
| `createdAt`   | Date     | No       | -         | Timestamp of creation. Defaults to `Date.now`.                                                                             |
| `deleted`     | Boolean  | No       | -         | Soft delete flag. Defaults to `false`.                                                                                     |

---

## Amenity Model

Represents an amenity available at a resort.

**File:** `src/models/amenity-model.js`

| Field       | Type     | Required | Reference | Description                                     |
| :---------- | :------- | :------- | :-------- | :---------------------------------------------- |
| `resort_id` | ObjectId | Yes      | `Resort`  | The ID of the resort offering this amenity.     |
| `name`      | String   | Yes      | -         | The name of the amenity (e.g., "WiFi", "Pool"). |
| `createdAt` | Date     | No       | -         | Timestamp of creation. Defaults to `Date.now`.  |
| `deleted`   | Boolean  | No       | -         | Soft delete flag. Defaults to `false`.          |

---

## Chat Model

Represents a chat conversation between a customer and a resort (owner).

**File:** `src/models/chat-model.js`

| Field                  | Type     | Required | Reference | Description                                          |
| :--------------------- | :------- | :------- | :-------- | :--------------------------------------------------- |
| `customer_id`          | ObjectId | Yes      | `User`    | The ID of the customer involved in the chat.         |
| `resort_id`            | ObjectId | Yes      | `Resort`  | The ID of the resort involved in the chat.           |
| `messages`             | Array    | No       | -         | An array of message objects.                         |
| `messages[].sender`    | String   | Yes      | -         | Who sent the message. Enum: `['customer', 'owner']`. |
| `messages[].text`      | String   | Yes      | -         | The content of the message.                          |
| `messages[].timestamp` | Date     | No       | -         | When the message was sent. Defaults to `Date.now`.   |
| `createdAt`            | Date     | No       | -         | Timestamp of creation. Defaults to `Date.now`.       |
| `deleted`              | Boolean  | No       | -         | Soft delete flag. Defaults to `false`.               |

---

## Feedback Model

Represents feedback or a review left by a user (customer or owner) regarding a reservation.

**File:** `src/models/feedback-model.js`

| Field            | Type     | Required | Reference     | Description                                                           |
| :--------------- | :------- | :------- | :------------ | :-------------------------------------------------------------------- |
| `from_user_id`   | ObjectId | Yes      | `User`        | The ID of the user giving the feedback.                               |
| `to_user_id`     | ObjectId | Yes      | `User`        | The ID of the user receiving the feedback.                            |
| `room_id`        | ObjectId | Yes      | `Room`        | The ID of the room related to the feedback.                           |
| `reservation_id` | ObjectId | Yes      | `Reservation` | The ID of the reservation related to the feedback.                    |
| `feedback_type`  | String   | Yes      | -             | Type of feedback. Enum: `['customer_to_owner', 'owner_to_customer']`. |
| `rating`         | Number   | Yes      | -             | Rating value (1-5).                                                   |
| `comment`        | String   | No       | -             | Optional comment text (max 500 chars).                                |
| `createdAt`      | Date     | No       | -             | Timestamp of creation. Defaults to `Date.now`.                        |
| `updatedAt`      | Date     | No       | -             | Timestamp of last update. Defaults to `Date.now`.                     |
| `deleted`        | Boolean  | No       | -             | Soft delete flag. Defaults to `false`.                                |

**Indexes:**

- Compound unique index on `reservation_id`, `from_user_id`, and `feedback_type` to ensure a user can only leave one feedback per type for a specific reservation.
