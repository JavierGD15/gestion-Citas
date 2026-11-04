import mongoose from 'mongoose';

const contadorSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    secuencia: { type: Number, default: 0 }
  },
  { collection: 'contadores', versionKey: false }
);

contadorSchema.statics.siguiente = async function siguiente(clave) {
  const contador = await this.findOneAndUpdate(
    { _id: clave },
    { $inc: { secuencia: 1 } },
    { new: true, upsert: true }
  );
  return contador.secuencia;
};

export default mongoose.model('Contador', contadorSchema);
