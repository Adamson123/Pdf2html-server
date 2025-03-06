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

  // 🛠️ Optimized Command to Exclude Background Images
  const pdf2htmlEXCommand = `pdf2htmlEX \
    --bg-format none \   # No background images
    --css-fallback 1 \   # Use div + CSS for background colors
    --embed-css 0 \      # Don't embed CSS (keeps file smaller)
    --embed-font 0 \     # Don't embed fonts (external links)
    --embed-image 1 \    # Allow images (only for illustrations)
    --fit-width 1024 \   # Set width for proper layout
    --zoom 1.3 \         # Adjust zoom level
    ${pdfPath} ${outputPath}`;

  try {
    exec(pdf2htmlEXCommand, async (error, stdout, stderr) => {
      if (error) {
        console.error("pdf2htmlEX Error:", stderr);
        return res.status(500).json({ error: stderr });
      }

      try {
        let htmlData = await fs.readFile(outputPath, "utf8");

        // 🛠️ Remove unwanted images (logos, watermarks, etc.)
        htmlData = htmlData.replace(/<img[^>]+src=["']([^"']+)(logo|background|decor|header|footer|icon|ad)[^"']*["'][^>]*>/gi, "");

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
  res.status(200).json({ message: "post is working" });
});

app.get("/", (req, res) => res.send("pdf2htmlEX Server is running!"));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
