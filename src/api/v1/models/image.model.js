import { Schema, model } from 'mongoose'

const schema = new Schema(
  {
    name: { type: String, required: true },
    uid: { type: String, required: true }, // same uid => same images
    url: { type: String, required: true },
    is_original: { type: Boolean, required: true },
    project_id: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    dataset_id: { type: Schema.Types.ObjectId, ref: 'Dataset' },
    label_id: { type: Schema.Types.ObjectId, ref: 'Label' }
  },
  { timestamps: true }
)

const Image = model('Image', schema)
export default Image
