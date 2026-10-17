export default function toJSONPlugin(schema) {
  const transform = (doc, ret) => {
    delete ret.__v;
    delete ret.id;
    delete ret.password;
    return ret;
  };

  schema.set('toJSON', { virtuals: true, transform });
  schema.set('toObject', { virtuals: true, transform });
}
