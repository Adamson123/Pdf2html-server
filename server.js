const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "*",
    methods: "*",
    allowedHeaders: "*",
    exposedHeaders: "*",
  })
);

const upload = multer({ dest: "uploads/" });

app.post("/convert", upload.single("pdf"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const pdfPath = req.file.path;

  try {
    // Spawn pdf2htmlEX process
    const pdf2htmlProcess = spawn("pdf2htmlEX", [
      "--zoom",
      "1",
      "--embed-css",
      "1",
      "--embed-font",
      "1",
      "--embed-image",
      "1",
      "--bg-format",
      "svg",
      "--process-outline",
      "0",
      "--optimize-text",
      "1",
      pdfPath,
      "-" // Use "-" to output to stdout instead of writing a file
    ]);

    res.setHeader("Content-Type", "text/html");

    // Pipe pdf2htmlEX output directly to response (streaming)
    pdf2htmlProcess.stdout.pipe(res);

    pdf2htmlProcess.stderr.on("data", (err) => {
      console.error("pdf2htmlEX Error:", err.toString());
    });

    pdf2htmlProcess.on("close", async () => {
      // Cleanup: Delete uploaded PDF
      await fs.promises.unlink(pdfPath).catch(() => {});
    });

  } catch (e) {
    console.error("Execution error:", e);
    return res.status(500).json({ error: "Server error" });
  }
});

app.get("/", (req, res) => res.send("🚀 pdf2htmlEX Streaming Server is running!"));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));