// service/notificationService.ts
import { message } from 'antd';

const notificationService = {
    success: (title: string, description?: string) => {
        message.success(description || title);
    },

    error: (title: string, description?: string) => {
        message.error(description || title);
    },

    warning: (title: string, description?: string) => {
        message.warning(description || title);
    },

    info: (title: string, description?: string) => {
        message.info(description || title);
    }
};

export default notificationService;