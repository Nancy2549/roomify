import { useRef, useState } from "react";
import { PROGRESS_INCREMENT, PROGRESS_INTERVAL_MS, REDIRECT_DELAY_MS } from "../../lib/constants";

type UploadProps = {
  isSignedIn: boolean;
  onComplete: (base64: string) => void;
};

export default function Upload({ isSignedIn, onComplete }: UploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Drag & drop a file, or click to choose one.");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const processFile = (file: File) => {
    if (!isSignedIn) {
      setStatusMessage("Please sign in before uploading.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;
      setProgress(0);
      setStatusMessage("Uploading...");

      let currentProgress = 0;
      const intervalId = window.setInterval(() => {
        currentProgress = Math.min(100, currentProgress + PROGRESS_INCREMENT);
        setProgress(currentProgress);

        if (currentProgress === 100) {
          window.clearInterval(intervalId);
          setStatusMessage("Finalizing upload...");
          window.setTimeout(() => {
            setStatusMessage("Upload complete.");
            onComplete(base64);
          }, REDIRECT_DELAY_MS);
        }
      }, PROGRESS_INTERVAL_MS);
    };

    reader.onerror = () => {
      setStatusMessage("Failed to read file. Please try another image.");
    };

    reader.readAsDataURL(file);
  };

  const handleFiles = (files: FileList | null) => {
    if (!isSignedIn) return;
    if (!files || files.length === 0) return;
    processFile(files[0]);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isSignedIn) return;
    setIsDragging(true);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (!isSignedIn) return;
    handleFiles(event.dataTransfer.files);
  };

  const handleClick = () => {
    if (!isSignedIn) return;
    inputRef.current?.click();
  };

  const dropzoneClass = `upload-card${isDragging ? " drag-active" : ""}${!isSignedIn ? " disabled" : ""}`;

  return (
    <div
      className={dropzoneClass}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleClick();
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleChange}
      />
      <div className="upload-head">
        <div className="upload-icon">
          <span className="icon-placeholder">+</span>
        </div>
        <h3>Upload your floor plan</h3>
        <p>{isSignedIn ? statusMessage : "Sign in to upload files."}</p>
      </div>
      <div className="upload-body">
        <div className="upload-meta">
          <p>{isSignedIn ? "Supports JPG, PNG, up to 10 MB" : "Upload disabled until signed in."}</p>
        </div>
        <div className="upload-progress">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
