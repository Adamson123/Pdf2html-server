const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const upload = multer({ dest: "uploads/" });

app.post("/convert", upload.single("pdf"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const pdfPath = req.file.path;
    const outputHtmlPath = `${pdfPath}.html`;

    res.setHeader("Content-Type", "text/html");
    res.setHeader("Transfer-Encoding", "chunked");

    try {
        const pdf2htmlProcess = spawn("pdf2htmlEX", [pdfPath]);

        pdf2htmlProcess.stdout.on("data", (chunk) => {
            res.write(chunk);
        });

        pdf2htmlProcess.stderr.on("data", (err) => {
            console.error("Conversion error:", err.toString());
        });

        pdf2htmlProcess.on("close", () => {
            res.end();
        });
    } catch (error) {
        console.error("Error processing PDF:", error);
        res.status(500).send("Error processing PDF.");
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));