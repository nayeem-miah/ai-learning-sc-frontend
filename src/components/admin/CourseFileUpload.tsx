"use client";

import React, { useState, useRef } from "react";
import CustomFileIcon from "../icons/CustomFileIcon";
import TrashIcon from "../icons/TrashIcon";
import { useUploadKnowledgeFileMutation } from "@/lib/feature/knowledge/knowledgeApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface UploadedFile {
    id: string;
    name: string;
    size: string;
}

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)) + ' ' + sizes[i];
};

export default function CourseFileUpload() {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [uploadKnowledgeFile, { isLoading: isUploading }] = useUploadKnowledgeFileMutation();

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files;
        if (selectedFiles && selectedFiles.length > 0) {
            const file = selectedFiles[0];
            setSelectedFile(file);
            const newFile = {
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                size: formatFileSize(file.size)
            };
            setFiles([newFile]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error("Please select a file first");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const response = await uploadKnowledgeFile(formData).unwrap();
            toast.success(response.message || "File uploaded successfully");
            setFiles([]);
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error(error?.data?.message || "Failed to upload file");
        }
    };

    const removeFile = () => {
        setFiles([]);
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="mx-auto my-12 w-full px-7 py-10 rounded-2xl outline-1 -outline-offset-1 border border-[#D0AD6B]/20 flex flex-col justify-start items-end gap-6 bg-[#0D0D0D]">
            <div className="self-stretch flex flex-col justify-center items-center gap-6">
                <div className="self-stretch flex justify-between items-start">
                    <div className="flex flex-col justify-start items-start gap-2">
                        <div className="w-96 h-8 justify-start text-[#F5F5F5] text-2xl font-semibold font-['Roboto'] leading-8">Upload files</div>
                        <div className="justify-start text-[#F5F5F5] text-base font-normal">Select and upload the files your choice</div>
                    </div>
                </div>

                {/* Dropzone area */}
                <div
                    onClick={handleBrowseClick}
                    className="px-10 py-12 rounded-[24px] outline-2 outline-dashed -outline-offset-1 outline-[#D0AD6B]/20 flex flex-col justify-center items-center gap-8 cursor-pointer bg-[#0D0D0D] hover:bg-[#D0AD6B]/10 transition-all w-full"
                >
                    <div className="flex flex-col justify-center items-center gap-3 text-center">
                        <div className="text-[#F5F5F5] text-2xl font-bold font-['Roboto'] leading-tight">Choose a file or drag & drop it here</div>
                        <div className="text-[#A5A5A5] text-base font-normal font-['Roboto'] leading-tight">Docx, Pdf, and up to 5MB</div>
                    </div>
                    <div className="px-4 py-2 rounded-lg outline-1 -outline-offset-1 outline-[#D0AD6B]/80 flex justify-center items-center gap-2.5 hover:bg-[#D0AD6B]/10 transition-colors">
                        <div className="justify-start text-[#F5F5F5] text-xl font-semibold font-['Roboto'] leading-8">Browse File</div>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.docx"
                    />

                    {/* Moved File List inside Dropzone */}
                    {files.length > 0 && (
                        <div className="w-full mt-2 space-y-3 cursor-default" onClick={(e) => e.stopPropagation()}>
                            {files.map((file) => (
                                <div
                                    key={file.id}
                                    className="w-full pl-4 pr-2 py-3 bg-[#D0AD6B]/20 rounded-[10px] outline-1 -outline-offset-1 outline-[#D0AD6B]/50 flex justify-between items-center group transition-all"
                                >
                                    <div className="flex justify-start items-center gap-5">
                                        <div className="shrink-0">
                                            <CustomFileIcon
                                                fileName={""}
                                                fileSize={""}
                                                className="w-24 h-11"
                                            />
                                        </div>
                                        <div className="inline-flex flex-col justify-center items-start gap-0.5">
                                            <div className="justify-center text-[#F5F5F5] text-base font-medium font-['Inter'] leading-6 tracking-wide">
                                                {file.name}
                                            </div>
                                            <div className="inline-flex justify-start items-center gap-1.5">
                                                <div className="justify-center text-[#A5A5A5] text-sm font-normal font-['Inter'] leading-5">
                                                    {file.size}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeFile(); }}
                                        className="p-1.5 hover:bg-black/20 rounded-lg transition-all"
                                    >
                                        <TrashIcon className="w-6 h-6 hover:scale-110 transition-transform" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Action Button */}
            <button
                onClick={handleUpload}
                disabled={isUploading || !selectedFile}
                className="h-14 px-10 py-4 bg-[#F5F5F5] rounded-2xl shadow-[0px_10px_20px_0px_rgba(11,25,87,0.12)] inline-flex justify-center items-center gap-2 cursor-pointer hover:bg-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isUploading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin text-[#1A1A1A]" />
                        <div className="justify-start text-[#1A1A1A] text-base font-semibold">
                            Uploading...
                        </div>
                    </>
                ) : (
                    <div className="justify-start text-[#1A1A1A] text-base font-semibold">
                        Upload Knowledge Files
                    </div>
                )}
            </button>
        </div>
    );
}
