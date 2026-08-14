import { Schema, model, Document, Types } from "mongoose";

// Defines the structure of a message document stored in MongoDB.
export interface IMessage extends Document {
  // References the chat conversation that contains this message.
  chat: Types.ObjectId;

  // References the user who sent the message.
  sender: Types.ObjectId;

  // Stores the text content of the message.
  text: string;

  // Stores the date and time when the message was created.
  createdAt: Date;
}

// Defines the MongoDB schema for message documents.
const messageSchema = new Schema<IMessage>(
  {
    // Associates the message with its corresponding chat.
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },

    // Associates the message with the user who sent it.
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Stores the message content.
    // Trims unnecessary whitespace before saving the value.
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    // Automatically manages createdAt and updatedAt timestamps.
    timestamps: true,
  },
);

// Creates and exports the Message model for database operations.
export default model<IMessage>("Message", messageSchema);
