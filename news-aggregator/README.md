# News Aggregator API

A RESTful API for fetching news headlines based on user preferences. This API allows users to register, log in, update their preferences, and fetch personalized news articles.

## Features

User registration and authentication using JSON Web Tokens (JWT)
Updating user preferences for news categories
Fetching personalized news headlines based on user preferences

## Getting Started

1. **Clone the Repository**:

   git clone https://github.com/your-username/codefiness-nodejs.git
   cd codefiness-nodejs

2. **Install Dependencies**:

   npm install

3. ** Set up environment variables **:

   Create a .env file in the root directory and add the following variables:
   JWT_SIGNING_SECRET=your_jwt_secret
   GNEWS_API_KEY=your_gnews_api_key
   PORT=3000

4. **Start the Server**:

   npm start

5. **Interact with the API**:

   Once the server is running, you can use tools like cURL, Postman, or any HTTP client to interact with the API endpoints.

## Authentication Mechanism

The authentication mechanism used in this application is JSON Web Tokens (JWT). Upon successful login, the server generates a JWT token containing the user's email and signs it with a secret key.
This token is then sent back to the client and should be included in subsequent requests to authenticated endpoints in the authorization header. The server verifies the token's authenticity and extracts the user's information from it to authorize the request.

## GNEWS API

The GNews API is designed to be user-friendly, with clear documentation and straightforward endpoints.
Developers can easily integrate the API into their applications to access real-time news data and enhance user experiences.

## API Endpoints

1.Register a New User
To register a new user, make a POST request to the /api/auth/register endpoint with the user's email and password in the request body.
Upon successful registration, the server will respond with the details of the registered user.

2.Login as an Existing User
To log in as an existing user, make a POST request to the /api/auth/login endpoint with the user's email and password in the request body.
Upon successful authentication, the server will respond with a JWT token.

3.Fetch User Preferences
To fetch user preferences, make a GET request to the /api/users/:userId/preferences endpoint with the user's ID in the URL path.
Ensure that the JWT token is included in the request headers as the authorization, appended with 'Bearer ' since the initial 7 characters would be trimmed to fetch the token. Upon successful authentication, the server will respond with the user's preferences.

4.Update User Preferences
To update user preferences, make a PUT request to the /api/users/:userId/preferences endpoint with the user's ID in the URL path and the updated preferences in the request body.
Ensure that the JWT token is included in the request headers as the authorization, appended with 'Bearer ' since the initial 7 characters would be trimmed to fetch the token.

5.Fetch News Headlines
To fetch news headlines based on user preferences, make a GET request to the /api/news/:userId/news endpoint with the user's ID in the URL path.
Ensure that the JWT token is included in the request headers as the authorization, appended with 'Bearer ' since the initial 7 characters would be trimmed to fetch the token. Upon successful authentication, the server will respond with the top news headlines tailored to the user's preferences.

## Contributing

Contributions are welcome! If you encounter any issues or have suggestions for improvements, feel free to open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

## PS

### Important Security Note:

- **Sensitive Information**: The project requires certain sensitive information such as the `JWT_SIGNED_SECRET` and `GNEWS_API_KEY` to function properly. However, it's crucial to ensure that these keys remain confidential and are not exposed to end-users or stored in public repositories.

### Best Practices:

- **Security Measures**: Take appropriate security measures to safeguard sensitive information. Store API keys and other secrets securely, preferably in environment variables or using a secure key management solution.

- **Gitignore**: To prevent accidental exposure of sensitive information, ensure that any files containing API keys or secrets are added to the `.gitignore` file. This ensures they are not included in version control or shared publicly.

### Project Setup:

- **Configuration**: Before running the project, make sure to set up the necessary environment variables for `JWT_SIGNED_SECRET` and `GNEWS_API_KEY`. These values should be obtained from secure sources and added to a `.env` file in the project root directory.

- **Local Development**: While it may be necessary to commit these keys for local development and testing purposes, exercise caution and avoid pushing them to public repositories or deploying them to production environments.

### Contact:

- **Questions or Concerns**: If you have any questions or concerns regarding the handling of sensitive information in this project, please don't hesitate to reach out to the project maintainers for guidance and assistance.
