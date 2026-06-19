const goldPriceSchema = new mongoose.Schema(
  {
    karat: {
      type: Number,
      default: 18,
    },

    pricePerGram: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);
