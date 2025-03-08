const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { spawn } = require("child_process");
const fs = require("fs").promises;
const path = require("path");
const pdfLib = require("pdf-lib"); // To check total pages

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "", methods: "", allowedHeaders: "", exposedHeaders: "" }));

const upload = multer({ dest: "uploads/" });

async function getTotalPages(pdfPath) {
  const pdfBytes = await fs.readFile(pdfPath);
  const pdfDoc = await pdfLib.PDFDocument.load(pdfBytes);
  return pdfDoc.getPageCount();
}

app.post("/convert", upload.single("pdf"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const pdfPath = req.file.path;
  const totalPages = await getTotalPages(pdfPath);
  if (totalPages === 0) return res.status(400).json({ error: "PDF has no pages" });

  let page = 1;
  const batchSize = Math.min(10, totalPages); // Max 10 pages per batch
  res.setHeader("Content-Type", "text/html");

  const processBatch = () => {
    if (page > totalPages) {
      fs.unlink(pdfPath); // Cleanup uploaded file
      return res.end(); // Done
    }

    const lastPage = Math.min(page + batchSize - 1, totalPages);
    const outputFile = `${pdfPath}-${page}-${lastPage}.html`;

    const pdf2htmlEX = spawn("wsl", [
      "pdf2htmlEX",
      `--first-page=${page}`,
      `--last-page=${lastPage}`,
      "--zoom", "1",
      "--embed-css", "1",
      "--embed-font", "1",
      "--embed-image", "1",
      "--bg-format", "svg",
      "--process-outline", "0",
      "--optimize-text", "1",
      pdfPath,
      outputFile
    ]);

    pdf2htmlEX.on("close", async () => {
      try {
        const htmlData = await fs.readFile(outputFile, "utf8");
        res.write(htmlData);
        await fs.unlink(outputFile); // Cleanup batch file
        page += batchSize;
        processBatch(); // Process next batch
      } catch (err) {
        console.error("File processing error:", err);
        page += batchSize;
        processBatch(); // Skip if file not found
      }
    });
  };

  processBatch();
});

app.get("/", (req, res) => res.send("🚀 pdf2htmlEX Streaming Server is running!"));
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));