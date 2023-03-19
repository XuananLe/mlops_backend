import { Schema, model } from 'mongoose'

const schema = new Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    project_id: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    label_id: { type: Schema.Types.ObjectId, ref: 'Label' }
  },
  { timestamps: true }
)

const Image = model('Image', schema)
export default Image
