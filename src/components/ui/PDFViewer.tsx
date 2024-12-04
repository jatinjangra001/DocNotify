'use client';

import React, { useState, useEffect } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Download, X } from 'lucide-react';

interface PDFViewerProps {
    url: string;
    fileName?: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ url, fileName }) => {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    useEffect(() => {
        // Handle Firebase storage URLs or ensure valid URL
        try {
            const cleanUrl = url.replace(/\?.*$/, '');
            const finalUrl = `${cleanUrl}?alt=media`;
            setPdfUrl(finalUrl);
        } catch (error) {
            console.error('Error processing PDF URL:', error);
            setPdfUrl(url);
        }
    }, [url]);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = pdfUrl || url;
        link.download = fileName || 'document.pdf';
        link.click();
    };

    if (!pdfUrl) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    View PDF
                </Button>
            </DialogTrigger>
            <DialogContent
                className="max-w-4xl w-full h-[90vh] flex flex-col"
                onCloseAutoFocus={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader className="flex flex-row justify-between items-center">
                    <DialogTitle>{fileName || 'PDF Viewer'}</DialogTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownload}
                            className="flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Download
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>
                <div className="flex-grow overflow-hidden">
                    <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js">
                        <div className="h-full overflow-auto">
                            <Viewer
                                fileUrl={pdfUrl}
                                plugins={[defaultLayoutPluginInstance]}
                            />
                        </div>
                    </Worker>
                </div>
            </DialogContent>
        </Dialog>
    );
};