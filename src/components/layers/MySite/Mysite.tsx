import React, { useState } from "react";
import Profile from "./Profile/profile";
import Social from "./Social/social";
import V_Card from "./V-Card/V-Card";
import Links from "../AddMoreSections/Links/links";
import AppD from "../AddMoreSections/App/app";
import WhatsApp from "../AddMoreSections/WhattsApp/whatsapp";
import Videos from "../AddMoreSections/Video/video";
import Musics from "../AddMoreSections/Music-Posdcast/music_podcast";
import Post from "../AddMoreSections/Socialpost/social_post";
import { usePreview } from "../../../context/PreviewContext.tsx";
import { useSectionsContext } from "../../../context/SectionsContext.tsx";
import { GripVertical } from "lucide-react";

const MySite = () => {
    const { socialLinks, regularLinks, appLinks, whatsAppLinks, getVideoLinks, getMusicLinks, getSocialPostLinks } = usePreview();
    const {
        reorderSections,
        getVisibleSections,
        loading
    } = useSectionsContext();

    // Drag and drop states
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | string | null>(null);

    // Filter active links
    const activeSocialLinks = socialLinks.filter(link => {
        if (!link.isActive) return false;
        const labelLower = link.label.toLowerCase();
        const urlLower = link.url.toLowerCase();
        if (urlLower.includes("api.whatsapp.com")) return false;
        const excludedKeywords = [
            'open.spotify.com/embed', 'music', 'apple music', 'soundcloud', 'audio',
            'youtube.com/watch', 'video', 'vimeo', 'tiktok video',
            'post', 'publicacion', 'contenido','api.whatsapp.com',
            'music embed', 'video embed', 'social post'
        ];
        const isExcluded = excludedKeywords.some(keyword =>
            labelLower.includes(keyword) || urlLower.includes(keyword)
        );
        return !isExcluded;
    });

    const activeRegularLinks = regularLinks.filter(link => link.isActive);
    const activeAppLinks = appLinks.filter(link => link.isActive);
    const activeWhatsAppLinks = whatsAppLinks.filter(link =>
        link.isActive &&
        link.phone &&
        link.message &&
        link.phone.trim() !== '' &&
        link.message.trim() !== ''
    );

    // Get active links from context
    const activeVideoLinks = getVideoLinks();
    const activeMusicLinks = getMusicLinks();
    const activeSocialPostLinks = getSocialPostLinks();

    // Get visible sections based on active links
    const visibleSections = getVisibleSections(
        activeSocialLinks,
        activeRegularLinks,
        activeAppLinks,
        activeWhatsAppLinks,
        activeVideoLinks,
        activeMusicLinks,
        activeSocialPostLinks
    );

    // Filter out VCard from draggable sections - it needs special handling
    const draggableSections = visibleSections.filter(section => section.titulo !== 'VCard');
    const vCardSection = visibleSections.find(section => section.titulo === 'VCard');

    // Component mapping
    const getSectionComponent = (sectionTitle: string) => {
        switch (sectionTitle) {
            case 'Social':
                return <Social key="social" />;
            case 'Links':
                return <Links key="links" />;
            case 'Link de mi App':
                return <AppD key="app" />;
            case 'Contactame':
                return <WhatsApp key="whatsapp" />;
            case 'Music / Podcast':
                return <Musics key="music" />;
            case 'Social Post':
                return <Post key="post" />;
            case 'VCard':
                return <V_Card key="vcard" />;
            default:
                return null;
        }
    };

    // Drag handlers
    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', '');

        // Add visual feedback with delay like in LinksPage
        setTimeout(() => {
            const target = e.target as HTMLElement;
            target.style.opacity = '0.5';
        }, 0);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDragEnter = (e: React.DragEvent, index: number | string) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        // Check if we're actually leaving the element
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;

        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            setDragOverIndex(null);
        }
    };

    const handleDrop = async (e: React.DragEvent, dropIndex: number | string) => {
        e.preventDefault();

        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        try {
            // For VCard drop zone (after all draggable sections)
            if (dropIndex === 'vcard') {
                const newSections = [...draggableSections];
                const draggedSection = newSections[draggedIndex];

                // Remove dragged item
                newSections.splice(draggedIndex, 1);
                // Add at the end (before VCard position)
                newSections.push(draggedSection);

                // Update order indexes - VCard should maintain its position
                const reorderData = [
                    ...newSections.map((section, index) => ({
                        id: section.id,
                        orderIndex: index + 1
                    })),
                    ...(vCardSection ? [{
                        id: vCardSection.id,
                        orderIndex: newSections.length + 1
                    }] : [])
                ];

                await reorderSections(reorderData);
            } else if (typeof dropIndex === 'number') {
                // Normal drop within draggable sections
                const newSections = [...draggableSections];
                const draggedSection = newSections[draggedIndex];

                // Remove dragged item
                newSections.splice(draggedIndex, 1);
                // Insert at new position
                newSections.splice(dropIndex, 0, draggedSection);

                // Update order indexes
                const reorderData = [
                    ...newSections.map((section, index) => ({
                        id: section.id,
                        orderIndex: index + 1
                    })),
                    ...(vCardSection ? [{
                        id: vCardSection.id,
                        orderIndex: newSections.length + 1
                    }] : [])
                ];

                await reorderSections(reorderData);
            }
        } catch (error) {
            console.error('Error reordering sections:', error);
        } finally {
            setDraggedIndex(null);
            setDragOverIndex(null);
        }
    };

    const handleDragEnd = (e: React.DragEvent) => {
        // Reset visual feedback
        const target = e.target as HTMLElement;
        target.style.opacity = '1';
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    if (loading) {
        return (
            <div className="w-full mt-60">
                <h3 className="text-lg font-bold text-gray-800 mb-5 uppercase tracking-wide text-start">My VeSite</h3>
                <div className="space-y-3">
                    <Profile />
                    <div className="text-center text-gray-500">Loading sections...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full mt-30 mb-5">
            <h3 className="text-lg font-bold text-gray-800 mb-5 uppercase tracking-wide text-start">My VeSite</h3>
            <div className="space-y-5">
                {/* Profile always shows first */}
                <Profile />

                {/* Render draggable section components */}
                {draggableSections.map((section, index) => {
                    const component = getSectionComponent(section.titulo);
                    if (!component) return null;

                    return (
                        <div
                            key={section.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={handleDragOver}
                            onDragEnter={(e) => handleDragEnter(e, index)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, index)}
                            className={`
                                group relative
                                transition-all duration-200 ease-in-out
                                 hover:shadow-sm
                                ${draggedIndex === index ? 'opacity-50 scale-70 shadow-lg' : ''}
                                ${dragOverIndex === index ? 'border-2 border-blue-400 border-dashed bg-blue-50' : 'border border-transparent'}
                            `}
                        >
                            {/* Drag handle - visible on hover or when dragging */}
                            <div className={`
                                absolute left-0 top-2/5 transform -translate-y-1/2 z-10
                                p-1 rounded bg-white shadow-sm border border-gray-200
                                ${draggedIndex === index ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                                transition-opacity duration-200
                                cursor-grab active:cursor-grabbing
                            `}>
                                <GripVertical size={16} className="text-gray-400" />
                            </div>

                            {/* Section content */}
                            <div className={`
                                transition-all duration-200
                                ${draggedIndex === index ? 'pl-8' : 'pl-0 group-hover:pl-8'}
                            `}>
                                {component}
                            </div>

                            {/* Drop indicator */}
                            {dragOverIndex === index && draggedIndex !== index && (
                                <div className="absolute inset-0 pointer-events-none border-2 border-blue-400 border-dashed rounded-lg bg-blue-50/30" />
                            )}
                        </div>
                    );
                })}

                {/* VCard drop zone */}
                <div
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, 'vcard')}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'vcard')}
                    className={`
                        transition-all duration-200
                        ${dragOverIndex === 'vcard' ? 'border-t-4 border-blue-400 border-dashed pt-2' : ''}
                    `}
                >
                    {/* Drop indicator for VCard area */}
                    {dragOverIndex === 'vcard' && draggedIndex !== null && (
                        <div className="mb-2 p-2 border-2 border-blue-400 border-dashed rounded-lg bg-blue-50 text-center">
                            <span className="text-sm text-blue-600 font-medium">Soltar aquí</span>
                        </div>
                    )}

                    {/* VCard always shows last */}
                    <V_Card />
                </div>

                {/* Videos section - not draggable */}
                {activeVideoLinks.length > 0 && <Videos key="video" />}
            </div>
        </div>
    );
};

export default MySite;