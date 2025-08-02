import mongoose from "mongoose"

export interface IProgressUpdate extends mongoose.Document {
  projectId: mongoose.Types.ObjectId
  studentId: mongoose.Types.ObjectId
  updateText: string
  date: Date
  createdAt: Date
}

const progressUpdateSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updateText: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.ProgressUpdate || mongoose.model<IProgressUpdate>("ProgressUpdate", progressUpdateSchema)
