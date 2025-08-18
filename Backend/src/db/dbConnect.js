import mongoose from "mongoose";

async function connectDB(retries = 5, delay = 2000) {
    try {
        const DbConnection = await mongoose.connect(process.env.MONGO_DB_URI);
        console.log(`Database Connected Successfully,DB HOST: ${DbConnection.connection.host}`);
    } catch (error) {
        console.error("Database Connection Failed", error.message);

        if (retries === 0) {
            console.error("❌ Exhausted retries. Exiting...");
            process.exit(1);
        }

        console.log(`🔄 Retrying connection in ${delay / 1000} seconds...`);
        setTimeout(() => connectDB(retries - 1, delay), delay);
    }
}

export default connectDB;