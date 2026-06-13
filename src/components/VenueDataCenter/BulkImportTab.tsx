import { Upload, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface BulkImportTabProps {
  onRefresh: () => void;
}

export function BulkImportTab({ onRefresh }: BulkImportTabProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      // TODO: Implement multi-sheet import logic
      // This will handle Excel workbook with 6 sheets:
      // 1. Hotel Master
      // 2. Hall Master
      // 3. Occupancy Matrix
      // 4. Accommodation Inventory
      // 5. Photo Mapping
      // 6. Instructions
      
      onRefresh();
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bulk Import</h2>
        <p className="text-gray-600 text-sm mt-1">Upload venue data from multi-sheet workbook</p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <label className="flex flex-col items-center justify-center cursor-pointer">
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-12 h-12 text-blue-600" />
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900">
                Drop workbook here or click to upload
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Excel workbook with 6 sheets (Hotel Master, Hall Master, etc.)
              </p>
            </div>
          </div>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Requirements */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Required Workbook Structure</h3>
            <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
              <li>Sheet 1: Hotel Master (20+ fields)</li>
              <li>Sheet 2: Hall Master (12+ fields)</li>
              <li>Sheet 3: Occupancy Matrix (4 fields)</li>
              <li>Sheet 4: Accommodation Inventory (8 fields)</li>
              <li>Sheet 5: Photo Mapping (5 fields)</li>
              <li>Sheet 6: Instructions (guidelines)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
