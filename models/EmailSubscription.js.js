import mongoose from "mongoose";

const emailSubscriptionSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true },
  userId: { type: String, ref: "User" }, // Optional: Link to Clerk userId
  subscribedAt: { type: Date, default: Date.now },
});

export default mongoose.models.EmailSubscription || mongoose.model("EmailSubscription", emailSubscriptionSchema);