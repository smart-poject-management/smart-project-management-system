import { User } from "../models/user.js";

export const seedAdmin = async () => {
    try {
        const adminExists = await User.findOne({ role: "Admin" });
        if (adminExists) {
            console.log("✓ Admin user already exists");
            return;
        }

        const defaultAdmin = {
            name: "Admin HHGV",
            email: "admin@gmail.com",
            password: "Admin@2026",
            role: "Admin"
        };

        const admin = await User.create(defaultAdmin);
        console.log("✓ Admin user seeded successfully");
        console.log(`  Email: ${admin.email}`);
        console.log(`  Name: ${admin.name}`);
    } catch (error) {
        console.error("Error seeding admin:", error.message);
    }
};
