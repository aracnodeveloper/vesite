import { notification } from 'antd';

export interface ApiError extends Error {
    response?: {
        data?: {
            message?: string | string[];
        };
    };
}

const notificationService = {
    success: (message: string, description?: string) => {
        notification.success({
            message: message,
            description: description,
            placement: 'topRight',
            duration: 3,
        });
    },

    error: (message: string, description?: string, duration?: number) => {
        notification.error({
            message: message,
            description: description,
            placement: 'topRight',
            duration: duration || 3,
        });
    },

    info: (message: string, description?: string) => {
        notification.info({
            message: message,
            description: description,
            placement: 'topRight',
            duration: 3,
        });
    },

    warning: (message: string, description?: string) => {
        notification.warning({
            message: message,
            description: description,
            placement: 'topRight',
            duration: 3,
        });
    },
};

export default notificationService;