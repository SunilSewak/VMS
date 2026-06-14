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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
          <button
            onClick={() => navigate('/administration/masters/venues')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '0.5rem', borderRadius: 'var(--radius-md)',
              color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
            }}
            title="Back to venues"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Venue Bulk Upload Center
          </h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginLeft: '3rem' }}>
          Manage venue repository onboarding at scale
        </p>
      </div>

      {/* Step Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {STEPS.map((step, idx) => (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <button
              onClick={() => setCurrentStep(step.id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                flex: 1, padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)',
                cursor: 'pointer', transition: 'background 0.2s',
                border: currentStep === step.id ? '2px solid var(--primary)' : '2px solid transparent',
                background: currentStep === step.id
                  ? 'color-mix(in srgb, var(--primary) 8%, transparent)'
                  : 'transparent',
              }}
            >
              <div style={{
                width: '2rem', height: '2rem', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 'var(--font-sm)', fontWeight: 600,
                background: currentStep === step.id ? 'var(--primary)' : 'var(--surface-2)',
                color: currentStep === step.id ? 'white' : 'var(--text-muted)',
              }}>
                {idx + 1}
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{
                  fontSize: 'var(--font-xs)', fontWeight: 600, margin: 0,
                  color: currentStep === step.id ? 'var(--primary)' : 'var(--text-muted)',
                }}>
                  {step.label}
                </p>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', margin: '2px 0 0' }}>{step.description}</p>
              </div>
            </button>
            {idx < STEPS.length - 1 && (
              <div style={{ flex: 1, height: '2px', background: 'var(--border)', margin: '0 0.5rem' }} />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div>
        {/* Overview Step */}
        {currentStep === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
              <div className="card" style={{ padding: 'var(--space-5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>Getting Started</p>
                    <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>5 Sheets</p>
                  </div>
                  <Upload size={48} style={{ color: 'color-mix(in srgb, var(--primary) 20%, transparent)' }} />
                </div>
              </div>
              <div className="card" style={{ padding: 'var(--space-5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>Master Workbook</p>
                    <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>All-in-One</p>
                  </div>
                  <CheckCircle2 size={48} style={{ color: '#10b98130' }} />
                </div>
              </div>
              <div className="card" style={{ padding: 'var(--space-5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>Validation</p>
                    <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Instant</p>
                  </div>
                  <AlertCircle size={48} style={{ color: '#f59e0b30' }} />
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
            <div className="card" style={{ padding: 'var(--space-5)' }}>
              <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--text-main)', marginBottom: 'var(--space-4)' }}>Quick Guide</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-5)' }}>
                <div>
                  <h3 style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: 'var(--space-3)', fontSize: 'var(--font-sm)' }}>Step 1: Prepare Data</h3>
                  <ol style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', paddingLeft: '1.25rem', margin: 0 }}>
                    <li>Download the master template</li>
                    <li>Fill in hotel and hall details</li>
                    <li>Add accommodation inventory</li>
                    <li>Configure occupancy rules</li>
                    <li>(Optional) Add photo references</li>
                  </ol>
                </div>
                <div>
                  <h3 style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: 'var(--space-3)', fontSize: 'var(--font-sm)' }}>Step 2: Upload & Validate</h3>
                  <ol style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', paddingLeft: '1.25rem', margin: 0 }}>
                    <li>Upload the completed workbook</li>
                    <li>System validates all data</li>
                    <li>Review validation results</li>
                    <li>Fix any errors if needed</li>
                    <li>Confirm and import</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Validation Rules */}
            <div style={{
              background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
              border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)',
              borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)',
            }}>
              <h3 style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: 'var(--space-3)', fontSize: 'var(--font-sm)' }}>Key Validation Rules</h3>
              <ul style={{ fontSize: 'var(--font-sm)', color: 'var(--primary)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', paddingLeft: '1.25rem', margin: 0 }}>
                <li>Hotel name + City combination must be unique</li>
                <li>City names must exist in the master list</li>
                <li>All halls must reference an existing hotel</li>
                <li>Accommodation inventory must reference an existing hotel</li>
                <li>Occupancy rules must reference an existing hotel</li>
                <li>Email and phone formats are validated</li>
                <li>Duplicate entries will be updated, not created</li>
              </ul>
            </div>

            {/* Call to Action */}
            <button
              onClick={() => setCurrentStep('upload')}
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem', fontSize: 'var(--font-lg)' }}
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
