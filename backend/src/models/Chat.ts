import { Schema, model, Document, Types } from "mongoose";

// Defines the structure of a chat document stored in MongoDB.
export interface IChat extends Document {
  // Stores the MongoDB IDs of users participating in the chat.
  participants: Types.ObjectId[];

  // Stores the date and time when the chat was created.
  createdAt: Date;
}

// Defines the MongoDB schema for chat documents.
const chatSchema = new Schema<IChat>(
  {
    // References the users who are participating in the chat.
    // ObjectId references allow Mongoose to associate each participant
    // with a corresponding document in the User collection.
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
  },
  {
    // Automatically manages createdAt and updatedAt timestamps.
    timestamps: true,
  },
);

// Creates and exports the Chat model for database operations.
export default model<IChat>("Chat", chatSchema);
