export type ImageItem = {
  id: string;
  src: string;
  alt: string;
  category: string;   // map con IMAGE_TYPES (ES o EN)
  styles: string[];   // estilos (ES o EN)
  tags?: string[];
  width?: number;
  height?: number;
  author?: string;
};

export const IMAGES: ImageItem[] = [
  {
    id: "1",
    src: "/images/img-01.png",
    alt: "Retrato grupal estilo paparazzi (ojo de pez)",
    category: "Eventos",
    styles: ["Cinematográfico"],
    tags: ["people", "crowd", "flash"],
  },
  {
    id: "2",
    src: "/images/img-02.png",
    alt: "Retrato elegante con fondo naranja",
    category: "Retratos",
    styles: ["Estudio", "Realista"],
    tags: ["portrait", "studio"],
  },
  {
    id: "3",
    src: "/images/img-03.png",
    alt: "Render 3D Pikachu y persona",
    category: "Arte digital",
    styles: ["Render 3D", "Cinematográfico"],
    tags: ["pikachu", "3d", "character"],
  },
  {
    id: "4",
    src: "/images/img-04.png",
    alt: "Imagen futurista rayos X samurai",
    category: "Abstracto",
    styles: ["Digital Art"],
    tags: ["xray", "samurai", "futuristic"],
  },
  {
    id: "5",
    src: "/images/img-05.png",
    alt: "Retrato vintage en estudio de dos hombres con traje (tono sepia)",
    category: "Retratos",
    styles: ["Vintage", "Polaroid", "Blanco y Negro"],
    tags: ["duo", "studio", "sepia", "traje", "formal"],
  },
];
