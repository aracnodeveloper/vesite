/** Cómo se dibujan la imagen de fondo y la de perfil en la cabecera del vesite. */
export type HeaderLayout = "classic" | "twin" | "portrait" | "polaroid" | "windows";

/** Pestaña del selector de diseño en la que aparece cada layout. */
export type HeaderCategory = "minimal" | "creative";

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
