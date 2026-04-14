import mongoose, { Schema, Document, Model } from "mongoose";


export interface IPost extends Document {
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}
const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    body: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Post = mongoose.model<IPost>("Post", PostSchema);
