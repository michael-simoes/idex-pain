/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { fetchTeamId, fetchTeamDetails, LinearTeamDetails } from "../../../lib/linear";
import IssueTable from "../../../components/IssueTable";

// Helper that chains the two existing calls
async function loadTeamDetails(teamName: string): Promise<LinearTeamDetails> {
  const id = await fetchTeamId(teamName);
  return fetchTeamDetails(id);
}

interface ClientData {
  name: string;
  [key: string]: unknown;
}

export default async function ClientPage({ params }: any) {
  const filePath = path.join(process.cwd(), "data", "clients", `${params.token}.json`);
  let client: ClientData | null = null;
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    client = JSON.parse(raw);
  } catch {
    notFound();
  }

  // Fetch Linear team details based on the client's name
  let teamDetails: LinearTeamDetails | { error: string } | null = null;
  if (client?.name) {
    try {
      teamDetails = await loadTeamDetails(client.name);
    } catch (err) {
      teamDetails = { error: (err as Error).message };
    }
  }

  // Prepare grouped issues if we have valid details
  let issuesByState: Record<string, any[]> | null = null;
  if (teamDetails && !("error" in (teamDetails as any))) {
    const issues: any[] = (teamDetails as any).issues.nodes;
    issuesByState = issues.reduce((acc: Record<string, any[]>, issue: any) => {
      const stateName = issue.state?.name ?? "Unknown";
      if (!acc[stateName]) acc[stateName] = [];
      acc[stateName].push(issue);
      return acc;
    }, {});
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1>{client?.name ?? "Client"}</h1>
      <p>Welcome to your custom page.</p>
      {/* Display error if fetching failed */}
      {teamDetails && "error" in (teamDetails as any) && (
        <p style={{ color: "red", marginTop: 20 }}>{(teamDetails as any).error}</p>
      )}

      {issuesByState && <IssueTable issuesByState={issuesByState} />}
    </main>
  );
}
