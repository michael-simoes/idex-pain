import express from "express";
import path from "path";

const app = express();
const PORT = process.env.PORT || 4000;

// Simple hello endpoint
app.get("/hello", (_req, res) => {
  res.type("text/plain").send("Hello, wooorld!");
});

// Serve Mexico City map image
app.get("/map", (_req, res) => {
  const mapPath = path.resolve(
    process.cwd(),
    "../frontend/public/Screenshot 2025-09-17 154200.png"
  );

  res.sendFile(mapPath, (err) => {
    if (err) {
      res
        .status(err.statusCode || 500)
        .type("text/plain")
        .send("Map image not found");
    }
  });
});

app.listen(PORT, () => {
  console.log(`Backend listeningggg on port ${PORT}`);
});
