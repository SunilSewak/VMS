import { useState } from 'react';
import { ChevronLeft, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TemplateDownloadPanel } from '../components/TemplateDownloadPanel';
import { VenueImportHistoryPanel } from '../components/VenueImportHistoryPanel';
import { DataQualityDashboard } from '../components/DataQualityDashboard';
import { VenueBulkUpload } from './VenueBulkUpload';

type UploadStep = 'overview' | 'upload' | 'history' | 'quality';

interface StepInfo {
  id: UploadStep;
  label: string;
  description: string;
}

const STEPS: StepInfo[] = [
  { id: 'overview', label: 'Get Started', description: 'Download templates' },
  { id: 'upload', label: 'Upload & Import', description: 'Upload workbook and validate' },
  { id: 'history', label: 'Import History', description: 'View past imports' },
  { id: 'quality', label: 'Data Quality', description: 'Monitor venue readiness' }
];

export function VenueUploadCenter() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<UploadStep>('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/administration/masters/venues')}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
              title="Back to venues"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Venue Bulk Upload Center</h1>
              <p className="text-gray-600 mt-1">Manage venue repository onboarding at scale</p>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-between">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex flex-col items-center gap-2 flex-1 p-3 rounded-lg transition-colors ${
                    currentStep === step.id
                      ? 'bg-blue-50 border-2 border-blue-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="text-center">
                    <p className={`text-xs font-medium ${
                      currentStep === step.id ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Step */}
        {currentStep === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Getting Started</p>
                    <p className="text-2xl font-bold text-gray-900">5 Sheets</p>
                  </div>
                  <Upload className="w-12 h-12 text-blue-100" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Master Workbook</p>
                    <p className="text-2xl font-bold text-gray-900">All-in-One</p>
                  </div>
                  <CheckCircle2 className="w-12 h-12 text-green-100" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Validation</p>
                    <p className="text-2xl font-bold text-gray-900">Instant</p>
                  </div>
                  <AlertCircle className="w-12 h-12 text-yellow-100" />
                </div>
              </div>
            </div>

            {/* Template Panel */}
            <TemplateDownloadPanel
              onDownload={() => {
                setTimeout(() => setCurrentStep('upload'), 1000);
              }}
            />

            {/* Quick Guide */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Guide</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Step 1: Prepare Data</h3>
                  <ol className="space-y-2 text-sm text-gray-600">
                    <li>1. Download the master template</li>
                    <li>2. Fill in hotel and hall details</li>
                    <li>3. Add accommodation inventory</li>
                    <li>4. Configure occupancy rules</li>
                    <li>5. (Optional) Add photo references</li>
                  </ol>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Step 2: Upload & Validate</h3>
                  <ol className="space-y-2 text-sm text-gray-600">
                    <li>1. Upload the completed workbook</li>
                    <li>2. System validates all data</li>
                    <li>3. Review validation results</li>
                    <li>4. Fix any errors if needed</li>
                    <li>5. Confirm and import</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Validation Rules */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-medium text-blue-900 mb-3">Key Validation Rules</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>✓ Hotel name + City combination must be unique</li>
                <li>✓ City names must exist in the master list</li>
                <li>✓ All halls must reference an existing hotel</li>
                <li>✓ Accommodation inventory must reference an existing hotel</li>
                <li>✓ Occupancy rules must reference an existing hotel</li>
                <li>✓ Email and phone formats are validated</li>
                <li>✓ Duplicate entries will be updated, not created</li>
              </ul>
            </div>

            {/* Call to Action */}
            <button
              onClick={() => setCurrentStep('upload')}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-lg transition-colors"
            >
              Ready? Start Upload →
            </button>
          </div>
        )}

        {/* Upload Step */}
        {currentStep === 'upload' && (
          <div>
            <VenueBulkUpload />
          </div>
        )}

        {/* History Step */}
        {currentStep === 'history' && (
          <VenueImportHistoryPanel limit={20} />
        )}

        {/* Quality Dashboard Step */}
        {currentStep === 'quality' && (
          <DataQualityDashboard />
        )}
      </div>
    </div>
  );
}
