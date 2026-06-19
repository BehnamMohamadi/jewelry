const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },

    shortDescription: String,
    description: String,

    goldWeight: {
      type: Number,
      required: true,
    },

    stoneWeight: {
      type: Number,
      default: 0,
    },

    karat: {
      type: Number,
      default: 18,
    },

    wagePercent: {
      type: Number,
      default: 0,
    },

    profitPercent: {
      type: Number,
      default: 0,
    },

    taxPercent: {
      type: Number,
      default: 0,
    },

    images: {
      type: [String],
      default: [],
    },

    sizes: {
      type: [String],
      default: [],
    },

    inventory: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);
