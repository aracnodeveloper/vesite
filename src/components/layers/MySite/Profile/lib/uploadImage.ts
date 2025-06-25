// lib/uploadImage.ts
import apiService from "../../../../../service/apiService.ts";
import { uploadBiositeAvatarApi, uploadBiositeBackgroundApi } from "../../../../../constants/EndpointsRoutes";

export interface UploadResponse {
    success: boolean;
    message: string;
    data: {
        filename: string;
        originalName: string;
        size: number;
        mimetype: string;
        url: string;
    };
}

/**
 * Upload biosite avatar image
 */
export const uploadBiositeAvatar = async (file: File, biositeId: string): Promise<string> => {
    try {
        console.log("Uploading biosite avatar:", { file: file.name, biositeId });

        const formData = new FormData();
        formData.append('image', file);

        const response = await apiService.create<FormData, UploadResponse>(
            `${uploadBiositeAvatarApi}/${biositeId}`,
            formData
        );

        console.log("Avatar upload response:", response);

        if (!response.success || !response.data?.url) {
            throw new Error(response.message || 'Error uploading avatar');
        }

        return response.data.url;
    } catch (error: any) {
        console.error("Error uploading biosite avatar:", error);
        const errorMessage = error?.response?.data?.message || error?.message || 'Error uploading avatar';
        throw new Error(errorMessage);
    }
};

/**
 * Upload biosite background image
 */
export const uploadBiositeBackground = async (file: File, biositeId: string): Promise<string> => {
    try {
        console.log("Uploading biosite background:", { file: file.name, biositeId });

        const formData = new FormData();
        formData.append('image', file);

        const response = await apiService.create<FormData, UploadResponse>(
            `${uploadBiositeBackgroundApi}/${biositeId}`,
            formData
        );

        console.log("Background upload response:", response);

        if (!response.success || !response.data?.url) {
            throw new Error(response.message || 'Error uploading background');
        }

        return response.data.url;
    } catch (error: any) {
        console.error("Error uploading biosite background:", error);
        const errorMessage = error?.response?.data?.message || error?.message || 'Error uploading background';
        throw new Error(errorMessage);
    }
};

/**
 * Generic image upload (fallback)
 */
export const uploadImage = async (file: File): Promise<string> => {
    try {
        console.log("Uploading generic image:", file.name);

        const formData = new FormData();
        formData.append('image', file);

        const response = await apiService.create<FormData, UploadResponse>(
            '/upload/image',
            formData
        );

        console.log("Generic upload response:", response);

        if (!response.success || !response.data?.url) {
            throw new Error(response.message || 'Error uploading image');
        }

        return response.data.url;
    } catch (error: any) {
        console.error("Error uploading generic image:", error);
        const errorMessage = error?.response?.data?.message || error?.message || 'Error uploading image';
        throw new Error(errorMessage);
    }
};
