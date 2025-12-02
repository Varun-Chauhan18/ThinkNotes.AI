import React, { useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";
import PdfInput from "./Pdfinput";
import AIResponse from "./Pdfoutput";
import { uploadStudyFile } from "../routes/api";

const Dashboard = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const lastPdfUrlRef = useRef(null);

  useEffect(() => {
    return () => {
      if (lastPdfUrlRef.current) {
        URL.revokeObjectURL(lastPdfUrlRef.current);
        lastPdfUrlRef.current = null;
      }
    };
  }, []);

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    setSummary("");
    setFlashcards([]);
    setPdfUrl(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      
      console.log("Sending file to API:", { filename: file.name });
      const data = await uploadStudyFile(formData, true);
      console.log("Upload response:", data);

      setSummary(data?.summary ?? "");
      setFlashcards(data?.flashcards ?? []);

      if (data?.pdf_b64) {
        if (lastPdfUrlRef.current) {
          URL.revokeObjectURL(lastPdfUrlRef.current);
          lastPdfUrlRef.current = null;
        }

        const byteChars = atob(data.pdf_b64);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
          byteNumbers[i] = byteChars.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        lastPdfUrlRef.current = url;
        setPdfUrl(url);
      } else {
        setPdfUrl(null);
      }
    } catch (err) {
      console.error("Gemini processing error:", err?.response || err?.message || err);
      const serverMsg =
        err?.response?.data?.detail || err?.response?.data?.message || err?.response?.data || null;

      setSummary(
        serverMsg
          ? `Server error: ${typeof serverMsg === "string" ? serverMsg : JSON.stringify(serverMsg)}`
          : "An error occurred while processing the file. Check console / network tab for details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex flex-col overflow-hidden">
      <Navbar />
      <main className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:p-6 box-border">
        <PdfInput file={file} setFile={setFile} onGenerateResponse={handleGenerate} />
        <AIResponse loading={loading} summary={summary} flashcards={flashcards} pdfUrl={pdfUrl} />
      </main>
    </div>
  );
};

export default Dashboard;
