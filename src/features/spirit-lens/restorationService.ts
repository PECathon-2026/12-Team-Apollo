// src/features/spirit-lens/restorationService.ts

export const restoreAstrophoto = async (imageUrl: string) => {
  try {
    // We are calling the POST /api/restore endpoint you showed me earlier
    const response = await fetch('/api/restore', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl: imageUrl,
        preset: 'samurai_clarity', // Using the default preset from your backend
      }),
    });

    if (!response.ok) {
      throw new Error(`Restoration failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Error in restorationService:', error);
    throw error;
  }
};