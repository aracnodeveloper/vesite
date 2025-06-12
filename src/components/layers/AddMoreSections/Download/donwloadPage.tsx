import React, { useState } from 'react';
import {Upload, Link, X, Plus, ChevronLeft} from 'lucide-react';
import {useNavigate} from "react-router-dom";
import {usePreview} from "../../../../context/PreviewContext.tsx";

type DigitalDownloadModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSelectMethod: (method: string) => void;
};

const DigitalDownloadModal: React.FC<DigitalDownloadModalProps>  = ({ isOpen,  onSelectMethod }) => {
    const navigate = useNavigate();
    if (!isOpen) return null;

    const handleBackClick = () => {
        navigate(-1); // Regresa a la página anterior
        // si quieres ir específicamente al dashboard: navigate('/sections');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1a1a1a] rounded-lg p-6 w-96 relative">
                <button
                    onClick={handleBackClick}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <X size={20} />
                </button>

                <h2 className="text-white text-xl font-semibold mb-2">
                    How do you want to sell your digital download?
                </h2>
                <p className="text-gray-400 text-sm mb-6">
                    Sell never-seen-before guides, videos, e-books, audio tracks, masterclasses etc
                </p>

                <div className="space-y-3">
                    <button
                        onClick={() => onSelectMethod('upload')}
                        className="w-full bg-[#2a2a2a] hover:bg-[#323232] rounded-lg p-4 flex items-center justify-between transition-colors"
                    >
                        <div className="flex items-center space-x-3">
                            <Upload size={20} className="text-white" />
                            <span className="text-white">Upload file</span>
                        </div>
                        <div className="text-gray-400">→</div>
                    </button>

                    <button
                        onClick={() => onSelectMethod('url')}
                        className="w-full bg-[#2a2a2a] hover:bg-[#323232] rounded-lg p-4 flex items-center justify-between transition-colors"
                    >
                        <div className="flex items-center space-x-3">
                            <Link size={20} className="text-white" />
                            <span className="text-white">Use URL</span>
                        </div>
                        <div className="text-gray-400">→</div>
                    </button>
                </div>
            </div>
        </div>
    );
};

type UploadFilePageProps = {
    onFinish: OnFinishHandler;
    uploadedFile: File | null;
    setUploadedFile: React.Dispatch<React.SetStateAction<File | null>>;
};



