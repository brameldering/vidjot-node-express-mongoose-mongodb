import mongoose, { trusted } from "mongoose";
const Schema = mongoose.Schema;

// create schema
const IdeaSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  date: { type: Date, default: Date.now() },
});

const IdeaModel = mongoose.model("ideas", IdeaSchema);

export default IdeaModel;
