import { Schema, model } from 'mongoose'

const schema = new Schema(
  {
    base_url: { type: String, required: true },
    train_url: { type: String },
    project_id: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
)

const Dataset = model('Dataset', schema)
export default Dataset