const UploadFilePage: React.FC<UploadFilePageProps>  = ({ onFinish, uploadedFile, setUploadedFile }) => {


    const handleFileUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '*/*';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                setUploadedFile(file);
            }
        };
        input.click();
    };


    const handleFinish = () => {
        if (uploadedFile) {
            console.log("FINISH clicked, uploaded file:", uploadedFile);
            onFinish();
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex">
            <div className="flex-1 relative">
                <div className="absolute top-6 right-6 z-50">
                    <button
                        onClick={handleFinish}
                        disabled={!uploadedFile}
                        className={`px-6 py-2 rounded-lg transition-colors ${
                            uploadedFile
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-[#2a2a2a] text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        FINISH
                    </button>
                </div>

                <div className="min-h-screen bg-[#1a1a1a] relative">
                    <div className="relative z-10 flex items-center justify-center min-h-screen">
                        <div className="bg-[#2a2a2a] rounded-lg p-8 max-w-md w-full mx-4">
                            <h2 className="text-white text-2xl font-semibold mb-4">Upload your file</h2>
                            <p className="text-gray-300 mb-6">
                                Select a file you want to host on your Bio Site. Upload any file up to 300 MB. Bio Sites will send a link to your files automatically to your customer upon purchase!
                            </p>

                            {uploadedFile && (
                                <div className="mb-4 p-3 bg-[#3a3a3a] rounded-lg">
                                    <p className="text-green-400 text-sm">File selected: {uploadedFile.name}</p>
                                    <p className="text-gray-400 text-xs">Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            )}

                            <button
                                onClick={handleFileUpload}
                                className="w-full bg-[#3a3a3a] hover:bg-[#4a4a4a] rounded-lg p-4 flex items-center justify-between transition-colors border-2 border-dashed border-gray-600"
                            >
                                <span className="text-white">{uploadedFile ? 'CHANGE FILE' : 'ADD FILE'}</span>
                                <Plus size={20} className="text-white" />
                            </button>

                            <div className="mt-6 p-4 bg-[#3a3a3a] rounded-lg border-2 border-dashed border-gray-600">
                                <div className="text-center">
                                    <div className="w-16 h-16 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                                        <Plus size={24} className="text-gray-500" />
                                    </div>
                                    <span className="text-gray-400 text-sm">Space for background image</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
type OnFinishHandler = () => void;

type AddUrlPageProps = {
    onFinish: OnFinishHandler;
    uploadedUrl: string;
    setUploadedUrl: React.Dispatch<React.SetStateAction<string>>;
};


const AddUrlPage: React.FC<AddUrlPageProps> = ({ onFinish, uploadedUrl, setUploadedUrl }) => {


    const handleFinish = () => {
        if (uploadedUrl) {
            console.log("FINISH clicked, uploaded file:", uploadedUrl);
            onFinish();
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex">
            <div className="flex-1 relative">
                <div className="absolute top-6 right-0 z-50">
                    <button
                        onClick={handleFinish}
                        disabled={!uploadedUrl}
                        className={`px-6 py-2 rounded-lg transition-colors ${
                            uploadedUrl
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-[#2a2a2a] text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        FINISH
                    </button>

                </div>

                <div className="min-h-screen bg-[#1a1a1a] relative">
                    <div className="relative z-10 flex items-center justify-center min-h-screen">
                        <div className="bg-[#2a2a2a] rounded-lg p-8 max-w-md w-full mx-4">
                            <h2 className="text-white text-2xl font-semibold mb-4">Add URL</h2>
                            <p className="text-gray-300 mb-6">
                                Bio Sites will send this link automatically to your customer upon purchase!
                            </p>

                            <div className="mb-4">
                                <label className="block text-yellow-400 text-sm font-medium mb-2">URL</label>
                                <input
                                    type="url"
                                    value={uploadedUrl}
                                    onChange={(e) => setUploadedUrl(e.target.value)}
                                    placeholder="www.example.com"
                                    className="w-full bg-[#3a3a3a] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
                                />
                            </div>

                            <div className="mt-6 p-4 bg-[#3a3a3a] rounded-lg border-2 border-dashed border-gray-600">
                                <div className="text-center">
                                    <div className="w-16 h-16 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                                        <Plus size={24} className="text-gray-500" />
                                    </div>
                                    <span className="text-gray-400 text-sm">Space for background image</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
type AdminPanelProps = {
    uploadedFile: File | null;
    uploadedUrl: string;
    uploadMethod: 'upload' | 'url' | null;
};


const AdminPanel: React.FC<AdminPanelProps> = ({ uploadedFile, uploadedUrl, uploadMethod }) => {
    const [title, setTitle] = useState('Digital Download');
    const [buttonText, setButtonText] = useState('Buy');
    const [price, setPrice] = useState('1');
    const [urlSlug, setUrlSlug] = useState('asadfs');


    const { downloads, setDownloads } = usePreview();

    const handleSaveProduct = () => {
        const fileUrl = uploadMethod === 'upload'
            ? uploadedFile?.name || ""
            : uploadedUrl;

        setDownloads(prev => [
            ...prev,
            {
                title,
                url: fileUrl,
                price,
            },
        ]);
    };

    const navigate = useNavigate();
    const handleBackClick = () => {
        navigate(-1); // Regresa a la página anterior
        // si quieres ir específicamente al dashboard: navigate('/sections');
    };

    const renderFileSection = () => {
        if (uploadMethod === 'upload' && uploadedFile) {
            return (
                <div className="mb-6">
                    <h3 className="text-gray-300 text-sm font-medium mb-4">FILE</h3>
                    <div className="bg-[#2a2a2a] rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                <Upload size={16} className="text-white" />
                            </div>
                            <div>
                                <div className="text-white text-sm">{uploadedFile.name}</div>
                                <div className="text-gray-400 text-xs">
                                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                </div>
                            </div>
                        </div>
                        <button className="text-gray-400 hover:text-white">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8 12l-4-4h8l-4 4z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            );
        }

        if (uploadMethod === 'url' && uploadedUrl) {
            return (
                <div className="mb-6">
                    <h3 className="text-gray-300 text-sm font-medium mb-4">URL</h3>
                    <div className="bg-[#2a2a2a] rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Link size={16} className="text-white" />
                            </div>
                            <div>
                                <div className="text-white text-sm truncate max-w-[200px]">{uploadedUrl}</div>
                                <div className="text-gray-400 text-xs">External link</div>
                            </div>
                        </div>
                        <button className="text-gray-400 hover:text-white">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8 12l-4-4h8l-4 4z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            );
        }

        return null;
    };
    if ((uploadMethod === 'upload' || uploadMethod === 'url') && (uploadedUrl || uploadedFile)) {
        return (
            <div className="min-h-screen  p-6">
                <div className="max-w-md mx-auto">

                    <div className="flex items-center mb-8 mt-3">
                        <button
                            onClick={handleBackClick}
                            className="flex items-center text-gray-300 hover:text-white transition-colors cursor-pointer"
                        >
                            <ChevronLeft size={16} className="mr-2" />
                            Download
                        </button>
                    </div>


                    <div className="space-y-4">
                        <div className="mb-6">
                            <h2 className="text-gray-300 text-sm font-medium mb-4">PAYMENTS</h2>
                            <button
                                className="w-full bg-[#2a2a2a] rounded-lg p-4 text-left text-white hover:bg-[#323232] transition-colors flex items-center justify-between">
                                <span>Add Payment Provider</span>
                                <span>→</span>
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-300 text-sm font-medium mb-2">TITLE</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-[#2a2a2a] rounded-lg p-3 text-white border-none focus:outline-none"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-300 text-sm font-medium mb-2">BUTTON TEXT</label>
                            <input
                                type="text"
                                value={buttonText}
                                onChange={(e) => setButtonText(e.target.value)}
                                className="w-full bg-[#2a2a2a] rounded-lg p-3 text-white border-none focus:outline-none"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-300 text-sm font-medium mb-2">IMAGE & DESCRIPTION</label>
                            <div
                                className="w-full bg-[#2a2a2a] rounded-lg p-8 flex items-center justify-center min-h-[120px]">
                                <div className="text-center">
                                    <div
                                        className="w-12 h-12 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                                        <Plus size={24} className="text-gray-600"/>
                                    </div>
                                    <span className="text-gray-400 text-sm">Add Description</span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-300 text-sm font-medium mb-2">PRICE</label>
                            <div className="w-full bg-[#2a2a2a] rounded-lg p-3 flex items-center">
                                <span className="text-white mr-2">$</span>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="flex-1 bg-transparent text-white border-none focus:outline-none"
                                />
                            </div>
                            <p className="text-gray-400 text-xs mt-2">Go to payment provider to update currency</p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-300 text-sm font-medium mb-2">URL</label>
                            <input
                                type="text"
                                value={urlSlug}
                                onChange={(e) => setUrlSlug(e.target.value)}
                                className="w-full bg-[#2a2a2a] rounded-lg p-3 text-white border-none focus:outline-none"
                            />
                        </div>

                        {/* Mostrar archivo o URL subida */}
                        {renderFileSection()}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                        <button
                            onClick={handleSaveProduct}
                            className="w-full bg-green-600 hover:bg-green-700 rounded-lg p-3 text-white transition-colors"
                        >
                            SAVE PRODUCT TO PREVIEW
                        </button>

                        <button
                            className="w-full bg-red-600 hover:bg-red-700 rounded-lg p-3 text-white transition-colors">
                            DELETE THIS PRODUCT
                        </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};


const DigitalDownloadFlow = () => {
    const [currentView, setCurrentView] = useState('modal');
    const [modalOpen, setModalOpen] = useState(true);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [uploadedUrl, setUploadedUrl] = useState('');
    const [uploadMethod, setUploadMethod] = useState<'upload' | 'url' | null>(null);


    const handleCloseModal = () => {
        setModalOpen(false);
        console.log('Navigating back');
    };

    const handleSelectMethod = (method: 'upload' | 'url') => {
        setModalOpen(false);
        setCurrentView(method);
        setUploadMethod(method);
    };

    const handleFinish = () => {
        setCurrentView('admin');
        console.log("currentView is now:", currentView);
        setModalOpen(false);
    };



    console.log("Rendering view:", currentView);

    if (currentView === 'upload') {
        return (
            <UploadFilePage
                onFinish={handleFinish}
                uploadedFile={uploadedFile}
                setUploadedFile={setUploadedFile}
            />
        );
    }

    if (currentView === 'url') {
        return (
            <AddUrlPage
                onFinish={handleFinish}
                uploadedUrl={uploadedUrl}
                setUploadedUrl={setUploadedUrl}
            />
        );
    }

    if (currentView === 'admin') {
        return (
            <AdminPanel
                uploadedFile={uploadedFile}
                uploadedUrl={uploadedUrl}
                uploadMethod={uploadMethod}
            />
        );
    }

    return (
       <div>


            <DigitalDownloadModal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                onSelectMethod={handleSelectMethod}
            />
        </div>
    );
};

export default DigitalDownloadFlow;