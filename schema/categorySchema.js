const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    image: String,
    icon: String,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);
