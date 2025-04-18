const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  images: {
    type: [String],
    default: []
  },
  category: {
    type: String,
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerName: {
    type: String,
    required: true
  },
  sellerType: {
    type: String,
    enum: ['vendor', 'farmer'],
    required: true
  },
  certificationType: {
    type: String,
    default: ''
  },
  minimumOrder: {
    type: Number,
    default: 1,
    min: 1
  },
  bulkDiscounts: {
    type: [{
      quantity: Number,
      price: Number
    }],
    default: []
  },
  city: {
    type: String,
    required: false,
    index: true,
  },
  // New demand-related fields
  viewCount: {
    type: Number,
    default: 0
  },
  orderCount: {
    type: Number,
    default: 0
  },
  lastOrderDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Add pre-save hook to populate city from seller's data
productSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('sellerId')) {
    try {
      // Log the incoming data
      console.log('Pre-save Product hook - Data:', {
        sellerId: this.sellerId,
        sellerName: this.sellerName
      });

      if (this.sellerId) {
        const seller = await mongoose.model('User').findById(this.sellerId);
        if (seller && seller.city) {
          this.city = seller.city;
          console.log(`Setting product city to ${this.city} from seller`);
        }
      }
      next();
    } catch (error) {
      console.error('Error in product pre-save hook:', error);
      next(error);
    }
  } else {
    next();
  }
});

// Add indexing for better query performance
productSchema.index({ sellerId: 1 });
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;