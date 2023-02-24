import { Schema, model } from 'mongoose'

const schema = Schema({
    name: { type: String, required: true },
    train_histories: { type: Object, required: true },
})

const MLModel = model('MLModel', schema)
export default MLModel
