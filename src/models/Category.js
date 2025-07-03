import mongoose from 'mongoose';
import slugify from 'slugify';

const categorySchema = new mongoose.Schema({
  categoryId: { type: Number, unique: true },
  name: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['draft', 'pending_qc', 'published', 'rejected'], 
    required: true 
  },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  slug: { type: String, unique: true },
});

// Auto-generate slug and categoryId
categorySchema.pre('save', async function (next) {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true });
  }

  if (!this.categoryId) {
    const last = await this.constructor.findOne().sort('-categoryId').exec();
    this.categoryId = last ? last.categoryId + 1 : 1;
  }

  next();
});

// Virtual for nested name path
categorySchema.virtual('fullName').get(function () {
  if (this.populatedParentName) return this.populatedParentName + ' → ' + this.name;
  return this.name;
});

// Helper for display in AdminJS
categorySchema.methods.getFullName = async function () {
  let names = [this.name];
  let current = this;
  while (current.parent) {
    current = await this.model('Category').findById(current.parent);
    if (current) names.unshift(current.name);
  }
  return names.join(' → ');
};

export default mongoose.model('Category', categorySchema);
