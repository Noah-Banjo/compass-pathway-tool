export function ResultsView({ results, statuses, onStatusChange, profileLabel }) {
  if (!results) return null;

  const { recommendations = [], overallCaseNote, missingInformation, responsibleAINote } = results;

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: "1.25rem" }}>
        <div>
          <h2>Pathway Recommendations</h2>
          <p className="text-muted mt-1" style={{ fontSize: "0.875rem" }}>
            For: {profileLabel} · {recommendations.length} pathways identified
          </p>
        </div>
      </div>

      {overallCaseNote && (
        <div className="case-note-banner">
          <div className="rec-section-label" style={{ marginBottom: "0.4rem" }}>Caseworker Context</div>
          <p>{overallCaseNote}</p>
        </div>
      )}

      {missingInformation?.length > 0 && (
        <div className="missing-info">
          <h4>Information gaps that may affect recommendation accuracy:</h4>
          <ul>
            {missingInformation.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {recommendations.map((rec) => (
        <RecommendationCard
          key={rec.pathwayId}
          recommendation={rec}
          status={statuses[rec.pathwayId]}
          onStatusChange={(status) => onStatusChange(rec.pathwayId, status, rec)}
        />
      ))}

      <p className="rai-note mt-4">
        {responsibleAINote}
      </p>
    </div>
  );
}

function RecommendationCard({ recommendation, status, onStatusChange }) {
  const { rank, pathway, confidenceScore, confidenceLabel, matchRationale,
    strengthsAlignment, flagsAndCautions, verifyBeforeDiscussing, traumaConsiderationNote } = recommendation;

  const confidenceClass = confidenceLabel === "High" ? "confidence-high"
    : confidenceLabel === "Moderate" ? "confidence-moderate" : "confidence-low";

  const scorePercent = Math.round(confidenceScore * 100);

  return (
    <div className={`recommendation-card rank-${rank}${status ? ` status-${status}` : ""}`}>
      <div className="rec-header">
        <span className="rec-rank">#{rank}</span>
        <div className="rec-title-group">
          <div className="rec-name">{pathway?.name || recommendation.pathwayId}</div>
          <div className="rec-category">{pathway?.category} · {pathway?.timeline}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.375rem" }}>
          <span className={`confidence-badge ${confidenceClass}`}>
            {confidenceLabel} fit · {scorePercent}%
          </span>
          {status && (
            <span className={`status-label status-label-${status}`}>
              {status === "discussed" ? "Discussed with survivor" : status === "rejected" ? "Rejected — not a fit" : "Escalated for review"}
            </span>
          )}
        </div>
      </div>

      <div className="rec-body">
        <div className="rec-section">
          <div className="rec-section-label">Why this pathway fits</div>
          <p className="rec-rationale">{matchRationale}</p>
        </div>

        {strengthsAlignment?.length > 0 && (
          <div className="rec-section">
            <div className="rec-section-label">Strengths alignment</div>
            <ul className="check-list">
              {strengthsAlignment.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}

        {flagsAndCautions?.length > 0 && (
          <div className="rec-section">
            <div className="rec-section-label">Flags & cautions</div>
            <ul className="check-list flag-list">
              {flagsAndCautions.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        )}

        {traumaConsiderationNote && (
          <div className="rec-section">
            <div className="rec-section-label">Trauma & environment note</div>
            <div className="trauma-note">{traumaConsiderationNote}</div>
          </div>
        )}

        {verifyBeforeDiscussing?.length > 0 && (
          <div className="rec-section">
            <div className="rec-section-label">Verify before discussing with survivor</div>
            <ul className="check-list verify-list">
              {verifyBeforeDiscussing.map((v, i) => <li key={i}>{v}</li>)}
            </ul>
          </div>
        )}

        {pathway?.organizationExample && (
          <div className="rec-section">
            <div className="rec-section-label">Example organizations / programs</div>
            <p style={{ fontSize: "0.875rem", color: "var(--color-warm-700)" }}>
              {pathway.organizationExample}
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--color-warm-500)", marginTop: "0.25rem" }}>
              Caseworker must verify current availability, eligibility, and terms independently.
            </p>
          </div>
        )}
      </div>

      <div className="rec-actions">
        <span className="rec-actions-label">Caseworker action:</span>
        <button
          className={`status-btn status-btn-discussed${status === "discussed" ? " active" : ""}`}
          onClick={() => onStatusChange(status === "discussed" ? null : "discussed")}
        >
          {status === "discussed" ? "✓ Discussed" : "Mark discussed"}
        </button>
        <button
          className={`status-btn status-btn-rejected${status === "rejected" ? " active" : ""}`}
          onClick={() => onStatusChange(status === "rejected" ? null : "rejected")}
        >
          {status === "rejected" ? "✗ Rejected" : "Not a fit"}
        </button>
        <button
          className={`status-btn status-btn-escalate${status === "escalate" ? " active" : ""}`}
          onClick={() => onStatusChange(status === "escalate" ? null : "escalate")}
        >
          {status === "escalate" ? "⚑ Escalated" : "Escalate for review"}
        </button>

        {status === "escalate" && (
          <div className="escalate-banner">
            ⚑ This pathway has been flagged for mandatory human review. No action should be taken with the survivor until a supervisor has reviewed and confirmed.
          </div>
        )}
      </div>
    </div>
  );
}
