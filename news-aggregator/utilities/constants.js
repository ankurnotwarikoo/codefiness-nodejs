module.exports = {
  UNAUTHORIZED_ERROR: "Unauthorized: No token provided",
  INVALID_TOKEN_ERROR: "Unauthorized: Invalid token",
  UNAUTHORIZED_STATUS: 401,
  FORBIDDEN_STATUS: 403,
  SERVER_LISTENING_MESSAGE: "Server is listening on",
  SERVER_ERROR_MESSAGE: "Something bad happened",
  EMAIL_REGEX: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
  DEFAULT_PREFERENCES: ["general"],
  ERROR_USERNAME_FORMAT:
    "The email address provided is not valid.\n1. It must start with a letter, number, or underscore.\n2. It can contain letters, numbers, hyphens, or underscores followed by an '@' symbol.\n3. The domain part must consist of one or more segments separated by dots, each segment containing letters, numbers, or hyphens.\n4. The domain must end with a segment of 2 to 7 letters representing the top-level domain (e.g., '.com', '.org', '.net')",
  ERROR_EMAIL_EXISTS: "Email-id already exists",
  ERROR_PASSWORD_MANDATORY: "Password is mandatory",
  ERROR_EMAIL_NOT_FOUND: "Email-id not found",
  ERROR_INVALID_PASSWORD: "Invalid password",
  LOGIN_SUCCESSFUL: "Login Successful",
  NOT_FOUND_ERROR: "User not found",
  AXIOS_ERROR:
    "Error due to a failed request with status code 429 (Too Many Requests) in the Axios call",
  FAILED_TO_FETCH_NEWS_BY_CATEGORY: "Failed to fetch news by category",
  PREFERENCES: "preferences",
};
