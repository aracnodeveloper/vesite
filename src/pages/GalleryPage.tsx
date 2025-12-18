// pages/GalleryPage.tsx

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Image as ImageIcon } from 'lucide-react';
import { message } from 'antd';
import Cookies from 'js-cookie';

import { useTextBlocks } from '../hooks/useTextBlocks';
import GalleryGrid from '../components/Gallery/GalleryGrid';
import type { TextBlock } from '../interfaces/textBlocks';
import Loading from '../components/shared/Loading';
import BackButton from '../components/shared/BackButton';

const GalleryPage = () => {
    const navigate = useNavigate();
    const {
        blocks,
        loading,
        getBlocksByBiosite,
        createBlock,
        uploadBlockImage,
        deleteBlock,
        updateBlock
    } = useTextBlocks();

    // Obtener biositeId
    const biositeId = Cookies.get('biositeId');

    // Cargar bloques iniciales
    useEffect(() => {
        if (biositeId) {
            getBlocksByBiosite(biositeId);
        }
    }, [biositeId]);

    const handleAddImage = async (file?: File) => {
        if (!biositeId) {
            message.error('No se encontró el ID del biosite');
            return;
        }

        if (blocks.length >= 8) {
            message.warning('Has alcanzado el límite de 8 imágenes');
            return;
        }

        try {
            // 1. Crear el bloque primero
            const newBlock = await createBlock({
                biositeId,
                title: '',
                content: '',
                isActive: true,
                orderIndex: blocks.length
            });

            // 2. Si recibimos un archivo, subirlo inmediatamente
            if (file && newBlock && newBlock.id) {
                // message.loading('Subiendo imagen...'); // Opcional, el loading global ya se encarga
                await uploadBlockImage(newBlock.id, file);
                message.success('Imagen agregada correctamente');
            } else {
                // Comportamiento fallback (solo crea espacio)
                message.success('Espacio creado');
            }

        } catch (error) {
            console.error('Error creating block:', error);
            message.error('Error al agregar la imagen');
        }
    };

    const handleImageUpload = async (blockId: string, imageFile: Blob) => {
        try {
            await uploadBlockImage(blockId, imageFile);
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error; // El componente manejará el mensaje de error
        }
    };

    const handleDeleteImage = async (blockId: string) => {
        try {
            await deleteBlock(blockId);
        } catch (error) {
            console.error('Error deleting block:', error);
            throw error;
        }
    };

    // Manejar reordenamiento - VERSIÓN MEJORADA
    const handleReorder = async (newBlocks: TextBlock[]) => {
        if (!biositeId) return;

        console.log('--- INICIANDO REORDENAMIENTO ---');
        console.log('Nuevo orden visual:', newBlocks.map(b => b.id));

        try {
            // Generar las promesas de actualización solo para lo que cambió
            const updates = newBlocks.map((block, newIndex) => {
                // Comparamos el índice guardado con la nueva posición
                if (block.orderIndex !== newIndex) {
                    console.log(`Actualizando ID ${block.id}: index ${block.orderIndex} -> ${newIndex}`);

                    // Enviamos el update con los datos mínimos necesarios
                    return updateBlock(block.id, {
                        orderIndex: newIndex,
                        // Enviamos content/isActive por si el backend valida payload completo
                        content: block.content || '',
                        isActive: true
                    });
                }
                return null;
            }).filter(Boolean); // Eliminamos nulos

            if (updates.length > 0) {
                console.log(`Enviando ${updates.length} actualizaciones al servidor...`);
                await Promise.all(updates);
                message.success('Orden actualizado correctamente');

                // CRÍTICO: Recargar desde el servidor para confirmar el orden real
                await getBlocksByBiosite(biositeId);
            } else {
                console.log('No hubo cambios reales en los índices.');
            }

        } catch (error) {
            console.error('Error FATAL reordenando bloques:', error);
            message.error('Error al guardar el nuevo orden');
            // Recargar para deshacer el desastre visual
            getBlocksByBiosite(biositeId);
        }
    };

    return (
        <div className="min-h-screen relative w-full overflow-hidden">
            {/* Shapes Background */}
            <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-200/30 rounded-full blur-[100px]" />
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[50%] bg-blue-200/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-teal-200/30 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-md mx-auto h-full min-h-screen flex flex-col p-6">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-700">
                    <BackButton text={"Galería de imágenes"} />
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Gallery Content */}
                    <div className="mb-8">
                        {loading && blocks.length === 0 ? (
                            <div className="flex justify-center p-8">
                                <Loading />
                            </div>
                        ) : blocks.length === 0 ? (
                            <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-dashed border-gray-300">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ImageIcon size={32} className="text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">
                                    Add your first photo
                                </h3>
                                <p className="text-gray-500 text-sm mb-6 max-w-[200px] mx-auto">
                                    Create a stunning gallery to showcase your best moments
                                </p>

                                {/* Input oculto para la primera imagen */}
                                <input
                                    id="add-first-image-input"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleAddImage(file);
                                        e.target.value = '';
                                    }}
                                />

                                <button
                                    onClick={() => document.getElementById('add-first-image-input')?.click()}
                                    disabled={loading}
                                    className="bg-black text-white px-6 py-2.5 rounded-full font-medium hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                >
                                    Add Image
                                </button>
                            </div>
                        ) : (
                            <GalleryGrid
                                blocks={blocks}
                                onImageUpload={handleImageUpload}
                                onImageAdd={(file) => handleAddImage(file)} // Explicit arrow function to satisfy TS
                                onImageDelete={handleDeleteImage}
                                onReorder={handleReorder}
                                loading={loading}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GalleryPage;