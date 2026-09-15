import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      minlength: [1, "Comment cannot be empty"],
      maxlength: [2000, "Comment cannot exceed 2000 characters"],
    },

    editedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

commentSchema.index({ task: 1, createdAt: -1 });
commentSchema.index({ user: 1 });

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
