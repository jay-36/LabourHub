const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  wage: { type: Number, required: true },
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['open', 'in-progress', 'completed'], default: 'open' }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);