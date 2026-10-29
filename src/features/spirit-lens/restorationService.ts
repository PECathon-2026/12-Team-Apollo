// src/features/spirit-lens/restorationService.ts

export const restoreAstrophoto = async (file: File) => {
  try {
    const formData = new FormData();
    // The name 'imageFile' must match the backend's upload.single('imageFile')
    formData.append('imageFile', file);
    formData.append('preset', 'samurai_clarity');

    const response = await fetch('/api/restore', {
      method: 'POST',
      // Note: We do NOT set 'Content-Type' manually here. 
      // The browser automatically sets it to 'multipart/form-data' with the correct boundaries!
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Restoration failed with status: ${response.status}`);
    }

    return await response.json();
    
  } catch (error) {
    console.error('Error in restorationService:', error);
    throw error;
  }
};