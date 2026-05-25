"use client";

import React, { useState, useRef } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { X } from "lucide-react";

interface ImageCropperProps {
  imageFile: File;
  onCropComplete: (croppedFile: File) => void;
  onCancel: () => void;
}

export default function ImageCropper({ imageFile, onCropComplete, onCancel }: ImageCropperProps) {
  const [imgSrc, setImgSrc] = useState("");
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  React.useEffect(() => {
    const reader = new FileReader();
    reader.addEventListener("load", () => setImgSrc(reader.result?.toString() || ""));
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    setCrop({
      unit: '%',
      x: 10,
      y: 10,
      width: 80,
      height: 80
    });
  }

  const handleSave = async () => {
    if (!completedCrop || !imgRef.current) return;
    
    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob((blob) => {
      if (!blob) return;
      const croppedFile = new File([blob], imageFile.name, { type: 'image/jpeg' });
      onCropComplete(croppedFile);
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold">Обрізати зображення</h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-6 flex justify-center bg-gray-50">
          {imgSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imgSrc}
                onLoad={onImageLoad}
                style={{ maxHeight: '60vh', width: 'auto', display: 'block' }}
              />
            </ReactCrop>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-4 bg-white">
          <button 
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Скасувати
          </button>
          <button 
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl font-medium bg-brand text-white hover:bg-brand-light transition-colors shadow-lg shadow-brand/20"
          >
            Зберегти та додати
          </button>
        </div>
      </div>
    </div>
  );
}
