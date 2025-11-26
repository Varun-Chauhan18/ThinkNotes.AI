// src/routes/gemini.js
// Sends a PDF (File or local path) to your Python backend and returns the AI result.
//
// Usage:
//  - sendDocumentToGemini(fileObject)               // fileObject from <input type="file">
//  - sendDocumentToGemini("/mnt/data/....png")      // local path string (special-case)
// Note: If you pass a local path string, this code will append it as `file_path` in the form-data.
// Your backend must handle `file_path` if you intend to support server-side file reads.
// In normal browser usage, pass a File object.

import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_GEMINI_API_BASE ?? "http://localhost:8000/api/gemini";

/**
 * Send a file (File object) or a local file path (string) to the Gemini upload endpoint.
 *
 * @param {File|string} file  File object (from <input>) OR local file path string
 * @param {Object} options
 * @param {boolean} options.wantPdf  whether server should return generated PDF (default true)
 * @returns {Promise<Object>} { summary, flashcards, pdf_b64? }
 */
export async function sendDocumentToGemini(file, { wantPdf = true } = {}) {
  const path = `${BASE_URL}/upload?return_pdf=${wantPdf ? "true" : "false"}`;

  const formData = new FormData();

  // Support both browser File objects and a local path string.
  if (typeof file === "string") {
    // If caller passes a local path (e.g. during testing or tooling),
    // include it under "file_path". Your backend must recognise this field
    // and read the file from disk (this is not standard for browser clients).
    formData.append("file_path", file);
  } else {
    // Normal browser flow: append the File object under the "file" field.
    formData.append("file", file);
  }

  // Attach authorization token if available
  const token = localStorage.getItem("token");
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  // IMPORTANT: do NOT set Content-Type here when sending FormData.
  // Let the browser/axios set the correct multipart boundary header.

  const resp = await axios.post(path, formData, {
    headers,
    // axios will parse JSON response by default
  });

  return resp.data; // { summary, flashcards, pdf_b64? }
}
