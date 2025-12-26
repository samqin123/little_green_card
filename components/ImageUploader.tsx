import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  disabled?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onImagesChange, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages: string[] = [];
      const files = Array.from(e.target.files) as File[];
      
      let processedCount = 0;

      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          processedCount++;
          if (processedCount === files.length) {
            onImagesChange([...images, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onImagesChange(updated);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-4">
      <div className="flex flex-wrap gap-4 items-center">
        {images.map((img, idx) => (
          <div key={idx} className="relative w-20 h-20 border border-slate-200 rounded-lg overflow-hidden group">
            <img src={img} alt="upload" className="w-full h-full object-cover" />
            <button
              onClick={() => removeImage(idx)}
              className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:text-teal-600 hover:border-teal-400 hover:bg-teal-50 transition-all"
          title="上传基因检测报告"
        >
          <Upload className="w-6 h-6 mb-1" />
          <span className="text-xs">上传报告</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {images.length > 0 && (
        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
          <ImageIcon className="w-3 h-3" /> 已上传 {images.length} 张报告图片，AI将综合分析图片内容。
        </p>
      )}
    </div>
  );
};

export default ImageUploader;