const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "*",
  methods: "*",
  allowedHeaders: "*",
  exposedHeaders: "*",
}));

const upload = multer({ dest: "uploads/" });

app.post("/convert", upload.single("pdf"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const pdfPath = req.file.path;
  const outputPath = `${pdfPath}.html`;

  // ✅ Updated pdf2htmlEX command (based on official documentation)
  const pdf2htmlEXCommand = `pdf2htmlEX --zoom 1 --embed-css 1 --embed-font 1 --embed-image 0 --bg-format png --process-outline 0 "${pdfPath}" "${outputPath}"`;

  try {
    exec(pdf2htmlEXCommand, async (error, stdout, stderr) => {
      if (error) {
        console.error("pdf2htmlEX Error:", stderr);
        return res.status(500).json({ error: stderr });
      }

      try {
        const htmlData = await fs.readFile(outputPath, "utf8");
        await fs.unlink(pdfPath);
        await fs.unlink(outputPath);
        res.send(htmlData);
      } catch (readError) {
        console.error("File read/unlink error:", readError);
        return res.status(500).json({ error: "Error processing files" });
      }
    });

  } catch (e) {
    console.error("exec error:", e);
    return res.status(500).json({ error: "Server error" });
  }
});

app.post("/", (req, res) => {
  res.status(200).json({ message: "POST is working" });
});

app.get("/", (req, res) => res.send("🚀 pdf2htmlEX Server is running!"));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
