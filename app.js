const express = require("express");

const app = express();

// Index route
app.get("/", (req, res) => {
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
