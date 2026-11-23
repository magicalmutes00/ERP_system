import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function validateFileType(mimetype: string, allowedTypes: string[]) {
  if (!allowedTypes.includes(mimetype)) {
    throw new BadRequestException(
      `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
    );
  }
}

export function validateFileSize(size: number, maxSize: number = MAX_FILE_SIZE) {
  if (size > maxSize) {
    throw new BadRequestException(
      `File too large. Maximum size: ${maxSize / 1024 / 1024}MB`,
    );
  }
}

export function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = extname(originalName);
  return `${timestamp}-${random}${extension}`;
}
