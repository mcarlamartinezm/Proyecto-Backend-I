import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const cartProductSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, default: 1 }
}, { _id: false });

const cartSchema = new Schema({
  products: { type: [cartProductSchema], default: [] }
}, { timestamps: true });

export default model('Cart', cartSchema);
