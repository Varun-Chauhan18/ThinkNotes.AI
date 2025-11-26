import { FileText } from "lucide-react";
import Markdown from "react-markdown";

const AIResponse = ({ loading, summary, flashcards, pdfUrl }) => {
  return (
    <section className="relative col-span-1 bg-gray-800 p-6 rounded-lg shadow-lg h-full flex flex-col overflow-hidden">
      <h2 className="text-xl font-semibold text-gray-300 mb-4">AI Response</h2>

      {/* Scrollable Content */}
      <div className="flex-grow p-6 border-2 border-gray-700 rounded-lg border-dashed overflow-y-auto relative max-h-[calc(100vh-200px)]">
        {loading ? (
          <div className="text-gray-400 text-center">
            <p>Processing… Please wait.</p>
            <div className="flex gap-2 mt-6 justify-center">
              <span className="w-3 h-3 bg-white/60 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-3 h-3 bg-white/60 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              <span className="w-3 h-3 bg-white/60 rounded-full animate-bounce [animation-delay:0.6s]"></span>
            </div>
          </div>
        ) : summary || (flashcards && flashcards.length > 0) ? (
          <>
            {/* Summary */}
            {summary && (
              <>
                <h3 className="text-lg font-semibold text-purple-300 mb-2">Summary</h3>
                <div className="whitespace-pre-wrap text-gray-300 text-sm mb-6">
                  <Markdown>{summary}</Markdown>
                </div>
              </>
            )}

            {/* Flashcards */}
            {flashcards?.length > 0 && (
              <>
                <h3 className="text-lg font-semibold text-purple-300 mb-2">
                  Flashcards ({flashcards.length})
                </h3>
                <ul className="space-y-3">
                  {flashcards.map((fc, idx) => (
                    <li
                      key={idx}
                      className="p-3 rounded-md bg-gray-700 text-gray-200 text-sm text-left"
                    >
                      <p className="font-semibold mb-1">
                        Q{idx + 1}: {fc.question}
                      </p>
                      <p>A{idx + 1}: {fc.answer}</p>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center h-full">
            <FileText size={48} className="text-gray-600 mb-4" />
            <p className="text-lg text-gray-500">No document processed yet</p>
            <p className="text-sm text-gray-600 mt-2">
              Upload a document & click Generate to see AI output here.
            </p>
          </div>
        )}
      </div>

      {/* Floating Download PDF Button */}
      {pdfUrl && !loading && (
        <a
          href={pdfUrl}
          download="ThinkNotes_Response.pdf"
          aria-label="Download AI Response as PDF"
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white font-semibold text-sm shadow-lg"
        >
          Download PDF
        </a>
      )}
    </section>
  );
};

export default AIResponse;
