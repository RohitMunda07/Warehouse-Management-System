import dns from "dns";
import mongoose from "mongoose";

const configureDnsServers = (): void => {
    const defaultServers = ["8.8.8.8", "1.1.1.1"];
    const envServers = process.env.DNS_SERVERS?.split(",").map((server) => server.trim()).filter(Boolean);

    const servers = envServers && envServers.length > 0 ? envServers : defaultServers;
    dns.setServers(servers);
    console.log("Using DNS servers:", servers.join(", "));
};

const connectDB = async (): Promise<void> => {
    configureDnsServers();

    try {
        const mongoUri = process.env.MONGODB_URI;

        if (!mongoUri) {
            console.log(mongoUri);
            throw new Error("MONGODB_URI is not defined in environment variables");
        }

        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });

        console.log("MongoDB connected successfully");

        // Cleanup old indexes after connection
        try {
            const userCollection = mongoose.connection.collection("usermodels");
            await userCollection.dropIndex("username_1").catch(() => {
                // Index might not exist, that's okay
            });
            console.log("✅ Cleaned up old username index");
        } catch (error) {
            // Silent fail if cleanup not needed
        }
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};

export default connectDB;
