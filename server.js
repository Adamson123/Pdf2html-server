const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for frontend use
app.use(cors());

// Configure file upload storage
const upload = multer({ dest: "uploads/" });

// Convert PDF to HTML
app.post("/convert", upload.single("pdf"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const pdfPath = req.file.path;
  const outputPath = `${pdfPath}.html`;

  exec(`pdf2htmlEX ${pdfPath} ${outputPath}`, (error, stdout, stderr) => {
    if (error) return res.status(500).json({ error: stderr });

    fs.readFile(outputPath, "utf8", (err, htmlData) => {
      if (err) return res.status(500).json({ error: "Error reading HTML file" });

      // Cleanup temp files
      fs.unlink(pdfPath,
