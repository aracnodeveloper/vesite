// Opción 1: Subir a un servicio de imágenes (recomendado)
export const uploadImageToService = async (file: File): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        // Validate input
        if (!file) {
            reject(new Error("No file provided"));
            return;
        }

        if (!(file instanceof File)) {
            reject(new Error("Invalid file object"));
            return;
        }

        // Validar tipos de archivo permitidos
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            reject(new Error("File must be a JPEG, JPG, PNG, or WebP image"));
            return;
        }

        // Validar tamaño de archivo (máximo 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            reject(new Error("File size must be less than 10MB"));
            return;
        }

        try {
            // Crear FormData para subir archivo
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'your_upload_preset'); // Para Cloudinary

            // Ejemplo con Cloudinary (gratuito hasta cierto límite)
            const response = await fetch('https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.secure_url) {
                resolve(data.secure_url);
            } else {
                reject(new Error("No URL returned from upload service"));
            }
        } catch (error) {
            reject(new Error("Error uploading file: " + (error as Error).message));
        }
    });
};

// Opción 2: Convertir a data URL optimizado (si el backend acepta data URLs)
export const uploadImageAsDataURL = async (file: File): Promise<string> => {
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

        // Validar tipos de archivo permitidos
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            reject(new Error("File must be a JPEG, JPG, PNG, or WebP image"));
            return;
        }

        // Validar tamaño de archivo (máximo 5MB para data URLs)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            reject(new Error("File size must be less than 5MB"));
            return;
        }

        // Crear canvas para optimizar imagen
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            try {
                // Calcular dimensiones optimizadas
                const maxWidth = 800;
                const maxHeight = 800;
                let { width, height } = img;

                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }

                // Configurar canvas
                canvas.width = width;
                canvas.height = height;

                // Dibujar imagen optimizada
                ctx!.drawImage(img, 0, 0, width, height);

                // Convertir a data URL
                const dataURL = canvas.toDataURL('image/jpeg', 0.8); // 80% calidad
                resolve(dataURL);
            } catch (error) {
                reject(new Error("Error processing image: " + (error as Error).message));
            }
        };

        img.onerror = () => {
            reject(new Error("Error loading image"));
        };

        // Crear FileReader para cargar imagen
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };
        reader.onerror = () => {
            reject(new Error("Error reading file"));
        };

        reader.readAsDataURL(file);
    });
};

// Opción 3: Subir a tu propio backend
export const uploadImageToBackend = async (file: File): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        // Validate input
        if (!file) {
            reject(new Error("No file provided"));
            return;
        }

        if (!(file instanceof File)) {
            reject(new Error("Invalid file object"));
            return;
        }

        // Validar tipos de archivo permitidos
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            reject(new Error("File must be a JPEG, JPG, PNG, or WebP image"));
            return;
        }

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/api/upload/image', {
                method: 'POST',
                body: formData,
                headers: {
                    // No agregar Content-Type, el browser lo hace automáticamente para FormData
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Upload failed: ${response.status} ${errorText}`);
            }

            const data = await response.json();

            if (data.url) {
                resolve(data.url);
            } else {
                reject(new Error("No URL returned from server"));
            }
        } catch (error) {
            reject(new Error("Error uploading to server: " + (error as Error).message));
        }
    });
};

// Función principal que puedes usar (elige la opción que prefieras)
export const uploadImage = uploadImageAsDataURL; // Cambia esto según tu implementación

// Función auxiliar para validar URLs de imagen
export const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url || typeof url !== 'string') return false;

    // Validar data URLs
    if (url.startsWith('data:')) {
        const dataUrlRegex = /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/]+=*$/;
        const isValid = dataUrlRegex.test(url);
        if (isValid) {
            const base64Part = url.split(',')[1];
            return base64Part && base64Part.length > 10;
        }
        return false;
    }

    // Validar URLs HTTP/HTTPS
    try {
        const urlObj = new URL(url);
        const isHttps = ['http:', 'https:'].includes(urlObj.protocol);

        // Lista de dominios bloqueados (opcional)
        const blockedDomains = [
            'visitaecuador.com',
            'suspicious-domain.com',
            'blocked-site.net'
        ];

        const isDomainBlocked = blockedDomains.some(domain =>
            urlObj.hostname.includes(domain) || urlObj.hostname === domain
        );

        if (isDomainBlocked) {
            console.warn(`Blocked domain detected: ${urlObj.hostname}`);
            return false;
        }

        return isHttps;
    } catch (error) {
        console.warn('Invalid URL:', url, error);
        return false;
    }
};