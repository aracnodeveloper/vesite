import { Modal, Button, Slider } from "antd";
import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";

// Definir tipos localmente
interface Point {
    x: number;
    y: number;
}

interface Area {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface ImageEditorModalProps {
    visible: boolean;
    imageUrl: string;
    onCancel: () => void;
    onSave: (croppedImage: Blob) => void;
    aspectRatio?: number;
}

const ImageEditorModal = ({
    visible,
    imageUrl,
    onCancel,
    onSave,
    aspectRatio = 1
}: ImageEditorModalProps) => {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [key, setKey] = useState(0);

    // Reset automático cuando se abre el modal
    useEffect(() => {
        if (visible) {
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setRotation(0);
            setCroppedAreaPixels(null);
            setKey(prev => prev + 1); // Forzar re-render del Cropper
        }
    }, [visible]);

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener("load", () => resolve(image));
            image.addEventListener("error", (error) => reject(error));
            image.setAttribute("crossOrigin", "anonymous");
            image.src = url;
        });

    const getCroppedImg = async (
        imageSrc: string,
        pixelCrop: Area,
        rotation = 0
    ): Promise<Blob> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
            throw new Error("No 2d context");
        }

        const maxSize = Math.max(image.width, image.height);
        const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

        canvas.width = safeArea;
        canvas.height = safeArea;

        ctx.translate(safeArea / 2, safeArea / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-safeArea / 2, -safeArea / 2);

        ctx.drawImage(
            image,
            safeArea / 2 - image.width * 0.5,
            safeArea / 2 - image.height * 0.5
        );

        const data = ctx.getImageData(0, 0, safeArea, safeArea);

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.putImageData(
            data,
            Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
            Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Canvas is empty'));
                }
            }, "image/jpeg", 0.95);
        });
    };

    const handleSave = async () => {
        if (!croppedAreaPixels || isSaving) {
            console.warn('Cannot save: missing data or already saving');
            return;
        }

        try {
            setIsSaving(true);

            // Validar que tenemos una URL de imagen válida
            if (!imageUrl || imageUrl.trim() === '') {
                throw new Error('Invalid image URL');
            }

            const croppedImage = await getCroppedImg(
                imageUrl,
                croppedAreaPixels,
                rotation
            );

            // Validar que el blob es válido
            if (!croppedImage || croppedImage.size === 0) {
                throw new Error('Failed to generate cropped image');
            }

            await onSave(croppedImage);

        } catch (error: any) {
            console.error("Error cropping image:", error);
            // Aquí podrías mostrar un mensaje de error al usuario
            alert(`Error al procesar la imagen: ${error?.message || 'Error desconocido'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
        setCroppedAreaPixels(null);
        setKey(prev => prev + 1); // Forzar re-render del Cropper
    };

    const handleCancel = () => {
        handleReset();
        setIsSaving(false);
        onCancel();
    };

    return (
        <Modal
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={850}
            centered
            className="image-editor-modal"
            closeIcon={null}
            styles={{
                body: { padding: 0, borderRadius: '16px', overflow: 'hidden' },
                mask: { backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0, 0, 0, 0.4)' }
            }}
        >
            <div className="flex flex-col h-[700px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-md border-b border-slate-200 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                            <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-slate-800 text-base font-semibold tracking-wide">Editor de Imagen</h2>
                            <p className="text-slate-500 text-[11px] uppercase tracking-wider font-medium mt-0.5">Ajuste y recorte</p>
                        </div>
                    </div>
                    <button
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Cropper Area */}
                <div className="relative flex-1 bg-slate-50 overflow-hidden pattern-dots">
                    {isSaving && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300">
                            <div className="text-center flex flex-col items-center transform scale-100">
                                <div className="relative">
                                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-100 mb-4"></div>
                                    <div className="absolute top-0 left-0 animate-spin rounded-full h-12 w-12 border-2 border-indigo-500 border-t-transparent mb-4 shadow-[0_0_15px_rgba(99,102,241,0.2)]"></div>
                                </div>
                                <p className="text-slate-800 text-sm font-medium tracking-wide">Procesando tu imagen...</p>
                                <p className="text-slate-500 text-xs mt-1">Por favor espera un momento</p>
                            </div>
                        </div>
                    )}
                    <Cropper
                        key={key}
                        image={imageUrl}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={aspectRatio}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onRotationChange={setRotation}
                        onCropComplete={onCropComplete}
                        style={{
                            containerStyle: {
                                background: 'transparent'
                            },
                            cropAreaStyle: {
                                border: '2px solid rgba(99, 102, 241, 0.9)',
                                boxShadow: '0 0 0 9999em rgba(0, 0, 0, 0.4)'
                            }
                        }}
                    />
                </div>

                {/* Controls */}
                <div className="px-8 py-6 bg-white border-t border-slate-200 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* Zoom Control */}
                        <div className="group">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                    </svg>
                                    <span className="text-slate-600 text-xs font-bold tracking-wider uppercase group-hover:text-slate-900 transition-colors">Zoom</span>
                                </div>
                                <span className="text-indigo-600 text-xs font-mono font-semibold bg-indigo-50 px-2 py-0.5 rounded-md">{Math.round(zoom * 100)}%</span>
                            </div>
                            <Slider
                                min={1}
                                max={3}
                                step={0.01}
                                value={zoom}
                                onChange={setZoom}
                                className="custom-slider"
                            />
                        </div>

                        {/* Rotation Control */}
                        <div className="group">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span className="text-slate-600 text-xs font-bold tracking-wider uppercase group-hover:text-slate-900 transition-colors">Rotación</span>
                                </div>
                                <span className="text-indigo-600 text-xs font-mono font-semibold bg-indigo-50 px-2 py-0.5 rounded-md">{rotation}°</span>
                            </div>
                            <Slider
                                min={0}
                                max={360}
                                step={1}
                                value={rotation}
                                onChange={setRotation}
                                className="custom-slider"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                        <Button
                            onClick={handleReset}
                            disabled={isSaving}
                            type="text"
                            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>}
                            className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 h-11 px-5 rounded-xl font-medium transition-colors flex items-center gap-2"
                        >
                            Restablecer
                        </Button>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={handleCancel}
                                disabled={isSaving}
                                className="bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-400 h-11 px-6 rounded-xl font-medium transition-all"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSave}
                                type="primary"
                                loading={isSaving}
                                disabled={isSaving || !croppedAreaPixels}
                                icon={!isSaving && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                                className="bg-indigo-600 border-none hover:bg-indigo-500 text-white h-11 px-8 rounded-xl font-medium shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 disabled:bg-indigo-600/50 disabled:text-white/50 disabled:shadow-none disabled:transform-none"
                            >
                                {isSaving ? 'Guardando...' : 'Aplicar y Guardar'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .image-editor-modal .ant-modal-content {
                    background-color: transparent !important;
                    box-shadow: none !important;
                    padding: 0 !important;
                }
                .custom-slider .ant-slider-track {
                    background-color: #6366f1 !important;
                    height: 6px !important;
                    border-radius: 6px !important;
                }
                .custom-slider .ant-slider-rail {
                    background-color: #e2e8f0 !important;
                    height: 6px !important;
                    border-radius: 6px !important;
                }
                .custom-slider .ant-slider-handle::after {
                    box-shadow: 0 0 0 2px #6366f1 !important;
                    background-color: #ffffff !important;
                    width: 16px !important;
                    height: 16px !important;
                    margin-top: -5px !important;
                }
                .custom-slider:hover .ant-slider-handle::after {
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2) !important;
                }
                .custom-slider .ant-slider-handle:focus::after,
                .custom-slider .ant-slider-handle-active::after {
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2) !important;
                }
                
                /* Grid Background Pattern */
                .pattern-dots {
                    background-image: radial-gradient(rgba(0, 0, 0, 0.08) 1px, transparent 1px);
                    background-size: 20px 20px;
                }
            `}</style>
        </Modal>
    );
};

export default ImageEditorModal;