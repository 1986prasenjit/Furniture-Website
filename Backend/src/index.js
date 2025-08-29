import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/dbConnect.js";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 8000;

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

//console.log(myName);
connectDB()
  .then(() => {
    app.listen(PORT);
    console.log(`Server is Listening on PORT: ${PORT}`);
  })
  .catch((error) => {
    console.error("Error while connecting to Database", error);
  });
