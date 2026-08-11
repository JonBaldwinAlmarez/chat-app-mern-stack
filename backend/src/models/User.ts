import { Document, Schema, model } from "mongoose";
import bcrypt from "bcryptjs"

// Defines the structure of a user document stored in MongoDB.
// Extends Mongoose's Document interface to include MongoDB document properties.
export interface IUsers extends Document {
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

// Defines the MongoDB schema for user documents.
// The generic type ensures the schema follows the IUsers interface.
const userSchema = new Schema<IUsers>({
    // User's unique username.
    // Trims leading and trailing whitespace before storing the value.
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },

    // User's email address.
    // Stored in lowercase to maintain consistent formatting and uniqueness.
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },

    // User's password.
    // The minimum length requirement helps enforce a basic password policy.
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    
}, {
    timestamps: true,   // Automatically adds and manages createdAt and updatedAt timestamps.
});

// Hashes the user's password before saving the document to the database.
// The password is only re-hashed when it has been modified, preventing
// an already-hashed password from being hashed again on unrelated updates.

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;                   // Skip password hashing if the password has not been modified.
    const salt = await bcrypt.genSalt(10);                      // Generate a cryptographic salt with a cost factor of 10.
    this.password = await bcrypt.hash(this.password, salt);     // Hash the password using the generated salt before storing it.
  });


// Compares a plain-text password with the hashed password stored in the database.
// Returns true when the passwords match and false otherwise.
userSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);    // bcrypt securely compares the provided password against the stored hash.
};

export default model<IUsers>("User", userSchema);