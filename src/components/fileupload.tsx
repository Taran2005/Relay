"use client";

import { useUploadThing } from "@/lib/uploadthing";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import React, { useRef, useState } from "react";

interface FileUploadProps {
    onChange: (fileUrl: string) => void;
    value: string;
    endpoint: "messageFile" | "serverImage";
    onUploading?: (state: boolean) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    onChange,
    value,
    endpoint,
    onUploading,
}) => {
    const [preview, setPreview] = useState<string>("");
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { startUpload } = useUploadThing(endpoint, {
        onClientUploadComplete: (res: { url: string }[]) => {
            setIsUploading(false);
            setUploadProgress(0);
            setPreview("");
            onUploading?.(false);
            onChange(res?.[0]?.url || "");
        },
        onUploadError: (err: Error) => {
            setIsUploading(false);
            setUploadProgress(0);
            setPreview("");
            onUploading?.(false);
            console.error("Upload error:", err);
            alert("Upload failed, please try again.");
        },
        onUploadProgress: (progress: number) => {
            setUploadProgress(progress);
        },
    });

    // Show uploaded file preview
    if (value) {
        return (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-zinc-200">
                <Image
                    fill
                    src={value}
                    alt="Uploaded file"
                    className="object-cover"
                />
                <button
                    type="button"
                    onClick={() => onChange("")}
                    className="absolute top-1 right-1 bg-black/70 p-1 rounded-full hover:bg-black/90 transition-colors"
                >
                    <X className="w-4 h-4 text-white" />
                </button>
            </div>
        );
    }

    // Handle file selection and auto-upload
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }

        // Start upload automatically
        setIsUploading(true);
        setUploadProgress(0);
        onUploading?.(true);
        startUpload([file]);
    };

    // Show preview with upload progress
    if (preview && isUploading) {
        return (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-zinc-200">
                <Image
                    fill
                    src={preview}
                    alt="Preview"
                    className="object-cover"
                />
                {/* Upload Progress Overlay */}
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                    <div className="text-white text-xs mb-2">Uploading...</div>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                    <div className="text-white text-xs mt-1">{Math.round(uploadProgress)}%</div>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        setPreview("");
                        setIsUploading(false);
                        setUploadProgress(0);
                        onUploading?.(false);
                        if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                        }
                    }}
                    className="absolute top-1 right-1 bg-red-600/80 p-1 rounded-full hover:bg-red-700/90 transition-colors"
                >
                    <X className="w-3 h-3 text-white" />
                </button>
            </div>
        );
    }

    // Show file upload area
    return (
        <div className="w-32 h-32 border-2 border-dashed border-zinc-300 rounded-lg hover:border-zinc-400 transition-colors">
            <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-2 hover:bg-zinc-50 transition-colors">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={endpoint === "serverImage" ? "image/*" : "image/*,application/pdf"}
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <Upload className="w-6 h-6 text-zinc-400" />
                <span className="text-xs text-zinc-500 text-center px-2">
                    Click to upload
                </span>
            </label>
        </div>
    );
};
