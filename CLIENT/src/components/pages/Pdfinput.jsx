import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";

const PdfInput = ({ file, setFile, onGenerateResponse }) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
      }
    },
    [setFile]
  );

  const handleClearFile = (e) => {
    e.stopPropagation();
    setFile(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
  });

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-full flex flex-col">
      <h2 className="text-xl font-semibold text-gray-300 mb-4">Upload Document</h2>
      <div
        {...getRootProps()}
        className={`flex-grow border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors duration-200 ${
          isDragActive
            ? "border-purple-500 bg-gray-700"
            : "border-gray-600 hover:border-purple-500 hover:bg-gray-700"
        }`}
      >
        <input {...getInputProps()} />
        <Upload size={48} className="text-purple-400 mb-4" />
        {file ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-2">
              
              <p className="text-lg text-gray-300 font-medium max-w-full truncate">
                File selected: <span className="text-purple-300">{file.name}</span>
              </p>
              <button
                onClick={handleClearFile}
                className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 rounded-full hover:bg-gray-700 flex-shrink-0"
                aria-label="Clear selected file"
              >
                <X size={20} />
              </button>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onGenerateResponse(); 
              }}
              className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-md shadow-md hover:bg-purple-700 transition-colors duration-200 text-lg font-semibold"
            >
              Generate Response
            </button>
          </div>
        ) : (
          <>
            <p className="text-lg text-gray-300 font-medium">Drop your file here</p>
            <p className="text-lg text-gray-300 font-medium">or click to browse</p>
          </>
        )}
        <p className="text-sm text-gray-500 mt-4">Supports PDF, DOCX (max 10MB)</p>
      </div>
    </div>
  );
};

export default PdfInput;