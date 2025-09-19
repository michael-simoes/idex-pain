/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { fetchTeamId, fetchTeamDetails, LinearTeamDetails } from "../../../lib/linear";

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

  return (
    <main style={{ padding: "2rem" }}>
      <h1>{client?.name ?? "Client"}</h1>
      <p>Welcome to your custom page.</p>
      {/* Display error if fetching failed */}
      {teamDetails && "error" in (teamDetails as any) && (
        <p style={{ color: "red", marginTop: 20 }}>{(teamDetails as any).error}</p>
      )}

      {/* Display list of issues grouped by state */}
      {teamDetails && !("error" in (teamDetails as any)) && (() => {
        const issues: any[] = (teamDetails as any).issues.nodes;

        // Group issues by state name
        const issuesByState: Record<string, any[]> = issues.reduce(
          (acc: Record<string, any[]>, issue: any) => {
            const stateName = issue.state?.name ?? "Unknown";
            if (!acc[stateName]) acc[stateName] = [];
            acc[stateName].push(issue);
            return acc;
          },
          {}
        );

        // Define priority order for states
        const PRIORITY_ORDER = [
          "readyforqa", // Ready for QA
          "inprogress", // In Progress / In progress
          "todo",       // Todo / To-do / To do
          "backlog",
          "done",
        ];

        const normalize = (str: string) => str.toLowerCase().replace(/[^a-z]/g, "");

        // Sort state entries according to priority array; unknown states go to bottom
        const stateEntries = Object.entries(issuesByState).sort(([a], [b]) => {
          const ia = PRIORITY_ORDER.indexOf(normalize(a));
          const ib = PRIORITY_ORDER.indexOf(normalize(b));
          const va = ia === -1 ? PRIORITY_ORDER.length : ia;
          const vb = ib === -1 ? PRIORITY_ORDER.length : ib;
          return va - vb;
        });

        return (
          <>
            {stateEntries.map(([stateName, stateIssues], idx) => (
              <section key={stateName} style={{ marginTop: idx === 0 ? 20 : 40 }}>
                <h2 style={{ margin: "0 0 8px" }}>{stateName}</h2>

                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontFamily: "sans-serif",
                    tableLayout: "fixed",
                  }}
                >
                  <colgroup>
                    <col style={{ width: "55%" }} />
                    <col style={{ width: "25%" }} />
                    <col style={{ width: "20%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "4px 8px" }}>Title</th>
                      <th style={{ textAlign: "left", padding: "4px 8px" }}>Assignee</th>
                      <th style={{ textAlign: "left", padding: "4px 8px" }}>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stateIssues
                      .slice()
                      .sort(
                        (a: any, b: any) =>
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime()
                      )
                      .map((issue: any) => (
                        <tr key={issue.id} style={{ borderTop: "1px solid #eee" }}>
                          <td style={{ padding: "4px 8px" }}>{issue.title}</td>
                          <td style={{ padding: "4px 8px" }}>{issue.assignee?.name ?? "—"}</td>
                          <td style={{ padding: "4px 8px" }}>
                            {new Date(issue.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                {idx < stateEntries.length - 1 && (
                  <hr style={{ margin: "24px 0" }} />
                )}
              </section>
            ))}
          </>
        );
      })()}
    </main>
  );
}
