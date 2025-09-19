"use client";
import React, { useState } from "react";

// Import the LinearIssue type so we can annotate props
import type { LinearIssue } from "../lib/linear/team";
import Modal from "./Modal";

interface IssueTableProps {
  issuesByState: Record<string, LinearIssue[]>;
}

export default function IssueTable({ issuesByState }: IssueTableProps) {
  const [selectedIssue, setSelectedIssue] = useState<LinearIssue | null>(null);

  // Priority order to control section sorting
  const PRIORITY_ORDER = [
    "readyfordeployment", // Ready for Deployment
    "readyforproduction", // Ready for Production (alias)
    "qainprogress", // QA In Progress
    "readyforqa", // Ready for QA
    "readyforcodereview", // Ready for Code Review
    "inprogress", // In Progress / In progress
    "todo", // Todo / To-do / To do
    "backlog",
    "done",
  ];
  const normalize = (str: string) => str.toLowerCase().replace(/[^a-z]/g, "");

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
                  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
                .map((issue) => (
                  <tr
                    key={issue.id}
                    style={{ cursor: "pointer", borderTop: "1px solid #eee" }}
                    onClick={() => setSelectedIssue(issue)}
                  >
                    <td style={{ padding: "4px 8px" }}>{issue.title}</td>
                    <td style={{ padding: "4px 8px" }}>{issue.assignee?.name ?? "—"}</td>
                    <td style={{ padding: "4px 8px" }}>
                      {new Date(issue.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {idx < stateEntries.length - 1 && <hr style={{ margin: "24px 0" }} />}
        </section>
      ))}

      {/* Modal */}
      <Modal isOpen={!!selectedIssue} onClose={() => setSelectedIssue(null)}>
        {selectedIssue && (
          <>
            <h3 style={{ marginTop: 0 }}>{selectedIssue.title}</h3>
            <p style={{ whiteSpace: "pre-line" }}>
              {selectedIssue.description || "No description available."}
            </p>
          </>
        )}
      </Modal>
    </>
  );
}
