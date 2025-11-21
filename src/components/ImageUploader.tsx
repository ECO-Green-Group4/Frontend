import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';
import { showToast } from '../utils/toast';

interface ImageUploaderProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
  className = ""
}) => {
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tạo preview URLs khi images thay đổi
  React.useEffect(() => {
    const newPreviewUrls = images.map(file => URL.createObjectURL(file));
    setPreviewImages(newPreviewUrls);
    setSelectedImageIndex(0);
    
    // Cleanup old URLs
    return () => {
      newPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [images]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const totalFiles = images.length + newFiles.length;
    
    if (totalFiles > maxImages) {
      showToast(`Bạn chỉ có thể upload tối đa ${maxImages} ảnh!`, 'warning');
      return;
    }

    // Validate file types
    const validFiles = newFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        showToast(`File ${file.name} không phải là ảnh!`, 'error');
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      onImagesChange([...images, ...validFiles]);
    }
  }, [images, onImagesChange, maxImages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset input value để có thể chọn cùng file lần nữa
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    
    // Điều chỉnh selectedImageIndex nếu cần
    if (selectedImageIndex >= newImages.length) {
      setSelectedImageIndex(Math.max(0, newImages.length - 1));
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          isDragOver
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-2">
          <div className="p-3 bg-emerald-100 rounded-full">
            <Upload className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-700">
              {images.length === 0 ? 'Upload ảnh (Bắt buộc)' : 'Thêm ảnh khác'}
            </p>
            <p className="text-sm text-gray-500">
              Kéo thả ảnh vào đây hoặc click để chọn
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Tối đa {maxImages} ảnh • JPG, PNG, GIF • Ít nhất 1 ảnh
            </p>
          </div>
        </div>
      </div>

      {/* Image Preview */}
      {previewImages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              Preview ({previewImages.length}/{maxImages} ảnh):
            </p>
            <button
              type="button"
              onClick={openFileDialog}
              className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              Thêm ảnh
            </button>
          </div>
          
          <div className="flex gap-4">
            {/* Ảnh chính lớn bên trái */}
            <div className="flex-1">
              <div className="relative group">
                <img
                  src={previewImages[selectedImageIndex]}
                  alt={`Preview ${selectedImageIndex + 1}`}
                  className="w-full h-64 object-cover rounded-lg border border-gray-200 shadow-sm"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(selectedImageIndex);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {selectedImageIndex + 1} / {previewImages.length}
                </div>
              </div>
            </div>
            
            {/* Grid ảnh nhỏ bên phải */}
            <div className="w-32 space-y-2 max-h-64 overflow-y-auto">
              {previewImages.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Thumbnail ${index + 1}`}
                    className={`w-full h-16 object-cover rounded-lg border-2 cursor-pointer transition-all ${
                      index === selectedImageIndex 
                        ? 'border-emerald-500 ring-2 ring-emerald-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Chưa có ảnh nào được chọn</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
