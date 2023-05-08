import { Schema, model } from 'mongoose'

const schema = new Schema(
  {
    project_id: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    author_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
  },
  { timestamps: true }
)

const MLModel = model('MLModel', schema)
export default MLModel
