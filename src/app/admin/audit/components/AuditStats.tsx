interface Props {
  stats: {
    totalInvalidQuestions: number;
    pendingReview: number;
    autoApplied: number;
    manualReviewNeeded: number;
  } | null;
}

export function AuditStats({ stats }: Props) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm">Invalid Questions</h3>
        <p className="text-3xl font-bold">{stats.totalInvalidQuestions}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm">Pending Review</h3>
        <p className="text-3xl font-bold text-yellow-600">{stats.pendingReview}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm">Auto Applied</h3>
        <p className="text-3xl font-bold text-green-600">{stats.autoApplied}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm">Manual Review Needed</h3>
        <p className="text-3xl font-bold text-red-600">{stats.manualReviewNeeded}</p>
      </div>
    </div>
  );
}