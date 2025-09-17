import express from "express";

const app = express();
const PORT = process.env.PORT || 4000;

// Simple hello endpoint
app.get("/hello", (_req, res) => {
  res.type("text/plain").send("Hello, wooorld!");
});

app.listen(PORT, () => {
  console.log(`Backend listeningggg on port ${PORT}`);
});
