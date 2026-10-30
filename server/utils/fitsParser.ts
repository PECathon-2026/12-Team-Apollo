/**
 * Tsukuyomi Watch - Astronomical FITS File Parser
 * Reads FITS (Flexible Image Transport System) astronomical data files,
 * extracts scientific metadata, and performs astronomical histogram stretching (asinh)
 * to convert raw CCD/CMOS sensor data into standard image buffers.
 */

import sharp from 'sharp';

export interface FitsParseResult {
  width: number;
  height: number;
  bitpix: number;
  metadata: Record<string, string>;
  imageBuffer: Buffer;
  format: 'fits';
}

export function isFitsFile(buffer: Buffer, filename?: string): boolean {
  if (filename && /\.(fits|fit|fts)$/i.test(filename)) {
    return true;
  }
  // Check for standard FITS magic header: starts with 'SIMPLE  ='
  if (buffer.length >= 80) {
    const headerPrefix = buffer.subarray(0, 8).toString('ascii');
    return headerPrefix === 'SIMPLE  ';
  }
  return false;
}

export async function parseAndConvertFits(buffer: Buffer): Promise<FitsParseResult> {
  const metadata: Record<string, string> = {};
  let headerOffset = 0;
  let endFound = false;

  // Read 2880-byte header blocks
  while (headerOffset + 2880 <= buffer.length && !endFound) {
    const block = buffer.subarray(headerOffset, headerOffset + 2880).toString('latin1');
    for (let i = 0; i < 2880; i += 80) {
      const card = block.substring(i, i + 80);
      const eqIdx = card.indexOf('=');
      const key = (eqIdx !== -1 ? card.substring(0, eqIdx) : card.substring(0, 8)).trim();

      if (key === 'END') {
        endFound = true;
        headerOffset += 2880;
        break;
      }

      if (eqIdx !== -1) {
        const valPart = card.substring(eqIdx + 1).split('/')[0].trim();
        metadata[key] = valPart.replace(/^'|'$/g, '').trim();
      }
    }
    if (!endFound) {
      headerOffset += 2880;
    }
  }

  const bitpix = parseInt(metadata['BITPIX'] || '16', 10);
  const naxis = parseInt(metadata['NAXIS'] || '2', 10);
  const width = parseInt(metadata['NAXIS1'] || '0', 10);
  const height = parseInt(metadata['NAXIS2'] || '0', 10);
  const bscale = parseFloat(metadata['BSCALE'] || '1.0');
  const bzero = parseFloat(metadata['BZERO'] || '0.0');

  if (naxis < 2 || width <= 0 || height <= 0) {
    throw new Error(`Invalid FITS dimensions: NAXIS=${naxis}, NAXIS1=${width}, NAXIS2=${height}`);
  }

  const totalPixels = width * height;
  const rawValues = new Float32Array(totalPixels);
  let dataPointer = headerOffset;

  // Read pixel values based on BITPIX (Big-Endian per FITS standard)
  if (bitpix === 8) {
    for (let i = 0; i < totalPixels; i++) {
      if (dataPointer >= buffer.length) break;
      const v = buffer.readUInt8(dataPointer);
      dataPointer += 1;
      rawValues[i] = bzero + bscale * v;
    }
  } else if (bitpix === 16) {
    for (let i = 0; i < totalPixels; i++) {
      if (dataPointer + 2 > buffer.length) break;
      const v = buffer.readInt16BE(dataPointer);
      dataPointer += 2;
      rawValues[i] = bzero + bscale * v;
    }
  } else if (bitpix === 32) {
    for (let i = 0; i < totalPixels; i++) {
      if (dataPointer + 4 > buffer.length) break;
      const v = buffer.readInt32BE(dataPointer);
      dataPointer += 4;
      rawValues[i] = bzero + bscale * v;
    }
  } else if (bitpix === -32) {
    for (let i = 0; i < totalPixels; i++) {
      if (dataPointer + 4 > buffer.length) break;
      const v = buffer.readFloatBE(dataPointer);
      dataPointer += 4;
      rawValues[i] = bzero + bscale * v;
    }
  } else if (bitpix === -64) {
    for (let i = 0; i < totalPixels; i++) {
      if (dataPointer + 8 > buffer.length) break;
      const v = buffer.readDoubleBE(dataPointer);
      dataPointer += 8;
      rawValues[i] = bzero + bscale * v;
    }
  } else {
    throw new Error(`Unsupported FITS BITPIX format: ${bitpix}`);
  }

  // Calculate statistics for astronomical asinh histogram stretch
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < totalPixels; i++) {
    const val = rawValues[i];
    if (!isNaN(val)) {
      if (val < min) min = val;
      if (val > max) max = val;
    }
  }

  if (min >= max) {
    min = 0;
    max = 1;
  }

  // Astronomical asinh stretch to reveal faint nebulae while avoiding star core saturation
  const range = max - min;
  const stretchFactor = 0.05; // standard astronomical scale parameter
  const asinhMax = Math.asinh(1 / stretchFactor);

  const rgbBuffer = Buffer.alloc(width * height * 3);
  // FITS standard defines bottom-to-top row ordering (Y=0 at bottom), invert for web image
  for (let y = 0; y < height; y++) {
    const fitsY = height - 1 - y;
    for (let x = 0; x < width; x++) {
      const srcIndex = fitsY * width + x;
      const normalized = Math.max(0, Math.min(1, (rawValues[srcIndex] - min) / range));
      const stretched = Math.asinh(normalized / stretchFactor) / asinhMax;
      const byteVal = Math.floor(Math.max(0, Math.min(255, stretched * 255)));

      const dstIndex = (y * width + x) * 3;
      rgbBuffer[dstIndex] = byteVal;     // R
      rgbBuffer[dstIndex + 1] = byteVal; // G
      rgbBuffer[dstIndex + 2] = byteVal; // B
    }
  }

  // Convert raw RGB bytes into PNG buffer using sharp
  const pngBuffer = await sharp(rgbBuffer, {
    raw: {
      width,
      height,
      channels: 3,
    },
  })
    .png()
    .toBuffer();

  return {
    width,
    height,
    bitpix,
    metadata,
    imageBuffer: pngBuffer,
    format: 'fits',
  };
}
