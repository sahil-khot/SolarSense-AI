/**
 * Helper utility to resize and compress user-uploaded images using HTML5 Canvas.
 * Keeps uploaded avatars crisp while reducing file size to ~25-45KB JPEG.
 * Prevents localStorage quota overflows and network payload issues.
 */
export const compressImage = (file, maxWidth = 320, maxHeight = 320, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided.'));
      return;
    }

    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file must be an image (PNG, JPG, JPEG, WEBP).'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read image file.'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image format.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate proportional scale down to max dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas rendering context unavailable.'));
          return;
        }

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
};
