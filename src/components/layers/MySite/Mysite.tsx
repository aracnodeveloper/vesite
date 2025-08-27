import React from "react";
import Profile from "./Profile/profile";
import Social from "./Social/social";
import V_Card from "./V-Card/V-Card";
import Links from "../AddMoreSections/Links/links";
import AppD from "../AddMoreSections/App/app";
import WhatsApp from "../AddMoreSections/WhattsApp/whatsapp";
import {usePreview} from "../../../context/PreviewContext.tsx";
import {useFetchLinks} from "../../../hooks/useFetchLinks.ts";

const MySite = () => {
    const { socialLinks, regularLinks, appLinks, whatsAppLinks} = usePreview();
    const {links} = useFetchLinks()

    // Filter active social links (excluding WhatsApp, music, video, posts)
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

    // Función para obtener el orderIndex mínimo de cada tipo de link
    const getMinOrderIndex = (linkType: string) => {
        const filteredLinks = links.filter(link => {
            switch (linkType) {
                case 'social':
                    return activeSocialLinks.some(socialLink => socialLink.id === link.id);
                case 'regular':
                    return activeRegularLinks.some(regularLink => regularLink.id === link.id);
                case 'app':
                    return activeAppLinks.some(appLink => appLink.id === link.id);
                case 'whatsapp':
                    return activeWhatsAppLinks.some(whatsAppLink => whatsAppLink.id === link.id);
                default:
                    return false;
            }
        });

        if (filteredLinks.length === 0) return Infinity;
        return Math.min(...filteredLinks.map(link => link.orderIndex));
    };

    // Crear array de componentes con su orderIndex correspondiente
    const linkComponents = [];

    if (activeSocialLinks.length > 0) {
        linkComponents.push({
            component: <Social key="social" />,
            orderIndex: getMinOrderIndex('social'),
            type: 'social'
        });
    }

    if (activeRegularLinks.length > 0) {
        linkComponents.push({
            component: <Links key="links" />,
            orderIndex: getMinOrderIndex('regular'),
            type: 'regular'
        });
    }

    if (activeAppLinks.length > 0) {
        linkComponents.push({
            component: <AppD key="app" />,
            orderIndex: getMinOrderIndex('app'),
            type: 'app'
        });
    }

    if (activeWhatsAppLinks.length > 0) {
        linkComponents.push({
            component: <WhatsApp key="whatsapp" />,
            orderIndex: getMinOrderIndex('whatsapp'),
            type: 'whatsapp'
        });
    }

    // Ordenar componentes por orderIndex
    const sortedLinkComponents = linkComponents.sort((a, b) => a.orderIndex - b.orderIndex);

    return (
        <div className="w-full mt-60">
            <h3 className="text-lg font-bold text-gray-800 mb-5 uppercase tracking-wide text-start">My VeSite</h3>
            <div className="space-y-3">
                {/* Profile always shows first */}
                <Profile />

                {/* Render sorted link components */}
                {sortedLinkComponents.map(({ component }) => component)}

                {/* VCard always shows last */}
                <V_Card />
            </div>
        </div>
    );
};

export default MySite;