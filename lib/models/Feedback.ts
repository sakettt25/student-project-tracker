import mongoose from "mongoose"

export interface IFeedback extends mongoose.Document {
  projectId: mongoose.Types.ObjectId
  facultyId: mongoose.Types.ObjectId
  message: string
  createdAt: Date
}

const feedbackSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Feedback || mongoose.model<IFeedback>("Feedback", feedbackSchema)
