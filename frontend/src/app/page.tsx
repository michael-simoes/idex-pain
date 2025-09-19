"use client";

import { useState } from "react";
import { fetchTeamId, fetchTeamDetails, LinearTeamDetails } from "../lib/linear";

// Helper that chains the two existing calls
async function loadTeamDetails(teamName: string): Promise<LinearTeamDetails> {
  const id = await fetchTeamId(teamName);
  return fetchTeamDetails(id);
}

export default function Home() {
  const [teamName, setTeamName] = useState("AMA Hackathon");
  const [teamDetails, setTeamDetails] = useState<LinearTeamDetails | { error: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLoadTeamDetails = async () => {
    setLoading(true);
    try {
      const details = await loadTeamDetails(teamName);
      setTeamDetails(details);
    } catch (err) {
      console.error(err);
      setTeamDetails({ error: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 20, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20 }}>
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Enter team name"
          style={{ padding: "8px 12px", borderRadius: 4, border: "1px solid #ccc", minWidth: 200 }}
        />
        <button 
          onClick={handleLoadTeamDetails} 
          disabled={loading || !teamName.trim()} 
          style={{ padding: "8px 16px", borderRadius: 4 }}
        >
          {loading ? "Loading…" : "Fetch Team Details"}
        </button>
      </div>
      {teamDetails && (
        <pre style={{ marginTop: 20, whiteSpace: "pre-wrap" }}>{JSON.stringify(teamDetails, null, 2)}</pre>
      )}
    </main>
  );
}
