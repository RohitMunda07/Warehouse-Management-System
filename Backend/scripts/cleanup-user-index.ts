import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

/**
 * This script drops the old username index from the UserModel collection
 * Run this script to clean up after removing the username field
 */

async function cleanupUserIndex() {
    try {
        console.log("Connecting to MongoDB...");
        
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error("MONGODB_URI environment variable is not set");
        }

        await mongoose.connect(mongoUri);
        console.log("✅ Connected to MongoDB");

        // Access the collection
        const userCollection = mongoose.connection.collection("usermodels");

        // Drop the username index if it exists
        try {
            await userCollection.dropIndex("username_1");
            console.log("✅ Successfully dropped username_1 index");
        } catch (error: any) {
            if (error.message.includes("index not found")) {
                console.log("ℹ️  username_1 index does not exist (already removed)");
            } else {
                throw error;
            }
        }

        // List remaining indexes
        const indexes = await userCollection.listIndexes().toArray();
        console.log("\n📋 Remaining indexes on usermodels collection:");
        indexes.forEach((index, i) => {
            console.log(`  ${i + 1}. ${JSON.stringify(index.name)} - ${JSON.stringify(index.key)}`);
        });

        console.log("\n✅ Cleanup completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error during cleanup:", error);
        process.exit(1);
    }
}

cleanupUserIndex();
