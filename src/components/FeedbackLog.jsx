// Static demonstration data showing what the feedback/override log would look like
// with real accumulated case data. In a production system this would be a database query.
const STATIC_DEMO_LOG = [
  { pathway: "WIOA Individual Training Account (ITA)", suggested: 18, discussed: 14, rejected: 2, escalated: 1, rejectionReasons: "Survivor not yet ready for formal training enrollment" },
  { pathway: "Tech & Cybersecurity Pathway", suggested: 12, discussed: 7, rejected: 4, escalated: 1, rejectionReasons: "Computer access barrier (3), survivor preference mismatch (1)" },
  { pathway: "Peer Support Specialist Certification", suggested: 9, discussed: 8, rejected: 1, escalated: 0, rejectionReasons: "Survivor not yet at readiness stage for this role" },
  { pathway: "CNA Training", suggested: 15, discussed: 10, rejected: 3, escalated: 2, rejectionReasons: "Background check concern (2), physical contact sensitivity (1)" },
  { pathway: "Trauma-Informed Employer Network", suggested: 7, discussed: 6, rejected: 0, escalated: 1, rejectionReasons: "—" },
  { pathway: "Remote Administrative & Data Entry", suggested: 11, discussed: 9, rejected: 2, escalated: 0, rejectionReasons: "No reliable internet access (2)" },
  { pathway: "Cosmetology / Esthetics License", suggested: 6, discussed: 6, rejected: 0, escalated: 0, rejectionReasons: "—" },
  { pathway: "CDL Training", suggested: 8, discussed: 5, rejected: 3, escalated: 0, rejectionReasons: "No valid license (2), FMCSA disqualifier under review (1)" },
  { pathway: "Microenterprise / Self-Employment", suggested: 5, discussed: 3, rejected: 2, escalated: 0, rejectionReasons: "Insufficient stability for entrepreneurship at current stage" },
  { pathway: "Medical Billing & Coding (Remote)", suggested: 10, discussed: 8, rejected: 1, escalated: 1, rejectionReasons: "Concentration difficulties flagged by caseworker" },
];

function acceptanceRate(row) {
  if (row.suggested === 0) return "—";
  const rate = Math.round((row.discussed / row.suggested) * 100);
  return `${rate}%`;
}

function overrideRate(row) {
  if (row.suggested === 0) return "—";
  const rate = Math.round((row.rejected / row.suggested) * 100);
  return rate;
}

export function FeedbackLog({ liveLog }) {
  const hasLiveEntries = liveLog && liveLog.length > 0;

  return (
    <div>
      <div className="card-header">
        <div>
          <h2>Caseworker Override Log</h2>
          <p className="text-muted mt-1">
            Tracks how caseworkers have acted on AI recommendations. High override rates signal where the model may need recalibration.
          </p>
        </div>
      </div>

      {hasLiveEntries && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>This Session</h3>
          <table className="feedback-table">
            <thead>
              <tr>
                <th>Pathway</th>
                <th>Profile</th>
                <th>Rank given</th>
                <th>Confidence</th>
                <th>Caseworker action</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {liveLog.map((entry, i) => (
                <tr key={i}>
                  <td>{entry.pathwayName}</td>
                  <td style={{ fontSize: "0.8125rem", color: "var(--color-warm-600)" }}>{entry.profileLabel}</td>
                  <td>#{entry.rank}</td>
                  <td>
                    <span className={`confidence-badge confidence-${entry.confidenceLabel?.toLowerCase()}`}
                      style={{ fontSize: "0.7rem" }}>
                      {entry.confidenceLabel}
                    </span>
                  </td>
                  <td>
                    <span className={`status-label status-label-${entry.status}`}>
                      {entry.status === "discussed" ? "Discussed" : entry.status === "rejected" ? "Rejected" : "Escalated"}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.8125rem", color: "var(--color-warm-500)" }}>{entry.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem" }}>
          <h3>Historical Override Rates</h3>
          <span style={{ fontSize: "0.75rem", color: "var(--color-warm-500)" }}>Simulated data · 101 total cases</span>
        </div>
        <p style={{ fontSize: "0.875rem", color: "var(--color-warm-600)", marginBottom: "1.25rem" }}>
          When caseworkers consistently override AI recommendations for a pathway, it signals a gap between the model's matching logic and real-world case complexity. These override patterns are the primary input for identifying model drift and recalibration priorities.
        </p>

        <table className="feedback-table">
          <thead>
            <tr>
              <th>Pathway</th>
              <th style={{ textAlign: "right" }}>Suggested</th>
              <th style={{ textAlign: "right" }}>Discussed</th>
              <th style={{ textAlign: "right" }}>Rejected</th>
              <th style={{ textAlign: "right" }}>Escalated</th>
              <th style={{ textAlign: "right" }}>Accept rate</th>
              <th>Common rejection reason</th>
            </tr>
          </thead>
          <tbody>
            {STATIC_DEMO_LOG.map((row, i) => {
              const override = overrideRate(row);
              const isHighOverride = typeof override === "number" && override >= 30;
              return (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{row.pathway}</td>
                  <td style={{ textAlign: "right" }}>{row.suggested}</td>
                  <td style={{ textAlign: "right", color: "var(--color-sage-700)" }}>{row.discussed}</td>
                  <td style={{ textAlign: "right", color: isHighOverride ? "var(--color-amber-600)" : "inherit", fontWeight: isHighOverride ? 600 : 400 }}>
                    {row.rejected}
                    {isHighOverride && " ⚠"}
                  </td>
                  <td style={{ textAlign: "right" }}>{row.escalated}</td>
                  <td style={{ textAlign: "right" }}>
                    <span style={{ fontWeight: 600, color: "var(--color-sage-700)" }}>{acceptanceRate(row)}</span>
                  </td>
                  <td style={{ fontSize: "0.8125rem", color: "var(--color-warm-600)" }}>{row.rejectionReasons}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ marginTop: "1.25rem", padding: "1rem", background: "var(--color-warm-200)", borderRadius: "var(--radius-md)" }}>
          <h4 style={{ marginBottom: "0.5rem" }}>How this data would drive recalibration</h4>
          <p style={{ fontSize: "0.875rem", color: "var(--color-warm-700)", lineHeight: "1.6" }}>
            High override rates (≥30%) indicate where the AI's matching logic diverges from caseworker judgment. In a production system, pathways with consistently high rejection rates would trigger a review of the system prompt constraints and the pathway dataset's accommodation criteria. Escalations that are later resolved without action suggest over-triggering conditions. This log is the primary mechanism for detecting model drift without retraining.
          </p>
        </div>
      </div>

      <p className="rai-note">
        This log does not contain real survivor data. Override tracking is the primary responsible-AI feedback loop for this system — caseworkers always have the final word, and patterns in their decisions drive system improvement.
      </p>
    </div>
  );
}
