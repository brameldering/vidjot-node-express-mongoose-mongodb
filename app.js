const express = require("express");

const app = express();

// Middleware
app.use((req, res, next) => {
  console.log("Current time: " + Date.now());
  req.parameter = "Test";
  next();
});

// Index route
app.get("/", (req, res) => {
  console.log(req.parameter);
  res.send("Home Page");
});

app.get("/about", (req, res) => {
  res.send("About Page");
});

// Start server
const port = 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
