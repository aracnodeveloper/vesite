// hooks/useAdminLinkManagement.ts
import { useState, useCallback } from 'react';
import apiService from '../service/apiService';
import Cookie from 'js-cookie';

export const useAdminLinkManagement = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const role = Cookie.get("roleName");
    const userId = Cookie.get("userId");
    const biositeId = Cookie.get("biositeId"); // Get the current biosite ID

    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

    const updateParentAndChildrenLink = useCallback(async (linkData: {
        icon: string;
        url: string;
        label: string;
        link_type: string;
        orderIndex?: number;
    }) => {
        if (!isAdmin || !userId) {
            throw new Error('Only admins can update parent and children links');
        }

        if (!biositeId) {
            throw new Error('BiositeId is required for admin operations');
        }

        try {
            setLoading(true);
            setError(null);

            // Create proper CreateLinkDto structure matching backend expectations
            const createLinkDto = {
                biositeId: biositeId,
                label: linkData.label,
                url: linkData.url,
                icon: linkData.icon,
                link_type: linkData.link_type,
                orderIndex: linkData.orderIndex || 0,
                isActive: true,
                isSelected: true
            };

            console.log('Sending admin link data:', {
                adminId: userId,
                linkData: createLinkDto
            });

            // Use the specific API method for admin link updates
            const response = await apiService.updateParentAndChildrenLink
                ? await apiService.updateParentAndChildrenLink(userId, createLinkDto)
                : await apiService.patch(`/biosites/admin/update-link/${userId}`, createLinkDto);

            console.log('Admin link update response:', response);
            return response;
        } catch (error: any) {
            console.error('Admin link update error:', error.response?.data || error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Error updating parent and children links';
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [isAdmin, userId, biositeId]);

    const clearError = useCallback(() => setError(null), []);

    return {
        updateParentAndChildrenLink,
        loading,
        error,
        clearError,
        isAdmin,
        userId,
        role,
        biositeId
    };
};