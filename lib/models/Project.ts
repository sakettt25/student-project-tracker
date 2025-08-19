import mongoose from "mongoose"

export interface IProject extends mongoose.Document {
  studentId: mongoose.Types.ObjectId
  facultyId: mongoose.Types.ObjectId
  name: string
  description: string
  techStack: string
  realLifeApplication: string
  expectedCompletionDate: Date
  deadline?: Date  // Add this field
  status: "pending" | "approved" | "rejected" | "evaluated"  // Fix enum values
  progress: number
  createdAt: Date
  updatedAt: Date
  feedback: IFeedback[]
  evaluation?: {
    criteriaScores: Map<string, number>
    comments: string
    recommendations: string
    totalScore: number
    grade: string
    evaluatedAt: string
  }
  score?: number
  grade?: string
  comments?: string
  recommendations?: string
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
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    techStack: { type: String, required: true },
    realLifeApplication: { type: String, required: true },
    expectedCompletionDate: { type: Date, required: true },
    deadline: { type: Date }, // Add deadline field (optional)
    status: { 
      type: String, 
      enum: ["pending", "approved", "rejected", "evaluated"], // Fix enum values
      default: "pending" 
    },
    progress: { type: Number, default: 0 },
    evaluation: {
      criteriaScores: { type: Map, of: Number },
      comments: String,
      recommendations: String,
      totalScore: Number,
      grade: String,
      evaluatedAt: String,
    },
    // Add these fields for backward compatibility
    score: { type: Number },
    grade: { type: String },
    comments: { type: String },
    recommendations: { type: String },
    feedback: [FeedbackSchema], // Use embedded schema instead of ref
  },
  { timestamps: true },
)

export default mongoose.models.Project || mongoose.model<IProject>("Project", projectSchema)
