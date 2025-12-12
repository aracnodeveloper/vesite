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
            width={800}
            centered
            className="image-editor-modal"
            styles={{
                body: { padding: 0, background: '#000' }
            }}
        >
            <div className="flex flex-col h-[600px] bg-black">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
                    <button
                        onClick={handleCancel}
                        disabled={isSaving}
                        className={`text-white hover:text-gray-300 text-sm font-medium ${
                            isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                    >
                        CANCEL
                    </button>
                    <h2 className="text-white text-base font-medium">Image Editor</h2>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !croppedAreaPixels}
                        className={`text-white hover:text-gray-300 text-sm font-medium ${
                            isSaving || !croppedAreaPixels ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                    >
                        {isSaving ? 'SAVING...' : 'SAVE'}
                    </button>
                </div>

                {/* Cropper Area */}
                <div className="relative flex-1 bg-black">
                    {isSaving && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-3"></div>
                                <p className="text-white text-sm">Procesando imagen...</p>
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
                                background: '#000'
                            }
                        }}
                    />
                </div>

                {/* Controls */}
                <div className="px-6 py-4 bg-black border-t border-gray-700">
                    {/* Zoom Control */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-white text-xs font-medium">ZOOM</span>
                            <span className="text-gray-400 text-xs">{Math.round(zoom * 100)}%</span>
                        </div>
                        <Slider
                            min={1}
                            max={3}
                            step={0.1}
                            value={zoom}
                            onChange={setZoom}
                            className="custom-slider"
                        />
                    </div>

                    {/* Rotation Control */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-white text-xs font-medium">ROTATION</span>
                            <span className="text-gray-400 text-xs">{rotation}°</span>
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

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                        <Button
                            onClick={handleReset}
                            disabled={isSaving}
                            className="flex-1 bg-gray-700 text-white border-none hover:bg-gray-600 disabled:opacity-50"
                        >
                            Reset
                        </Button>
                        <Button
                            onClick={handleSave}
                            type="primary"
                            loading={isSaving}
                            disabled={isSaving || !croppedAreaPixels}
                            className="flex-1 bg-blue-600 border-none hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isSaving ? 'Processing...' : 'Apply Changes'}
                        </Button>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-slider .ant-slider-track {
                    background-color: #3b82f6;
                }
                .custom-slider .ant-slider-handle {
                    border-color: #3b82f6;
                }
                .custom-slider .ant-slider-handle:hover,
                .custom-slider .ant-slider-handle:focus {
                    border-color: #2563eb;
                }
            `}</style>
        </Modal>
    );
};

export default ImageEditorModal;