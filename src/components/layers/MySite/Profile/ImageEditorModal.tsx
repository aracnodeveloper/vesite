import { Modal, Button, Slider } from "antd";
import { useState, useCallback } from "react";
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
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

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

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                }
            }, "image/jpeg");
        });
    };

    const handleSave = async () => {
        if (!croppedAreaPixels) return;

        try {
            const croppedImage = await getCroppedImg(
                imageUrl,
                croppedAreaPixels,
                rotation
            );
            onSave(croppedImage);
        } catch (error) {
            console.error("Error cropping image:", error);
        }
    };

    const handleReset = () => {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
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
                        onClick={onCancel}
                        className="text-white hover:text-gray-300 text-sm font-medium"
                    >
                        CANCELAR
                    </button>
                    <h2 className="text-white text-base font-medium">Imagen Editor</h2>
                    <button
                        onClick={handleSave}
                        className="text-white hover:text-gray-300 text-sm font-medium"
                    >
                        GUARDAR
                    </button>
                </div>

                {/* Cropper Area */}
                <div className="relative flex-1 bg-black">
                    <Cropper
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
                            <span className="text-white text-xs font-medium">ROTACIÓN</span>
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
                            className="flex-1 bg-gray-700 text-white border-none hover:bg-gray-600"
                        >
                            Reset
                        </Button>
                        <Button
                            onClick={handleSave}
                            type="primary"
                            className="flex-1 bg-blue-600 border-none hover:bg-blue-700"
                        >
                            Aplicar Cambios
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