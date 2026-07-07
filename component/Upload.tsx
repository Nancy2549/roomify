import React, {useCallback, useEffect, useRef, useState} from 'react'
import {useOutletContext} from "react-router";
import {CheckCircle2, ImageIcon, UploadIcon} from "lucide-react";
import {PROGRESS_INCREMENT, REDIRECT_DELAY_MS, PROGRESS_INTERVAL_MS, PUTER_WORKER_URL} from "../lib/constants";

interface UploadProps {
    onComplete?: (base64Data: string) => Promise<boolean | void> | boolean | void;
}

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

const Upload = ({ onComplete }: UploadProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { isSignedIn } = useOutletContext<AuthContext>();
    const canUpload = isSignedIn || !PUTER_WORKER_URL;

    const resetUploadState = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setFile(null);
        setProgress(0);
    }, []);

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, []);

    const handleCompletion = useCallback(async (base64Data: string) => {
        try {
            const result = await onComplete?.(base64Data);
            if (result === false) {
                resetUploadState();
            }
        } catch {
            resetUploadState();
        } finally {
            timeoutRef.current = null;
        }
    }, [onComplete, resetUploadState]);

    const processFile = useCallback((file: File) => {
        if (!canUpload || file.size > MAX_FILE_SIZE_BYTES || !allowedTypes.includes(file.type)) {
            return false;
        }

        setFile(file);
        setProgress(0);

        const reader = new FileReader();
        let didFail = false;

        const clearTimers = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };

        reader.onerror = () => {
            didFail = true;
            clearTimers();
            resetUploadState();
        };

        reader.onabort = () => {
            didFail = true;
            clearTimers();
            resetUploadState();
        };

        reader.onloadend = () => {
            if (didFail || reader.error || typeof reader.result !== "string") {
                clearTimers();
                resetUploadState();
                return;
            }

            const base64Data = reader.result;

            intervalRef.current = setInterval(() => {
                setProgress((prev) => {
                    const next = prev + PROGRESS_INCREMENT;
                    if (next >= 100) {
                        if (intervalRef.current) {
                            clearInterval(intervalRef.current);
                            intervalRef.current = null;
                        }
                        timeoutRef.current = setTimeout(() => {
                            void handleCompletion(base64Data);
                        }, REDIRECT_DELAY_MS);
                        return 100;
                    }
                    return next;
                });
            }, PROGRESS_INTERVAL_MS);
        };
        reader.readAsDataURL(file);
        return true;
    }, [handleCompletion, isSignedIn, resetUploadState]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!canUpload) return;
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (!canUpload) return;

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.size <= MAX_FILE_SIZE_BYTES && allowedTypes.includes(droppedFile.type)) {
            processFile(droppedFile);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!canUpload) return;

        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.size <= MAX_FILE_SIZE_BYTES && allowedTypes.includes(selectedFile.type)) {
            processFile(selectedFile);
        }
    };

    return (
        <div className="upload">
            {!file ? (
                <div
                    className={`dropzone ${isDragging ? 'is-dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        className="drop-input"
                        accept=".jpg,.jpeg,.png,.webp"
                        disabled={!canUpload}
                        onChange={handleChange}
                    />

                    <div className="drop-content">
                        <div className="drop-icon">
                            <UploadIcon size={20} />
                        </div>
                        <p>
                            {canUpload ? (
                                "Click to upload or just drag and drop"
                            ) : (
                                "Sign in or sign up with Puter to upload"
                            )}
                        </p>
                        <p className="help">Maximum file size 50 MB.</p>
                    </div>
                </div>
            ) : (
                <div className="upload-status">
                    <div className="status-content">
                        <div className="status-icon">
                            {progress === 100 ? (
                                <CheckCircle2 className="check" />
                            ): (
                                <ImageIcon className="image" />
                            )}
                        </div>

                        <h3>{file.name}</h3>

                        <div className='progress'>
                            <div className="bar" style={{ width: `${progress}%` }} />

                            <p className="status-text">
                                {progress < 100 ? 'Analyzing Floor Plan...' : 'Redirecting...'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
export default Upload
