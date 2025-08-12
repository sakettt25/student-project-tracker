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
  feedback: IFeedback[]
}

export interface IFeedback {
  message: string
  facultyId: string
  facultyName: string
  createdAt: Date
  action: "approve" | "reject"
}

const FeedbackSchema = new mongoose.Schema({
  message: String,
  facultyId: String,
  facultyName: String,
  createdAt: { type: Date, default: Date.now },
  action: { type: String, enum: ["approve", "reject"] },
})

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
    feedback: [FeedbackSchema],
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Project || mongoose.model<IProject>("Project", projectSchema)
