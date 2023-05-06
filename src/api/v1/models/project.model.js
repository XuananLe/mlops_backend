import { Schema, model } from 'mongoose'

const schema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
)

const Project = model('Project', schema)
export default Project
