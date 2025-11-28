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
    formData.append("file_path", file);
  } else {
    formData.append("file", file);
  }

  // Attach authorization token if available
  const token = localStorage.getItem("token");
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  

  const resp = await axios.post(path, formData, {
    headers,
  });

  return resp.data; 
}
