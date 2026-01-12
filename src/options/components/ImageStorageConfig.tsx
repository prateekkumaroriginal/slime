import { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, AlertTriangle } from 'lucide-react';
import type { StoredImage, ImageSettings } from '@/shared/types';
import { getAllImages, deleteImage, getImageSettings, saveImageSettings, getImageStorageUsage, formatBytes } from '@/storage/rules';
import { MIN_IMAGE_STORAGE_MB, MAX_IMAGE_STORAGE_MB } from '@/shared/config';
import { Button, Card } from '@/components';

interface ImageStorageConfigProps {
  onBack: () => void;
}

export default function ImageStorageConfig({ onBack }: ImageStorageConfigProps) {
  const [images, setImages] = useState<StoredImage[]>([]);
  const [settings, setSettings] = useState<ImageSettings>({ maxStorageBytes: 10 * 1024 * 1024 });
  const [usage, setUsage] = useState<{ used: number; limit: number }>({ used: 0, limit: 10 * 1024 * 1024 });
  const [limitInputMB, setLimitInputMB] = useState('10');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [loadedImages, loadedSettings, loadedUsage] = await Promise.all([
        getAllImages(),
        getImageSettings(),
        getImageStorageUsage(),
      ]);
      setImages(loadedImages);
      setSettings(loadedSettings);
      setUsage(loadedUsage);
      setLimitInputMB(String(Math.round(loadedSettings.maxStorageBytes / (1024 * 1024))));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteImage(id: string, name: string) {
    if (confirm(`Delete image "${name}"? This cannot be undone.`)) {
      await deleteImage(id);
      await loadData();
    }
  }

  async function handleLimitChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setLimitInputMB(value);
  }

  async function handleLimitBlur() {
    let mb = parseInt(limitInputMB, 10);
    
    // Clamp to valid range
    if (isNaN(mb) || mb < MIN_IMAGE_STORAGE_MB) {
      mb = MIN_IMAGE_STORAGE_MB;
    } else if (mb > MAX_IMAGE_STORAGE_MB) {
      mb = MAX_IMAGE_STORAGE_MB;
    }
    
    setLimitInputMB(String(mb));
    
    const newSettings: ImageSettings = {
      ...settings,
      maxStorageBytes: mb * 1024 * 1024,
    };
    
    await saveImageSettings(newSettings);
    setSettings(newSettings);
    setUsage((prev) => ({ ...prev, limit: newSettings.maxStorageBytes }));
  }

  // Calculate usage percentage
  const usagePercent = usage.limit > 0 ? Math.min((usage.used / usage.limit) * 100, 100) : 0;
  const isNearLimit = usagePercent >= 80;
  const isOverLimit = usage.used > usage.limit;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h2 className="text-xl font-semibold text-zinc-200">Image Storage</h2>
      </div>

      {isLoading ? (
        <Card className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-zinc-600 border-t-emerald-500 rounded-full animate-spin" />
        </Card>
      ) : (
        <>
          {/* Storage Usage Card */}
          <Card>
            <h3 className="text-lg font-medium text-zinc-200 mb-4">Storage Usage</h3>
            
            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-400">
                  {formatBytes(usage.used)} / {formatBytes(usage.limit)} used
                </span>
                <span className={`${isOverLimit ? 'text-red-400' : isNearLimit ? 'text-amber-400' : 'text-zinc-400'}`}>
                  {usagePercent.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isOverLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
            </div>

            {/* Warning message */}
            {isNearLimit && !isOverLimit && (
              <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-sm text-amber-400">
                  Storage is almost full. Consider deleting unused images or increasing the limit.
                </span>
              </div>
            )}
            {isOverLimit && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-sm text-red-400">
                  Storage limit exceeded! Delete some images or increase the limit to upload new images.
                </span>
              </div>
            )}

            {/* Limit setting */}
            <div className="flex items-center gap-3">
              <label className="text-sm text-zinc-400">Max Storage Limit:</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={limitInputMB}
                  onChange={handleLimitChange}
                  onBlur={handleLimitBlur}
                  min={MIN_IMAGE_STORAGE_MB}
                  max={MAX_IMAGE_STORAGE_MB}
                  className="w-20 px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-sm text-zinc-400">MB</span>
              </div>
              <span className="text-xs text-zinc-500">({MIN_IMAGE_STORAGE_MB}-{MAX_IMAGE_STORAGE_MB} MB)</span>
            </div>
          </Card>

          {/* Image Library Card */}
          <Card>
            <h3 className="text-lg font-medium text-zinc-200 mb-4">
              Stored Images ({images.length})
            </h3>

            {images.length === 0 ? (
              <p className="text-center py-8 text-zinc-500">
                No images stored yet. Upload images when creating field mappings with "Image" value type.
              </p>
            ) : (
              <div className="space-y-2">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg border border-zinc-700"
                  >
                    <img
                      src={image.dataUrl}
                      alt={image.name}
                      className="w-12 h-12 object-cover rounded border border-zinc-600"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-200 truncate">{image.name}</p>
                      <p className="text-xs text-zinc-500">
                        {formatBytes(image.size)} • {new Date(image.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      size="icon-sm"
                      onClick={() => handleDeleteImage(image.id, image.name)}
                      title="Delete image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
