import mongoose from "mongoose";

// Variable to track if the connection has already been established
let isConnected = false;

export async function connect() {
  try {
    // Check if we are already connected
    if (isConnected) {
      console.log("MongoDB is already connected");
      return;
    }

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in the environment variables");
    }

    // Establish the MongoDB connection
    await mongoose.connect(process.env.MONGO_URI);
    const connection = mongoose.connection;

    connection.on("connected", () => {
      console.log("MongoDB connected successfully");
      isConnected = true; // Set the flag to true once connected
    });

    connection.on("error", (err) => {
      console.log("MongoDB connection error:", err);
      process.exit(1); // Exit the process in case of error
    });
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process if an error occurs during connection
  }
}
