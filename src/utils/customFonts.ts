/**
 * Custom fonts configuration for pdfmake with OpenDyslexic and Greek support
 */

interface FontDefinition {
  [key: string]: string;
}

interface FontsConfig {
  [fontFamily: string]: FontDefinition;
}

/**
 * Fetch and convert font file to ArrayBuffer for pdfmake VFS
 */
async function fetchFontAsArrayBuffer(fontPath: string): Promise<ArrayBuffer> {
  try {
    const response = await fetch(fontPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch font: ${fontPath}`);
    }
    return await response.arrayBuffer();
  } catch (error) {
    console.warn(`Could not load font ${fontPath}:`, error);
    throw error;
  }
}

/**
 * Convert ArrayBuffer to base64 string for pdfmake VFS
 * pdfMake requires base64-encoded strings in its VFS
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;

  // Convert to binary string in chunks for better performance
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }

  // Convert binary string to base64
  return btoa(binary);
}

// Track whether custom fonts were successfully loaded
let customFontsLoaded = false;

/**
 * Initialize pdfmake with custom OpenDyslexic fonts
 * Fonts are fetched from public/fonts directory
 * Returns true if fonts loaded successfully, false otherwise
 */
export async function initializePDFMakeFonts(pdfMake: any): Promise<boolean> {
  const fonts = {
    'OpenDyslexic-Regular.ttf': '/fonts/OpenDyslexic-Regular.ttf',
    'OpenDyslexic-Bold.ttf': '/fonts/OpenDyslexic-Bold.ttf',
    'OpenDyslexic-Italic.ttf': '/fonts/OpenDyslexic-Italic.ttf',
    'OpenDyslexic-BoldItalic.ttf': '/fonts/OpenDyslexic-BoldItalic.ttf'
  };

  // Ensure VFS exists (preserve existing fonts from pdfmake/build/vfs_fonts)
  if (!pdfMake.vfs) {
    pdfMake.vfs = {};
  }

  // Track successful font loads
  let loadedFonts = 0;

  // Fetch and load all fonts
  try {
    for (const [fontName, fontPath] of Object.entries(fonts)) {
      try {
        console.log(`Loading font: ${fontName} from ${fontPath}`);
        const arrayBuffer = await fetchFontAsArrayBuffer(fontPath);
        const fontData = arrayBufferToBase64(arrayBuffer);
        pdfMake.vfs[fontName] = fontData;
        loadedFonts++;
        console.log(`Successfully loaded font: ${fontName}`);
      } catch (fontError) {
        console.warn(`Failed to load font ${fontName}:`, fontError);
      }
    }
  } catch (error) {
    console.warn('Error during font loading:', error);
  }

  // Only register custom fonts if all fonts loaded successfully
  if (loadedFonts === Object.keys(fonts).length) {
    console.log('All OpenDyslexic fonts loaded successfully');

    // Ensure default fonts are available as fallback
    if (!pdfMake.fonts) {
      pdfMake.fonts = {};
    }

    // Register OpenDyslexic fonts
    pdfMake.fonts.OpenDyslexic = {
      normal: 'OpenDyslexic-Regular.ttf',
      bold: 'OpenDyslexic-Bold.ttf',
      italics: 'OpenDyslexic-Italic.ttf',
      bolditalics: 'OpenDyslexic-BoldItalic.ttf'
    };

    // Also ensure Roboto is available (from vfs_fonts)
    if (!pdfMake.fonts.Roboto) {
      pdfMake.fonts.Roboto = {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf'
      };
    }

    customFontsLoaded = true;
    return true;
  } else {
    console.warn(`Only ${loadedFonts}/${Object.keys(fonts).length} fonts loaded. Falling back to default fonts.`);

    // Set up default Roboto fonts from pdfmake's VFS
    if (!pdfMake.fonts) {
      pdfMake.fonts = {};
    }

    pdfMake.fonts.Roboto = {
      normal: 'Roboto-Regular.ttf',
      bold: 'Roboto-Medium.ttf',
      italics: 'Roboto-Italic.ttf',
      bolditalics: 'Roboto-MediumItalic.ttf'
    };

    customFontsLoaded = false;
    return false;
  }
}

/**
 * Get the default font family to use in PDF documents
 * Returns OpenDyslexic if successfully loaded, otherwise returns Roboto
 * OpenDyslexic is dyslexia-friendly and supports Greek characters
 */
export function getDefaultFontFamily(): string {
  return customFontsLoaded ? 'OpenDyslexic' : 'Roboto';
}
