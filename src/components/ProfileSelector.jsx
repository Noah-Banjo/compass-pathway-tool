import { syntheticProfiles } from "../data/profiles";

const readinessTagClass = {
  high: "tag-ready-high",
  moderate: "tag-ready-moderate",
  "moderate-low": "tag-ready-low",
  low: "tag-ready-low",
};

const readinessLabel = {
  high: "Ready",
  moderate: "Moderate readiness",
  "moderate-low": "Early stabilization",
  low: "Early stage",
};

export function ProfileSelector({ selectedId, onSelect }) {
  return (
    <div>
      <div className="card-header">
        <div>
          <h2>Select a Case Profile</h2>
          <p className="text-muted mt-1">
            These are synthetic profiles created for demonstration purposes. No real survivor data is used.
          </p>
        </div>
      </div>

      <div className="profile-grid">
        {syntheticProfiles.map((profile) => (
          <button
            key={profile.id}
            className={`profile-card${selectedId === profile.id ? " selected" : ""}`}
            onClick={() => onSelect(profile)}
          >
            <div className="profile-card-name">{profile.label}</div>
            <div className="profile-card-meta">
              {profile.region}
              <br />
              {profile.educationLevel.replace(/-/g, " ")}
              {" · "}
              {profile.employmentGapYears}yr gap
            </div>
            <div>
              {profile.criminalRecord && (
                <span className="profile-tag tag-record">Record on file</span>
              )}
              {profile.mobilityConstraints?.length > 0 && (
                <span className="profile-tag tag-mobility">Mobility constraints</span>
              )}
              <span className={`profile-tag ${readinessTagClass[profile.readinessAssessment] || "tag-ready-moderate"}`}>
                {readinessLabel[profile.readinessAssessment] || profile.readinessAssessment}
              </span>
            </div>
          </button>
        ))}
      </div>

      {selectedId && <ProfileDetail profile={syntheticProfiles.find((p) => p.id === selectedId)} />}
    </div>
  );
}

function ProfileDetail({ profile }) {
  if (!profile) return null;

  return (
    <div className="profile-detail">
      <div className="flex justify-between items-center">
        <h3>Profile Summary — {profile.label}</h3>
        <span className="text-muted" style={{ fontSize: "0.75rem" }}>Synthetic / Demo Only</span>
      </div>

      <div className="profile-detail-grid mt-3">
        <div className="detail-field">
          <label>Education</label>
          <p>{profile.educationNote}</p>
        </div>
        <div className="detail-field">
          <label>Employment Gap</label>
          <p>{profile.employmentGapYears} years — {profile.employmentGapExplanation}</p>
        </div>
        <div className="detail-field">
          <label>Prior Work History</label>
          <p>{profile.workHistoryBefore}</p>
        </div>
        <div className="detail-field">
          <label>Criminal Record</label>
          <p style={{ color: profile.criminalRecord ? "var(--color-amber-600)" : "inherit" }}>
            {profile.criminalRecord ? profile.criminalRecordDetail : "No record"}
          </p>
        </div>
        <div className="detail-field">
          <label>Housing / Mobility</label>
          <p>
            Housing: {profile.housingStatus}
            {profile.mobilityConstraints?.length > 0 && (
              <span> · {profile.mobilityConstraints.join(", ")}</span>
            )}
          </p>
        </div>
        <div className="detail-field">
          <label>Dependents</label>
          <p>{profile.childrenOrDependents ? profile.dependentDetail : "None"}</p>
        </div>
        <div className="detail-field" style={{ gridColumn: "1 / -1" }}>
          <label>Trauma-Related Workplace Sensitivities</label>
          <div className="sensitivity-list">
            {profile.traumaWorkplaceSensitivities?.map((s) => (
              <span key={s} className="sensitivity-chip">{s.replace(/-/g, " ")}</span>
            ))}
          </div>
        </div>
        <div className="detail-field" style={{ gridColumn: "1 / -1" }}>
          <label>Stated Goals</label>
          <p>{profile.statedGoals}</p>
        </div>
        <div className="detail-field" style={{ gridColumn: "1 / -1" }}>
          <label>Caseworker Notes</label>
          <p>{profile.notes}</p>
        </div>
      </div>
    </div>
  );
}
