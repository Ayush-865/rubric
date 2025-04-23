import mongoose from "mongoose";
import { mongoUrl } from "./envVariables";

let isConnected = false;

async function connect() {
  if (isConnected) {
    return;
  }

  try {
    // console.log(mongoUrl);
    await mongoose.connect(mongoUrl);

    const connection = mongoose.connection;

    connection.on("connected", () => {
      isConnected = true;
      console.log("MongoDB connected successfully");
    });

    connection.on("error", (err) => {
      console.error(
        "MongoDB connection error. Please make sure MongoDB is running. " + err
      );
      process.exit(1);
    });
  } catch (error) {
    console.error("Something went wrong!");
    console.error(error);
  }
}

export default connect;
