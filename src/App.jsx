import { useState } from "react";
import { ProfileSelector } from "./components/ProfileSelector";
import { ResultsView } from "./components/ResultsView";
import { FeedbackLog } from "./components/FeedbackLog";

const TABS = [
  { id: "intake", label: "Case Intake" },
  { id: "results", label: "Pathway Recommendations" },
  { id: "log", label: "Override Log" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("intake");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [statuses, setStatuses] = useState({});
  const [sessionLog, setSessionLog] = useState([]);

  async function handleRunAnalysis() {
    if (!selectedProfile) return;
    setIsLoading(true);
    setError(null);
    setResults(null);
    setStatuses({});
    setActiveTab("results");

    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: selectedProfile }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || err.error || "API error");
      }

      const data = await res.json();
      setResults(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleStatusChange(pathwayId, status, rec) {
    setStatuses((prev) => ({ ...prev, [pathwayId]: status }));

    if (status) {
      const entry = {
        pathwayName: rec.pathway?.name || pathwayId,
        profileLabel: selectedProfile?.label,
        rank: rec.rank,
        confidenceLabel: rec.confidenceLabel,
        status,
        timestamp: new Date().toLocaleTimeString(),
      };
      setSessionLog((prev) => {
        const filtered = prev.filter(
          (e) => !(e.pathwayName === entry.pathwayName && e.profileLabel === entry.profileLabel)
        );
        return [entry, ...filtered];
      });
    }
  }

  const canRunAnalysis = selectedProfile && !isLoading;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-brand">
          <div className="app-header-wordmark">Compass</div>
          <div className="app-header-tagline">Economic Recovery Pathways &middot; Caseworker Decision Support</div>
        </div>
        <div className="app-header-badge">Decision Support Only</div>
      </header>

      <nav className="app-nav">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={"app-nav-tab" + (activeTab === tab.id ? " active" : "")}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.id === "results" && results && (
              <span style={{ marginLeft: "0.375rem", fontSize: "0.7rem", background: "var(--color-sage-100)", color: "var(--color-sage-700)", padding: "0.1rem 0.4rem", borderRadius: "99px", fontWeight: 700 }}>
                {results.recommendations.length}
              </span>
            )}
            {tab.id === "log" && sessionLog.length > 0 && (
              <span style={{ marginLeft: "0.375rem", fontSize: "0.7rem", background: "var(--color-amber-100)", color: "#92400e", padding: "0.1rem 0.4rem", borderRadius: "99px", fontWeight: 700 }}>
                {sessionLog.length}
              </span>
            )}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {activeTab === "intake" && (
          <div className="card">
            <ProfileSelector
              selectedId={selectedProfile?.id}
              onSelect={setSelectedProfile}
            />

            {selectedProfile && (
              <div className="card-section" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "1rem" }}>
                <p style={{ fontSize: "0.875rem", color: "var(--color-warm-600)" }}>
                  Ready to analyze {selectedProfile.label}
                </p>
                <button
                  className="btn btn-primary"
                  onClick={handleRunAnalysis}
                  disabled={!canRunAnalysis}
                >
                  {isLoading ? "Analyzing…" : "Run Pathway Analysis →"}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "results" && (
          <div>
            {isLoading && (
              <div className="loading-container">
                <div className="spinner" />
                <p>Analyzing profile and matching pathways&hellip;</p>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-warm-500)" }}>
                  Claude is reasoning through constraints, sensitivities, and program fit.
                </p>
              </div>
            )}

            {error && (
              <div className="card" style={{ borderLeft: "4px solid var(--color-red-700)" }}>
                <h3 style={{ color: "var(--color-red-700)" }}>Analysis error</h3>
                <p className="mt-2" style={{ fontSize: "0.875rem" }}>{error}</p>
                <button className="btn btn-secondary btn-sm mt-3" onClick={() => setActiveTab("intake")}>
                  Back to intake
                </button>
              </div>
            )}

            {!isLoading && !error && !results && (
              <div className="empty-state">
                <h3>No analysis run yet</h3>
                <p>Select a profile on the Case Intake tab and run pathway analysis.</p>
                <button className="btn btn-primary mt-3" onClick={() => setActiveTab("intake")}>
                  Go to Case Intake
                </button>
              </div>
            )}

            {results && !isLoading && (
              <ResultsView
                results={results}
                statuses={statuses}
                onStatusChange={handleStatusChange}
                profileLabel={selectedProfile?.label}
              />
            )}
          </div>
        )}

        {activeTab === "log" && (
          <div className="card">
            <FeedbackLog liveLog={sessionLog} />
          </div>
        )}
      </main>

      <footer className="disclaimer-bar">
        Compass is a decision-support tool for trained caseworkers. It does not make placement decisions, contact survivors, store real case data, or substitute for professional judgment.
        All profiles shown are synthetic and do not represent real individuals. Caseworker confirmation is required before any survivor-facing action.
      </footer>
    </div>
  );
}
