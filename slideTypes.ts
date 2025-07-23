// TypeScript definitions for slide data structures

/** Base properties shared by all slide types */
interface BaseSlide {
    /** Slide type identifier */
    type: string;
    /** Optional section header */
    header?: string;
    /** Slide title */
    title: string;
    /** Optional footer override */
    footerText?: string;
    /** Presenter notes (HTML allowed) */
    notes?: string;
    /** ID of <input type="file"> for local file loading */
    fileInputId?: string;
    /** Allow zooming on click */
    zoomable?: boolean;
}

/** Individual item used within a list slide */
interface ListItem {
    /** Text content of the item */
    text: string;
    /** Reveal item incrementally */
    fragment?: boolean;
    /** Slide index to jump to when clicked */
    jumpTo?: number;
}

/** Title slide */
interface TitleSlide extends BaseSlide {
    type: 'title';
    author: string;
    date?: string;
}

/** Bullet or numbered list slide */
interface ListSlide extends BaseSlide {
    type: 'list';
    /** true for numbered list, false for bullet list */
    ordered?: boolean;
    /** Array of list items. Can be empty but must exist. */
    content: ListItem[];
}

/** Code sample slide */
interface CodeSlide extends BaseSlide {
    type: 'code';
    subTitle?: string;
    text?: string;
    language?: string;
    code: string;
}

/** Image slide */
interface ImageSlide extends BaseSlide {
    type: 'image';
    imageSrc?: string;
    caption?: string;
    math?: string;
    listContent?: ListItem[];
}

/** Video or local movie slide */
interface VideoSlide extends BaseSlide {
    type: 'video';
    /** YouTube video ID. If absent, local file playback is used. */
    videoId?: string;
    caption?: string;
}

/** Point cloud slide rendered via three.js */
interface PointCloudSlide extends BaseSlide {
    type: 'pointCloud';
    /** Number of random points when no file is provided */
    points?: number;
    /** Path to a text file containing point data */
    pointCloudSrc?: string;
    /** Use r,g,b values included in the file */
    useVertexColors?: boolean;
    caption?: string;
    /** Populated when loading a file */
    pointData?: {
        vertices: number[];
        colors: number[];
    };
}

/** Final slide */
interface EndSlide extends BaseSlide {
    type: 'end';
}

/** Union type of all possible slides */
export type Slide =
    | TitleSlide
    | ListSlide
    | CodeSlide
    | ImageSlide
    | VideoSlide
    | PointCloudSlide
    | EndSlide;

/** YAML root object structure */
export interface SlideDeck {
    defaultFooterText?: string;
    fontScale?: number;
    editableSlides: Slide[];
}
