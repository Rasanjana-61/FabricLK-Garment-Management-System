const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },

    //client details
    clientcompanyName: { type: String, required: false, trim: true },
    clientcontactName: { type: String, required: false, trim: true },
    clientphone: { type: String, required: false, trim: true },
    clientaddress: { type: String, required: false, trim: true },
    clientproductCategories: [{ type: String, required: false }],
    clientisActive: { type: Boolean, default: true },

    role: {
      type: String,
      enum: ["Customer", "Admin", "hrmanager", "financialmanager", "Supplier"],
      required: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
