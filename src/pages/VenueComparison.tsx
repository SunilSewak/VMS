import { EmptyState } from '../components/EmptyState';

export function VenueComparison() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Venue Comparison</h1>
        <p className="text-sm text-gray-600 mt-1">
          Compare shortlisted venues side by side
        </p>
      </div>
      
      <EmptyState
        icon="ArrowLeftRight"
        title="Venue Comparison Coming Soon"
        description="This feature will allow you to compare multiple venues side by side to make informed decisions."
      />
    </div>
  );
}
