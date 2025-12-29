import { useEffect } from 'react';
import {  Image as ImageIcon } from 'lucide-react';
import { message } from 'antd';
import Cookies from 'js-cookie';

import { useTextBlocks } from '../../../../hooks/useTextBlocks.ts';
import GalleryGrid from './GalleryGrid.tsx';
import type { TextBlock } from '../../../../interfaces/textBlocks.ts';
import Loading from '../../../shared/Loading.tsx';
import BackButton from '../../../shared/BackButton.tsx';

const GalleryPage = () => {
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

        // Filtrar solo bloques activos para el límite
        const activeBlocks = blocks.filter(b => b.isActive === true);

        if (activeBlocks.length >= 8) {
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
                orderIndex: activeBlocks.length
            });

            // 2. Si recibimos un archivo, subirlo inmediatamente
            if (file && newBlock && newBlock.id) {
                await uploadBlockImage(newBlock.id, file);
                message.success('Imagen agregada correctamente');
            } else {
                message.success('Espacio creado');
            }

        } catch (error) {
            console.error('Error creating block:', error);
            message.error('Error al agregar la imagen');
        }
    };

    // Filtrar solo bloques activos
    const activeBlocks = blocks.filter(b => b.isActive === true);

    const handleImageUpload = async (blockId: string, imageFile: Blob) => {
        try {
            await uploadBlockImage(blockId, imageFile);
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
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

    const handleReorder = async (newBlocks: TextBlock[]) => {
        if (!biositeId) return;

        console.log('--- INICIANDO REORDENAMIENTO ---');
        console.log('Nuevo orden visual:', newBlocks.map(b => b.id));

        try {
            const updates = newBlocks.map((block, newIndex) => {
                if (block.orderIndex !== newIndex) {
                    console.log(`Actualizando ID ${block.id}: index ${block.orderIndex} -> ${newIndex}`);

                    return updateBlock(block.id, {
                        orderIndex: newIndex,
                        content: block.content || '',
                        isActive: true
                    });
                }
                return null;
            }).filter(Boolean);

            if (updates.length > 0) {
                console.log(`Enviando ${updates.length} actualizaciones al servidor...`);
                await Promise.all(updates);
                message.success('Orden actualizado correctamente');
                await getBlocksByBiosite(biositeId);
            } else {
                console.log('No hubo cambios reales en los índices.');
            }

        } catch (error) {
            console.error('Error FATAL reordenando bloques:', error);
            message.error('Error al guardar el nuevo orden');
            getBlocksByBiosite(biositeId);
        }
    };

    return (
        <div className="w-full h-full mb-10 mt-0 lg:mt-20 p-2 max-w-xl mx-auto">

            <div className="px-6 py-4 border-b border-gray-700">
                <BackButton text={"Galería de imágenes"} />
            </div>

                    <div className="mb-8">
                        {loading && blocks.length === 0 ? (
                            <div className="flex justify-center p-8">
                                <Loading />
                            </div>
                        ) : activeBlocks.length === 0 ? (
                            // CORREGIDO: Mostrar cuando NO hay bloques activos
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
                                    className="bg-black text-white px-6 py-2.5 rounded-full font-medium hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl cursor-pointer"
                                >
                                    Add Image
                                </button>
                            </div>
                        ) : (
                            // Pasar solo bloques activos al componente
                            <GalleryGrid
                                blocks={activeBlocks}
                                onImageUpload={handleImageUpload}
                                onImageAdd={(file) => handleAddImage(file)}
                                onImageDelete={handleDeleteImage}
                                onReorder={handleReorder}
                                loading={loading}
                            />


                        )}
                    </div>

        </div>
    );
};

export default GalleryPage;