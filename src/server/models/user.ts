import mongoose, { Schema, Document } from "mongoose";

/**
 * User Interface
 */
export interface IUser extends Document {
  username: string;
  password: string;
}

/**
 * Schema
 */
const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
});

/**
 * Model
 */
export const User = mongoose.model<IUser>("User", UserSchema);