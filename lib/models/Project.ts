import mongoose from "mongoose"

export interface IProject extends mongoose.Document {
  studentId: mongoose.Types.ObjectId
  facultyId: mongoose.Types.ObjectId
  name: string
  description: string
  techStack: string
  realLifeApplication: string
  expectedCompletionDate: Date
  status: "pending" | "in_review" | "approved" | "rejected"
  progress: number
  createdAt: Date
  updatedAt: Date
}

const projectSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    techStack: {
      type: String,
      required: true,
    },
    realLifeApplication: {
      type: String,
      required: true,
    },
    expectedCompletionDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in_review", "approved", "rejected"],
      default: "pending",
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Project || mongoose.model<IProject>("Project", projectSchema)
