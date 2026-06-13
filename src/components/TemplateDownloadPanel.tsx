import { Download, FileSpreadsheet, Info } from 'lucide-react';
import { generateMasterTemplate, downloadTemplate, TEMPLATE_INFO } from '../features/venues/templateService';

interface TemplateDownloadPanelProps {
  onDownload?: () => void;
}

export function TemplateDownloadPanel({ onDownload }: TemplateDownloadPanelProps) {
  const handleDownloadMaster = () => {
    const blob = generateMasterTemplate();
    downloadTemplate('Venue_Master_Workbook', blob);
    onDownload?.();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Step 1: Download Template</h2>
        <p className="text-gray-600">
          Download the Excel template and fill in your venue data. The template includes all required sheets and helpful instructions.
        </p>
      </div>

      {/* Template Info */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-2">Master Workbook Includes:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              {TEMPLATE_INFO.master.sheets.map((sheet, idx) => (
                <li key={idx}>
                  <strong>{sheet.name}</strong> - {sheet.description}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownloadMaster}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
      >
        <Download className="w-5 h-5" />
        Download Master Workbook
      </button>

      {/* Template Details */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {TEMPLATE_INFO.master.sheets.map((sheet, idx) => (
          <div key={idx} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-start gap-3">
              <FileSpreadsheet className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900 mb-1">{sheet.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{sheet.description}</p>
                <p className="text-xs text-gray-500 bg-white px-2 py-1 rounded inline-block">
                  {sheet.rows}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Guidelines */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-medium text-gray-900 mb-3">Template Guidelines</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span><strong>Hotel Master:</strong> One row per hotel with basic details</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span><strong>Hall Master:</strong> One row per hall in each hotel</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span><strong>Accommodation:</strong> One row per hotel with room inventory</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span><strong>Occupancy Rules:</strong> Designation-to-occupancy mappings</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span><strong>Photos:</strong> Photo references (optional)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>All required fields must be filled (marked with *)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>Hotel names + City combinations must be unique</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>City names must match master city list</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
