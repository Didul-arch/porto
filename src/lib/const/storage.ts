export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

// Penanda awal format file, bukan pemeriksaan seluruh isi gambar.
// offset = posisi byte pertama dari penanda, dihitung mulai dari 0.
export const IMAGE_SIGNATURES = {
    'image/jpeg': [
        { offset: 0, bytes: [255, 216, 255] }
    ],
    'image/png': [
        { offset: 0, bytes: [137, 80, 78, 71, 13, 10, 26, 10] }
    ],
    'image/webp': [
        { offset: 0, bytes: [82, 73, 70, 70] }, // RIFF
        { offset: 8, bytes: [87, 69, 66, 80] }  // WEBP
    ]
} as const;

export const ALLOWED_IMAGE_MIME_TYPES = Object.keys(IMAGE_SIGNATURES);

export const IMAGE_HEADER_BYTES = 12;
