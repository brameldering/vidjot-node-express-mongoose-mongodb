import express from "express";
import { engine } from "express-handlebars";
import mongoose from "mongoose";

const app = express();

// Connect to mongoose
const dbURI = `mongodb://127.0.0.1:27017/vidjot-dev`;
mongoose
  .connect(dbURI)
  .then(() => {
    console.log("MongoDB Connected ");
  })
  .catch((err) => console.log(err));

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

app.get("/", (req, res) => {
  const title = "Welcome";
  res.render("home", { title: title });
});

app.get("/about", (req, res) => {
  res.render("about");
});

// Start server
const port = 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
