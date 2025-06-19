export const uploadImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        // Validate input
        if (!file) {
            reject(new Error("No file provided"));
            return;
        }

        if (!(file instanceof File)) {
            reject(new Error("Invalid file object"));
            return;
        }

        if (!file.type.startsWith('image/')) {
            reject(new Error("File must be an image"));
            return;
        }

        // Create FileReader to convert to base64
        const reader = new FileReader();

        reader.onload = () => {
            try {
                const result = reader.result as string;
                if (result) {
                    resolve(result);
                } else {
                    reject(new Error("Failed to read file"));
                }
            } catch (error) {
                reject(new Error("Error processing file: " + error.message));
            }
        };

        reader.onerror = () => {
            reject(new Error("Error reading file"));
        };

        // Convert file to base64 data URL
        reader.readAsDataURL(file);
    });
};