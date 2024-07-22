# Api Documentation

This project is a simple API that handles users, records and operations. It uses Express.js, MongoDB, and JWT for authentication.

## Installation

1. Clone this repository to your local machine.
2. Run `npm install` to install the dependencies.

## Configuration

1. Create a `.env` file in the project root with the following variables:
JWT_SECRET=YourSecretKey


Replace `YourSecretKey` with a secret string for signing JWT tokens.

2. Make sure you have MongoDB installed and configured. Update the connection URL in `models/User.js` and `models/Operation.js`.

## Routes

### User Registration

- **POST** `/register`
- Creates a new user.
- Parameters:
 - `username`: User's username
 - `password`: Password
- Response:
 - `200 OK`: User created successfully
 - `400 Bad Request`: User already exists

### User Login

- **POST** `/login`
- Logs in an existing user.
- Parameters:
 - `username`: User's username
 - `password`: Password
- Response:
 - `200 OK`: Login successful (returns a JWT token)
 - `400 Bad Request`: User not found or invalid password

### Operation Creation

- **POST** `/operation`
- Creates a new operation.
- Parameters:
 - `type`: Operation type (e.g., "addition" or "divition")
 - `cost`: Operation cost
- Response:
 - `201 Created`: Operation created successfully
 - `500 Internal Server Error`: Server internal error

### Record Creation
POST /
-Description: Executes a mathematical or string manipulation operation based on the provided type and amount.
-Parameters:
operation_type: Type of the operation (e.g., "addition", "subtraction", "multiplication", "division", "square_root", "random_string")
amount: The number to perform the operation on.
-Response:
 -201 Created: Operation executed successfully with the result included.
 -400 Bad Request: Invalid operation type, missing parameters, or insufficient balance.
 -404 Not Found: Operation type not found. 
 -500 Internal Server Error: Unexpected error during operation execution.

### Get All Records
GET /
Description: Retrieves all records for the authenticated user (excluding deleted records).
Response:
200 OK: Successfully retrieved all records.
401 Unauthorized: Missing or invalid JWT token.
500 Internal Server Error: Unexpected error during record retrieval.

### Delete Record
DELETE /:id
Description: Soft deletes a record by marking it as deleted.
Parameters:
id: ID of the record to delete.
Response:
200 OK: Record deleted successfully (marked as deleted).
401 Unauthorized: Missing or invalid JWT token.
404 Not Found: Record with the provided ID not found.
500 Internal Server Error: Unexpected error during record deletion.

## Usage

1. Run `npm start` to start the server.
2. Make requests to the mentioned routes using tools like Postman or curl.










