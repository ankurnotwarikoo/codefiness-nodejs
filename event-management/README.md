# Event Management Platform

A backend system for a virtual event management platform focusing on user registration, event scheduling, and participant management, all managed through in-memory data structures.

## Features

The system allows authenticated users to create, update, and delete event details. Each event stores information such as date, time, description, and participant list in memory.

## Tech Stack

- **Node.js**: Version 18.0.0 or higher is required to run the backend server.
- **Express.js**: Framework for building web applications with Node.js. It's used to handle HTTP requests and routes.
- **bcrypt**: Library for hashing passwords. It's used for securely storing user passwords.
- **jsonwebtoken**: Library for generating and verifying JSON Web Tokens (JWT). It's used for user authentication and session management.
- **dotenv**: Library for loading environment variables from a `.env` file. It's commonly used for storing sensitive information like database credentials.
- **nodemailer**: Library for sending emails. It could be used for sending email notifications, as mentioned in the requirements.
- **validator**: Library for validating and sanitizing strings. It could be used for input validation and sanitization.
- **supertest**: Library for testing HTTP servers. It's often used with Express.js applications for writing API tests.
- **tap**: Test framework for Node.js. It's used for writing and running tests.

## Getting Started

1. **Clone the Repository**:

   git clone https://github.com/your-username/codefiness-nodejs.git
   cd codefiness-nodejs

2. **Install Dependencies**:

   npm install

3. ** Set up environment variables **:

   Create a .env file in the root directory and add the following variables:
   JWT_SIGNING_SECRET=your_jwt_secret
   EMAIL_USER=your_email
   EMAIL_PASS=your_pass

4. **Start the Server**:

   npm start

5. **Interact with the API**:

   Once the server is running, you can use tools like cURL, Postman, or any HTTP client to interact with the API endpoints.

## Authentication Mechanism

The authentication mechanism used in this application is JSON Web Tokens (JWT). Upon successful login, the server generates a JWT token containing the user's email and signs it with a secret key.
This token is then sent back to the client and should be included in subsequent requests to authenticated endpoints in the authorization header. The server verifies the token's authenticity and extracts the user's information from it to authorize the request.

## Authentication Controller

The Authentication Controller handles user registration and login functionalities for the virtual event management platform. It provides endpoints for registering new users and authenticating existing users.

### Middleware Functions

1. **validateRequestBodyForRegistration:**
   - Middleware to validate the request body for user registration.
   - Checks if the provided email, password, and role are valid.
   - If the validation fails, appropriate error responses are sent.
   - If the validation passes, the request is forwarded to the next middleware.

### Endpoints

1. **POST /register**

   - Registers a new user.
   - Validates the request body using the `validateRequestBodyForRegistration` middleware.
   - Creates a new user object with the provided email, hashed password, and role.
   - Assigns a unique ID to the user, increments the global counter for user IDs, and adds the user object to the users array.
   - Responds with the details of the registered user.

2. **POST /login**
   - Authenticates a user based on the provided email and password.
   - If authentication succeeds, it generates a JWT token and sends it in the response.
   - If authentication fails, appropriate error responses are sent.

### Functions

1. **bcrypt:**

   - Library used for hashing passwords for security.

2. **jwt:**
   - Library used for generating JSON Web Tokens (JWT) for user authentication.

### Constants

1. **ROLES:**

   - Enumerated type defining user roles.

2. **ERROR_MESSAGES:**
   - Constants defining error messages used in authentication.

### Variables

1. **users:**

   - Array containing registered user objects.

2. **globalCounter:**
   - Variable to keep track of the total number of registered users.

## Event Controller

The Event Controller handles the CRUD (Create, Read, Update, Delete) operations related to events in the virtual event management platform. It provides endpoints for creating, updating, deleting, and retrieving event details. Additionally, it includes functionality for registering attendees for specific events.

### Middleware Functions

1. **validateRequestBodyForEvents:** Middleware to validate the request body for event creation/update. It checks for the presence and format of essential event details such as title, date, time, and organizer. It also ensures that the event date and time are not in the past.

2. **validateEmailForRegistration:** Middleware to validate the attendee's email for event registration. It checks for the presence and format of the attendee email and verifies that the attendee exists in the users list.

3. **extractRole:** Middleware to extract the user's role from the JWT token. It verifies the JWT token from the authorization header, decodes it to extract the user's role, and attaches the role to the request object.

### Endpoints

1. **GET /events/:id**

   - Retrieves the details of a specific event by its ID.

2. **GET /events**

   - Retrieves all events.

3. **POST /events**

   - Creates a new event.
   - Requires authentication and the role of 'ORGANIZER'.

4. **PUT /events/:id**

   - Updates an existing event.
   - Requires authentication and the role of 'ORGANIZER'.

5. **DELETE /events/:id**

   - Deletes an existing event.
   - Requires authentication and the role of 'ORGANIZER'.

6. **POST /events/:id/register**
   - Registers an attendee for a specific event.
   - Requires authentication.
   - Validates attendee email and checks if it belongs to an existing user.

### Functions

1. **populateEmailForAttendee:**
   - Function to populate the email options for an attendee who has registered for an event.
   - Creates an email message with event details formatted in a readable manner.

## Contributing

Contributions are welcome! If you encounter any issues or have suggestions for improvements, feel free to open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

### Postscript (PS)

1. **JWT Token Secret:**

   - Make sure that you provide the secret to sign the token and verify in the `.env` file. This secret should be securely stored and not shared publicly.

2. **Email Configuration:**

   - For sending emails through Nodemailer, you will need to configure the password from Gmail. This password cannot be shared publicly due to the integrity of the application.

3. **Creating App Password from Gmail:**
   - To configure the password for sending emails via Gmail:
     - Log in to your Gmail account.
     - Navigate to the Security settings.
     - Locate the option to create an "App Password" under the "Sign in to Google" section.
     - Follow the instructions to generate a unique app password for your application.
     - Use this generated app password in your application's email configuration.

### Contact:

- **Questions or Concerns**: If you have any questions or concerns regarding the handling of sensitive information in this project, please don't hesitate to reach out to the project maintainers for guidance and assistance.
