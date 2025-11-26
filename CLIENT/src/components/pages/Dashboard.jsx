import React, { useState } from "react";
import Navbar from "./Navbar";
import PdfInput from "./Pdfinput";
import AIResponse from "./Pdfoutput";
import { sendDocumentToGemini } from "../routes/gemini";

const Dashboard = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    setSummary("");
    setFlashcards([]);
    setPdfUrl(null);

    try {
      const data = await sendDocumentToGemini(file, { wantPdf: true });
      setSummary(data.summary || "");
      setFlashcards(data.flashcards || []);
      if (data.pdf_b64) {
        const byteChars = atob(data.pdf_b64);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
          byteNumbers[i] = byteChars.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      }
    } catch (err) {
      console.error("Gemini processing error:", err);
      setSummary("An error occurred while processing the file.");
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