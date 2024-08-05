# Task Tracking System

Welcome to the Task Tracking System! This project provides a comprehensive backend solution for task tracking and team collaboration, built using Node.js, Express.js, and MongoDB.

## Overview

The Task Tracking System is designed to facilitate task management and team collaboration through a RESTful API. The project structure includes:

- `app.js`: Entry point of the application. Initializes the Express server, connects to the database, and sets up routes.
- `controller/`: Contains route handlers for user authentication, task management, team management, and user profile operations.
  - `authenticationcontroller.js`: Manages user authentication and authorization.
  - `taskcontroller.js`: Handles task-related operations such as CRUD and task assignment.
  - `teamscontroller.js`: Manages team creation and management.
  - `usercontroller.js`: Handles user profile operations.
- `config/`: Contains configuration files, including database connection settings.
  - `db.js`: Handles MongoDB connection.
- `enums/`: Contains enumerations used throughout the application.
  - `task.js`: Defines task-related enumerations.
- `helpers/`: Includes utility functions and constants.
  - `constants.js`: Defines constant values used in the application.
- `models/`: Defines Mongoose schemas for data models.
  - `comments.js`: Schema for task comments.
  - `tasks.js`: Schema for tasks.
  - `teams.js`: Schema for teams.
  - `users.js`: Schema for users.
- `service/`: Contains services for sending emails.
  - `emailservice.js`: Handles email notifications.
- `test/`: Contains test files for testing various parts of the application.
  - `authentication.test.js`: Tests for authentication functionalities.
  - `task.test.js`: Tests for task management functionalities.
- `.env`: Environment variables for configuration.
- `.gitignore`: Specifies files and directories to be ignored by Git.
- `package.json`: Lists project dependencies and scripts.

## Features

### User Authentication and Management

- Register and log in users securely with JWT-based authentication.
- Manage user profiles with endpoints for viewing and updating personal information.

### Task Management

- Create, read, update, and delete tasks with attributes like title, description, and due date.
- Assign tasks to users and manage task statuses.
- Filter and search tasks based on status, title, or description.

### Team/Project Collaboration

- Create and manage teams or projects.
- Collaborate on tasks with comments and attachments.
- Real-time notifications for task assignments and updates (optional).

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ankurnotwarikoo/codefiness-nodejs.git
   cd task-tracking-system
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Setup environment variables:

   Create a `.env` file in the root directory and add the following environment variables:

   ```env
   JWT_SIGNING_SECRET=your_jwt_signing_secret
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_password
   TEST_MONGO_URI=mongodb://localhost:27017/test_DB
   ```

   Replace `your_jwt_signing_secret`, `your_email@example.com`, `your_email_password`, and `mongodb://localhost:27017/test_DB` with your actual values.

4. Start the application:

   ```bash
   npm start
   ```

## API Endpoints

### User Authentication and Management

- Register a new user

  ```
  POST /api/auth/register
  ```

- Login

  ```
  POST /api/auth/login
  ```

- View and update user profile
  ```
  GET /api/me
  PUT /api/me
  ```

### Task Management

- Create a new task

  ```
  POST /api/task-management/tasks
  ```

- Get all tasks assigned to the authenticated user

  ```
  GET /api/task-management/tasks/assigned-to-me
  ```

- Get a specific task by ID

  ```
  GET /api/task-management/tasks/:id
  ```

- Update a specific task

  ```
  PUT /api/task-management/tasks/:id
  ```

- Mark a task as completed

  ```
  PATCH /api/task-management/tasks/:id/complete
  ```

- Delete a task

  ```
  DELETE /api/task-management/tasks/:id
  ```

- Assign a task to a user

  ```
  PUT /api/task-management/tasks/:id/assign
  ```

- Add a comment to a task
  ```
  POST /api/task-management/tasks/:taskId/comments
  ```

### Team/Project Management

- Create a new team/project

  ```
  POST /api/team-management/teams
  ```

- Get all teams/projects
  ```
  GET /api/team-management/teams
  ```

## Testing

To run the tests, use the following command:

```bash

npm test

```

## Notes

- The application uses JWT for authentication and authorization.
- For real-time notifications, you can integrate a Socket.IO implementation.
- Ensure MongoDB server is running on localhost:27017. Adjust the TEST_MONGO_URI in the .env file as needed.

## Contributing

Contributions are welcome! If you encounter any issues or have suggestions for improvements, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
