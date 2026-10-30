import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  PlusCircle,
  Wand2,
  Telescope,
  RefreshCw,
  Home,
  } from 'lucide-react';
import { DojoLanding } from './DojoLanding';
import { ImageUploader, UploadedImageData } from './ImageUploader';
import { RestorationControls } from './RestorationControls';
import { BeforeAfterViewer } from './BeforeAfterViewer';
import { ProcessingStatus } from './ProcessingStatus';
import { RestorationMetadata } from './RestorationMetadata';
import { RestorationParameters, RestorationResult } from '../../types';

// Default reference Messier 42 noisy sample for quick demonstration
const SAMPLE_NOISY_URL =
  'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=40';

export const DojoDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'landing' | 'dojo'>('landing');
  const [selectedMode, setSelectedMode] = useState<'scientific' | 'ai' | 'demo'>('scientific');

  const [uploadedImage, setUploadedImage] = useState<UploadedImageData | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const [parameters, setParameters] = useState<RestorationParameters>({
    preset: 'samurai_clarity',
    noiseReductionLevel: 75,
    contrastBoost: 60,
    sharpness: 85,
    starDehalo: true,
    backgroundBlackLevel: 45,
    colorSaturation: 65,
  });

  const [restorationResult, setRestorationResult] = useState<RestorationResult | null>(null);

  // Preload Reference Sample Exposure
  const handleLoadSample = async () => {
    setActiveTab('dojo');
    try {
      const response = await fetch(SAMPLE_NOISY_URL);
      const blob = await response.blob();
      const file = new File([blob], 'Messier_42_Raw_Exposure.jpg', { type: 'image/jpeg' });
      setUploadedImage({
        file,
        previewUrl: SAMPLE_NOISY_URL,
        name: 'Messier_42_Raw_Exposure.jpg',
        sizeKb: Math.round(blob.size / 1024) || 380,
        width: 1200,
        height: 800,
        isFits: false,
      });
      setRestorationResult(null);
      setProcessingError(null);
    } catch {
      // Fallback if network blocked
      setUploadedImage({
        file: new File([], 'Messier_42_Raw_Exposure.jpg', { type: 'image/jpeg' }),
        previewUrl: SAMPLE_NOISY_URL,
        name: 'Messier_42_Raw_Exposure.jpg',
        sizeKb: 380,
        width: 1200,
        height: 800,
        isFits: false,
      });
    }
  };

  // Run Image Restoration
  const handleExecuteRestoration = async () => {
    if (!uploadedImage) return;

    setIsProcessing(true);
    setProcessingError(null);

    try {
      const formData = new FormData();
      if (uploadedImage.file && uploadedImage.file.size > 0) {
        formData.append('imageFile', uploadedImage.file);
      }
      formData.append('preset', parameters.preset);
      formData.append('mode', selectedMode);
      formData.append('parameters', JSON.stringify(parameters));
      formData.append('imageUrl', uploadedImage.previewUrl);

      const response = await fetch('/api/restore', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errMessage = `Server error (${response.status})`;
        try {
          const errData = await response.json();
          if (errData.error) errMessage = errData.error;
        } catch {
          // ignore json parse error
        }
        throw new Error(errMessage);
      }

      const data: RestorationResult = await response.json();
      setRestorationResult(data);
    } catch (err: any) {
      console.error('Restoration request failed:', err);
      setProcessingError(
        err.message || 'Restoration failed. Please check backend connection or switch to Scientific Engine / Demo mode.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Fallback to demo mode if requested
  const handleFallbackToDemo = async () => {
    setSelectedMode('demo');
    setIsProcessing(true);
    setProcessingError(null);

    try {
      const formData = new FormData();
      formData.append('mode', 'demo');
      formData.append('isDemo', 'true');
      formData.append('preset', parameters.preset);
      formData.append('parameters', JSON.stringify(parameters));
      if (uploadedImage) {
        formData.append('imageUrl', uploadedImage.previewUrl);
      }

      const res = await fetch('/api/restore', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setRestorationResult(data);
      }
    } catch (e: any) {
      setProcessingError(`Demo simulation failed: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset to brand-new restoration
  const handleResetWorkflow = () => {
    setUploadedImage(null);
    setRestorationResult(null);
    setProcessingError(null);
  };

  // Download Image Helper
  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Navigation Sub-Header Bar */}
      <div className="sumi-card" style={{ padding: '16px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <span className="hanko-seal">道場</span>
              <span className="gold-badge">
                <Sparkles size={12} />
                ASTRONOMICAL IMAGE RESTORATION & CLARITY CHAMBER
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', margin: 0 }}>
              Restoration Dojo <span style={{ color: 'var(--gold-moon)', fontWeight: 400 }}>| 修復道場</span>
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setActiveTab(activeTab === 'landing' ? 'dojo' : 'landing')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(20, 23, 34, 0.7)',
                border: '1px solid var(--border-ink)',
                color: 'var(--washi-silk)',
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              {activeTab === 'landing' ? (
                <>
                  <Wand2 size={15} color="var(--gold-moon)" />
                  <span>Enter Restoration Chamber</span>
                </>
              ) : (
                <>
                  <Home size={15} color="var(--gold-moon)" />
                  <span>Dojo Overview & Ethos</span>
                </>
              )}
            </button>

            {uploadedImage && activeTab === 'dojo' && (
              <button
                onClick={handleExecuteRestoration}
                disabled={isProcessing}
                className="btn-samurai-gold"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 18px',
                  fontSize: '0.86rem',
                }}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={15} className="spin-animation" />
                    Forging Light...
                  </>
                ) : (
                  <>
                    <Wand2 size={15} />
                    Execute Katana Restoration
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* VIEW 1: LANDING SCREEN */}
      {activeTab === 'landing' && (
        <DojoLanding
          onBeginRestoration={() => setActiveTab('dojo')}
          onLoadSample={handleLoadSample}
        />
      )}

      {/* VIEW 2: RESTORATION WORKSPACE */}
      {activeTab === 'dojo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Uploader Section */}
          <ImageUploader
            currentImage={uploadedImage}
            onImageSelected={(data) => {
              setUploadedImage(data);
              setRestorationResult(null);
              setProcessingError(null);
            }}
            onClear={() => {
              setUploadedImage(null);
              setRestorationResult(null);
            }}
            onRestoreClick={handleExecuteRestoration}
            isProcessing={isProcessing}
          />

          {/* Processing Status Banner */}
          <ProcessingStatus
            isProcessing={isProcessing}
            error={processingError}
            onRetry={handleExecuteRestoration}
            onFallbackToDemo={handleFallbackToDemo}
          />

          {/* Main Grid: Comparison Slider / Viewer + Controls */}
          {restorationResult && !isProcessing && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {/* Left Column (2 spans): Interactive Before/After Viewer */}
              <div style={{ gridColumn: 'span 2', minWidth: '300px' }}>
                <div className="sumi-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="hanko-seal">研磨済</span>
                      <h3 style={{ fontSize: '1.05rem', color: 'var(--washi-white)' }}>
                        Interactive Katana Comparison Chamber
                      </h3>
                    </div>

                    {/* Download & Reset Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() =>
                          downloadImage(
                            restorationResult.restoredImageUrl,
                            `Tsukuyomi_Restored_${Date.now()}.png`
                          )
                        }
                        className="btn-samurai-gold"
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.78rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                        title="Download Restored Image"
                      >
                        <Download size={13} />
                        Download Restored
                      </button>

                      <button
                        onClick={() =>
                          downloadImage(
                            restorationResult.originalImageUrl,
                            `Tsukuyomi_Raw_${Date.now()}.png`
                          )
                        }
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
                        title="Download Raw Original"
                      >
                        <Download size={13} />
                        Download Raw
                      </button>

                      <button
                        onClick={handleResetWorkflow}
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
                        title="Start New Restoration"
                      >
                        <PlusCircle size={13} />
                        New Image
                      </button>
                    </div>
                  </div>

                  {/* Interactive Viewer Component */}
                  <BeforeAfterViewer
                    originalImage={restorationResult.originalImageUrl}
                    restoredImage={restorationResult.restoredImageUrl}
                    candidateDetections={restorationResult.candidateDetections || []}
                    imageWidth={restorationResult.metadata?.restoredDimensions.width || 1200}
                    imageHeight={restorationResult.metadata?.restoredDimensions.height || 800}
                  />

                  {/* Metadata & Quality Report */}
                  <div style={{ marginTop: '20px' }}>
                    <RestorationMetadata result={restorationResult} />
                  </div>
                </div>
              </div>

              {/* Right Column: Sumi Alchemy Controls */}
              <div>
                <RestorationControls
                  parameters={parameters}
                  onChangeParameters={setParameters}
                  selectedMode={selectedMode}
                  onChangeMode={setSelectedMode}
                  disabled={isProcessing}
                />
              </div>
            </div>
          )}

          {/* When no restoration has run yet but image is uploaded */}
          {!restorationResult && !isProcessing && uploadedImage && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <div
                  className="sumi-card"
                  style={{
                    padding: '36px 24px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <Telescope size={36} color="var(--gold-moon)" />
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--washi-white)' }}>
                    Exposure Ready for Restoration
                  </h3>
                  <p style={{ maxWidth: '520px', fontSize: '0.88rem', color: 'var(--washi-silk)' }}>
                    Tune the alchemy parameters in the right panel if desired, then click &quot;Execute Katana
                    Restoration&quot; to deconvolve atmospheric seeing and hone stellar clarity.
                  </p>
                  <button
                    onClick={handleExecuteRestoration}
                    className="btn-samurai-gold"
                    style={{
                      marginTop: '8px',
                      padding: '12px 24px',
                      fontSize: '0.94rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Wand2 size={16} />
                    Execute Katana Restoration
                  </button>
                </div>
              </div>

              <div>
                <RestorationControls
                  parameters={parameters}
                  onChangeParameters={setParameters}
                  selectedMode={selectedMode}
                  onChangeMode={setSelectedMode}
                  disabled={isProcessing}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
