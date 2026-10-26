/** Cómo se dibujan la imagen de fondo y la de perfil en la cabecera del vesite. */
export type HeaderLayout = "classic" | "twin" | "portrait" | "polaroid" | "windows";

export interface PlantillaConfig {
    layout?: string;
}

export interface Platilla {
    id: string;
    name?: string;
    description?: string;
    previewUrl?: string;
    index?: number;
    config: PlantillaConfig;
    isActive?: boolean;
}
