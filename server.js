const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs").promises;
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
  const outputHtmlPath = `${pdfPath}.html`;

  try {
    const pdf2htmlEXCommand = `pdf2htmlEX --zoom 1 --embed-css 1 --embed-font 1 --embed-image 1 --bg-format svg --split-pages 1 --process-outline 0 --optimize-text 1 "${pdfPath}" "${outputHtmlPath}"`;

    exec(pdf2htmlEXCommand, async (error, stdout, stderr) => {
      if (error) {
        console.error("pdf2htmlEX Error:", stderr);
        return res.status(500).json({ error: stderr });
      }

      try {
        const htmlData = await fs.readFile(outputHtmlPath, "utf8");

        // Delete both the uploaded PDF and generated HTML to keep storage clean
        await fs.unlink(pdfPath);
        await fs.unlink(outputHtmlPath);

        res.send(htmlData);
      } catch (readError) {
        console.error("File processing error:", readError);
        return res.status(500).json({ error: "Error processing files" });
      }
    });
  } catch (e) {
    console.error("Execution error:", e);
    return res.status(500).json({ error: "Server error" });
  }
});

app.get("/", (req, res) => res.send("🚀 pdf2htmlEX Optimized Server is running!"));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
