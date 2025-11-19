import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const productSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  thumbnail: { type: String, default: '' },
  code: { type: String, required: true, unique: true },
  stock: { type: Number, default: 0 },
  category: { type: String, default: '' },
  status: { type: Boolean, default: true }
}, { timestamps: true });

export default model('Product', productSchema);
