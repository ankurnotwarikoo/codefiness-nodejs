const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const dbURI = "mongodb://localhost:27017/taskmasterDB"; // Your MongoDB URI
    await mongoose
      .connect(dbURI)
      .then(() => console.log("MongoDB connected"))
      .catch((err) => console.log(err));
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
