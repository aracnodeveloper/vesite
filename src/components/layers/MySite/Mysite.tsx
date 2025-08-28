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
            case 'Video':
                return <Videos key="video" />;
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
    };

    const handleDragOver = (e: React.DragEvent, index: number | string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverIndex(index);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = async (e: React.DragEvent, dropIndex: number | string) => {
        e.preventDefault();

        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

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

            try {
                await reorderSections(reorderData);
            } catch (error) {
                console.error('Error reordering sections:', error);
            }
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

            try {
                await reorderSections(reorderData);
            } catch (error) {
                console.error('Error reordering sections:', error);
            }
        }

        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
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
        <div className="w-full mt-60">
            <h3 className="text-lg font-bold text-gray-800 mb-5 uppercase tracking-wide text-start">My VeSite</h3>
            <div className="space-y-3">
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
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`
                                transition-all duration-200 cursor-move
                                ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
                                ${dragOverIndex === index ? 'border-t-2 border-blue-400' : ''}
                            `}
                            style={{
                                transform: draggedIndex === index ? 'rotate(2deg)' : 'none'
                            }}
                        >
                            {component}
                        </div>
                    );
                })}

                {/* VCard always shows last */}
                <V_Card />
            </div>
        </div>
    );
};

export default MySite;