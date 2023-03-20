import { Schema, model } from 'mongoose'

const schema = new Schema(
  {
    key: { type: String, required: true },
    pattern: { type: String },
    project_id: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
)

const Dataset = model('Dataset', schema)
export default Dataset
