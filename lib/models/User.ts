import mongoose from "mongoose"
import bcrypt from "bcryptjs"

export interface IUser extends mongoose.Document {
  email: string
  password: string
  role: "student" | "faculty"
  name: string
  university?: string
  rollNumber?: string
  semester?: number
  facultyId?: mongoose.Types.ObjectId
  createdAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["student", "faculty"],
    },
    name: {
      type: String,
      required: true,
    },
    university: {
      type: String,
      required: function (this: IUser) {
        return this.role === "faculty"
      },
    },
    rollNumber: {
      type: String,
      required: function (this: IUser) {
        return this.role === "student"
      },
    },
    semester: {
      type: Number,
      required: function (this: IUser) {
        return this.role === "student"
      },
    },
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function (this: IUser) {
        return this.role === "student"
      },
    },
  },
  {
    timestamps: true,
  },
)

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.models.User || mongoose.model<IUser>("User", userSchema)
