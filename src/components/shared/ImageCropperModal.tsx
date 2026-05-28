import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, ZoomIn, ZoomOut, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Point {
  x: number;
  y: number;
}

export interface Area {
  width: number;
  height: number;
  x: number;
  y: number;
}

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  aspectRatio: number;
  onCropComplete: (croppedImageBlob: Blob) => Promise<void>;
}

export function ImageCropperModal({
  isOpen,
  onClose,
  imageUrl,
  aspectRatio,
  onCropComplete,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
  ): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    // Set canvas size to match the cropped area
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Draw the cropped image onto the canvas
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    // Compress to a highly efficient WebP/JPEG blob to save mobile bandwidth
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas is empty'));
          }
        },
        'image/webp',
        0.85 // High quality, great compression
      );
    });
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    
    setIsProcessing(true);
    setErrorMsg('');
    
    try {
      const croppedBlob = await getCroppedImg(imageUrl, croppedAreaPixels);
      await onCropComplete(croppedBlob);
      onClose(); // only close on success
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to crop image');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900">Adjust Image</h3>
            <p className="text-xs font-medium text-slate-500">Pinch or zoom to fit.</p>
          </div>
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative w-full h-[40vh] sm:h-[50vh] bg-slate-900">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onCropComplete={handleCropComplete}
            onZoomChange={setZoom}
            showGrid={true}
            cropShape={aspectRatio === 1 ? 'round' : 'rect'}
          />
        </div>

        {/* Controls */}
        <div className="p-6 bg-white space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold rounded-xl text-center">
              {errorMsg}
            </div>
          )}
          
          <div className="flex items-center gap-4">
            <ZoomOut className="w-4 h-4 text-slate-400" />
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              disabled={isProcessing}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#5298D2]"
            />
            <ZoomIn className="w-4 h-4 text-slate-400" />
          </div>

          <Button 
            onClick={handleSave} 
            disabled={isProcessing}
            className="w-full h-12 rounded-xl bg-[#005da7] hover:bg-[#004b87] text-white font-bold"
          >
            {isProcessing ? (
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
            ) : (
              <><CheckCircle2 className="w-4 h-4 mr-2" /> Upload Adjusted Image</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
