const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { spawn } = require("child_process"); // Use spawn for streaming
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "",
    methods: "",
    allowedHeaders: "",
    exposedHeaders: "",
  })
);

const upload = multer({ dest: "uploads/" });

app.post("/convert", upload.single("pdf"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const pdfPath = req.file.path;
  const outputHtmlPath = `${pdfPath}.html`;

  try {
    const pdf2htmlEXCommand = "pdf2htmlEX";
    const pdf2htmlEXArgs = [
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
      outputHtmlPath,
    ];

    const pdf2htmlEXProcess = spawn(pdf2htmlEXCommand, pdf2htmlEXArgs);

    // Stream stdout to the client
    res.setHeader("Content-Type", "text/html"); // Set appropriate content type
    pdf2htmlEXProcess.stdout.pipe(res);

    // Handle errors
    pdf2htmlEXProcess.stderr.on("data", (data) => {
      console.error("pdf2htmlEX Error:", data.toString());
      // Optionally, you might want to send an error to the client here.
    });

    // Handle process exit
    pdf2htmlEXProcess.on("close", async (code) => {
      if (code !== 0) {
        console.error(`pdf2htmlEX process exited with code ${code}`);
        //If no error has already been sent, send a general error.
        if(!res.headersSent){
            res.status(500).send("pdf2htmlEX conversion failed");
        }
        try {
            await fs.unlink(pdfPath);
            await fs.unlink(outputHtmlPath);
        } catch(unlinkError){
            console.error("error unlinking files", unlinkError);
        }
        return;
      }

      console.log(`pdf2htmlEX process exited with code ${code}`);
      try{
        await fs.unlink(pdfPath);
        await fs.unlink(outputHtmlPath);
      } catch(unlinkError){
        console.error("error unlinking files", unlinkError);
      }

    });

  } catch (e) {
    console.error("Execution error:", e);
    return res.status(500).json({ error: "Server error" });
  }
});

app.get("/", (req, res) =>
  res.send("🚀 pdf2htmlEX Optimized Server is running!")
);

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
