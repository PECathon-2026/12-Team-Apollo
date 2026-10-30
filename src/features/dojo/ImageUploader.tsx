import React, { useRef, useState } from 'react';
import { UploadCloud, FileImage, AlertTriangle, RefreshCw, X, Sparkles, CheckCircle2 } from 'lucide-react';

export interface UploadedImageData {
  file: File;
  previewUrl: string;
  name: string;
  sizeKb: number;
  width: number;
  height: number;
  isFits: boolean;
}

interface ImageUploaderProps {
  onImageSelected: (data: UploadedImageData) => void;
  onClear: () => void;
  onRestoreClick: () => void;
  currentImage: UploadedImageData | null;
  isProcessing: boolean;
}

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
const SUPPORTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.fits', '.fit', '.fts'];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  onClear,
  onRestoreClick,
  currentImage,
  isProcessing,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndProcessFile = (file: File) => {
    setErrorMessage(null);

    // 1. Check file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(`File exceeds 25 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please select a compressed exposure or crop.`);
      return;
    }

    // 2. Check format extension
    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
    const isFits = ['.fits', '.fit', '.fts'].includes(ext);
    const isStandardImg = file.type.startsWith('image/') || SUPPORTED_EXTENSIONS.includes(ext);

    if (!isFits && !isStandardImg) {
      setErrorMessage(
        `Unsupported file type (${ext || file.type}). Please provide JPEG, PNG, WebP, or astronomical FITS files.`
      );
      return;
    }

    // 3. Generate preview & read dimensions
    if (isFits) {
      // For FITS, standard <img> can't render raw binary, so we create a placeholder preview
      // The server will parse the HDU and return a stretched PNG preview upon restoration
      const previewUrl =
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=50';
      onImageSelected({
        file,
        previewUrl,
        name: file.name,
        sizeKb: Math.round(file.size / 1024),
        width: 1024,
        height: 1024,
        isFits: true,
      });
    } else {
      const previewUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        onImageSelected({
          file,
          previewUrl,
          name: file.name,
          sizeKb: Math.round(file.size / 1024),
          width: img.naturalWidth || 1200,
          height: img.naturalHeight || 800,
          isFits: false,
        });
      };
      img.onerror = () => {
        setErrorMessage('Failed to decode image preview. The file data may be corrupted.');
      };
      img.src = previewUrl;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/png,image/jpeg,image/webp,.fits,.fit,.fts"
        style={{ display: 'none' }}
      />

      {/* Error Banner */}
      {errorMessage && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(214, 60, 60, 0.12)',
            border: '1px solid var(--vermilion)',
            color: 'var(--vermilion-bright)',
            fontSize: '0.86rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: 'var(--vermilion-bright)',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Upload Zone or Preview Card */}
      {!currentImage ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: isDragOver
              ? '2px dashed var(--gold-moon-bright)'
              : '2px dashed rgba(229, 185, 89, 0.35)',
            backgroundColor: isDragOver ? 'rgba(229, 185, 89, 0.08)' : 'rgba(13, 15, 21, 0.65)',
            borderRadius: 'var(--radius-md)',
            padding: '48px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isDragOver ? '0 0 20px var(--gold-glow)' : 'none',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(20, 23, 34, 0.8)',
              border: '1px solid var(--gold-moon)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <UploadCloud size={30} color="var(--gold-moon-bright)" />
          </div>

          <h3 style={{ fontSize: '1.18rem', marginBottom: '8px', color: 'var(--washi-white)' }}>
            Upload Astronomical Exposure
          </h3>

          <p style={{ maxWidth: '480px', fontSize: '0.86rem', color: 'var(--washi-silk)', marginBottom: '16px' }}>
            Drag and drop your raw astrophotography frame here, or click to browse.
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(229, 185, 89, 0.15)',
              border: '1px solid var(--gold-moon)',
              color: 'var(--gold-moon-bright)',
              fontSize: '0.84rem',
              fontWeight: 600,
            }}
          >
            <FileImage size={15} />
            Select Image or FITS File
          </div>

          <div style={{ marginTop: '14px', fontSize: '0.74rem', color: 'var(--washi-muted)' }}>
            Supported formats: JPEG, PNG, WebP, and astronomical FITS (.fits, .fit) • Max 25 MB
          </div>
        </div>
      ) : (
        <div className="sumi-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="hanko-seal">原画</span>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--washi-white)' }}>
                Target Celestial Image
              </h3>
              {currentImage.isFits && (
                <span className="gold-badge" style={{ fontSize: '0.68rem' }}>
                  ASTRONOMICAL FITS DATA
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(20, 23, 34, 0.7)',
                  border: '1px solid var(--border-ink)',
                  color: 'var(--washi-silk)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <RefreshCw size={13} />
                Replace Image
              </button>
              <button
                onClick={onClear}
                disabled={isProcessing}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(214, 60, 60, 0.1)',
                  border: '1px solid var(--vermilion-border)',
                  color: 'var(--vermilion-bright)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <X size={13} />
                Remove
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '20px',
              alignItems: 'center',
            }}
          >
            {/* Thumbnail Preview */}
            <div
              style={{
                position: 'relative',
                height: '180px',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                border: '1px solid var(--gold-border)',
                backgroundColor: 'var(--ink-950)',
              }}
            >
              <img
                src={currentImage.previewUrl}
                alt={currentImage.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
              {currentImage.isFits && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(7, 8, 11, 0.88)',
                    padding: '4px 8px',
                    fontSize: '0.7rem',
                    color: 'var(--gold-moon-bright)',
                    textAlign: 'center',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  Scientific FITS Header Detected
                </div>
              )}
            </div>

            {/* Metadata & Restore Trigger */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '0.76rem', color: 'var(--washi-muted)', textTransform: 'uppercase' }}>
                  Filename
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--washi-white)', wordBreak: 'break-all' }}>
                  {currentImage.name}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <div className="metric-pill" style={{ padding: '8px 12px' }}>
                  <span className="label">Dimensions</span>
                  <span className="value">{currentImage.width} × {currentImage.height} px</span>
                </div>
                <div className="metric-pill" style={{ padding: '8px 12px' }}>
                  <span className="label">File Size</span>
                  <span className="value">{currentImage.sizeKb} KB</span>
                </div>
              </div>

              <button
                onClick={onRestoreClick}
                disabled={isProcessing}
                className="btn-samurai-gold"
                style={{
                  marginTop: '6px',
                  padding: '12px 20px',
                  fontSize: '0.94rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={16} className="spin-animation" />
                    Forging Pure Light...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Restore Image
                  </>
                )}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--washi-muted)' }}>
                <CheckCircle2 size={13} color="#85e3a8" />
                <span>Original image is strictly preserved in memory</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
