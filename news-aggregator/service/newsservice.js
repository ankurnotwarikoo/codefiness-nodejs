const { default: axios } = require("axios");

// Fetch API key from environment variables
const API_KEY = process.env.GNEWS_API_KEY;
const headlinesUrl = process.env.GNEWS_API_URL;

/**
 * Fetches top headlines based on provided categories.
 * Constructs an array of promises by mapping each category to a call to fetchNewsByCategory function.
 * Waits for all promises to resolve using Promise.all, then flattens the array of articles from all responses.
 * @param {Array} categories - An array of categories for which headlines are to be fetched.
 * @returns {Array} - An array of top headlines articles.
 * @throws {Error} - If there is an error during the HTTP request or response handling.
 */
async function fetchHeadlinesByCategories(categories) {
  try {
    let promiseArray = [];
    const promises = categories.map((category) =>
      fetchNewsByCategory(category)
    );
    const responses = await Promise.all(promises);
    return responses.flatMap((response) => response.data.articles);
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

/**
 * Fetches news articles for a specific category.
 * Constructs the URL with the provided category, language, country, and API key,
 * and then makes an HTTP GET request to fetch news articles from the GNews API.
 * @param {string} category - The category for which news articles are to be fetched.
 * @returns {object} - The response object containing news articles from the API.
 * @throws {Error} - If there is an error during the HTTP request or response handling.
 */
async function fetchNewsByCategory(category) {
  try {
    let url = `${headlinesUrl}?category=${category}&lang=en&country=in&apikey=${API_KEY}`;
    const response = await axios.get(url);
    return response;
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = {
  fetchHeadlinesByCategories,
};
