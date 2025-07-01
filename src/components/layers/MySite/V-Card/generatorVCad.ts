// utils/vCardGenerator.ts
import type { VCardData } from '../../../../types/V-Card.ts';

export const generateVCardString = (data: VCardData): string => {
    const vCardLines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        // Nombre completo
        `FN:${data.name || ''}`,
        // Nombre estructurado (apellido;nombre;segundo nombre;prefijo;sufijo)
        `N:${data.name ? data.name.split(' ').reverse().join(';') : ''}`,
        // Organización (empresa)
        ...(data.company ? [`ORG:${data.company}`] : []),
        // Título/Posición
        ...(data.title ? [`TITLE:${data.title}`] : []),
        // Email
        ...(data.email ? [`EMAIL;TYPE=INTERNET:${data.email}`] : []),
        // Teléfono (es importante especificar el tipo)
        ...(data.phone ? [`TEL;TYPE=CELL:${data.phone}`] : []),
        // Sitio web
        ...(data.website ? [`URL:${data.website}`] : []),
        'END:VCARD'
    ];

    return vCardLines.join('\n');
};

// Función para validar que los datos estén completos
export const validateVCardData = (data: VCardData): { isValid: boolean; missingFields: string[] } => {
    const requiredFields = ['name', 'phone']; // Campos mínimos requeridos
    const missingFields: string[] = [];

    requiredFields.forEach(field => {
        if (!data[field as keyof VCardData] || data[field as keyof VCardData].trim() === '') {
            missingFields.push(field);
        }
    });

    return {
        isValid: missingFields.length === 0,
        missingFields
    };
};

// Función para formatear el número de teléfono (opcional, para estandarizar)
export const formatPhoneNumber = (phone: string): string => {
    // Remover caracteres no numéricos excepto + al inicio
    const cleaned = phone.replace(/[^\d+]/g, '');

    // Si no tiene código de país, asumir que es de Ecuador (+593)
    if (!cleaned.startsWith('+')) {
        if (cleaned.startsWith('09')) {
            // Número móvil ecuatoriano
            return `+593${cleaned.substring(1)}`;
        } else if (cleaned.length === 9) {
            // Asumir que es móvil sin el 0
            return `+593${cleaned}`;
        }
        // Para otros casos, agregar código de país por defecto
        return `+593${cleaned}`;
    }

    return cleaned;
};