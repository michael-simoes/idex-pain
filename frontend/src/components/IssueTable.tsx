"use client";
import React, { useState } from "react";

// Import the LinearIssue type so we can annotate props
import type { LinearIssue } from "../lib/linear/team";
import Modal from "./Modal";
import styles from "./IssueTable.module.css";

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

  const badgeClass = (name: string) => {
    const n = normalize(name);
    if (n.includes("done")) return styles.badgeDone;
    if (n.includes("progress")) return styles.badgeInprogress;
    return styles.badgeTodo;
  };

  return (
    <>
      {stateEntries.map(([stateName, stateIssues], idx) => (
        <section key={stateName} className={styles.section}>
          <h2 className={styles.stateHeading}>{stateName}</h2>

          <div className={styles.scrollWrap}>
            <table className={styles.table}>
              <colgroup>
                <col style={{ width: "70%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "10%" }} />
              </colgroup>
              <thead className={styles.thead}>
                <tr>
                  <th className={styles.th}>Title</th>
                  <th className={styles.th}>Assignee</th>
                  <th className={styles.th}>Created At</th>
                  <th className={styles.th}>Labels</th>
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                {stateIssues
                  .slice()
                  .sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  )
                  .map((issue) => (
                    <tr
                      key={issue.id}
                      className={styles.row}
                      onClick={(e) => {
                        const tr = e.currentTarget as HTMLTableRowElement;
                        tr.classList.add(styles.flash);
                        setTimeout(() => tr.classList.remove(styles.flash), 400);
                        setSelectedIssue(issue);
                      }}
                    >
                      <td className={`${styles.td} ${styles.tdTitle}`}>
                        <span
                          className={`${styles.badge} ${badgeClass(stateName)}`}
                          data-label={stateName}
                        ></span>
                        {issue.title}
                      </td>
                      <td className={styles.td}>
                        {issue.assignee?.name ?? "—"}
                      </td>
                      <td className={styles.td}>
                        {new Date(issue.createdAt).toLocaleString("en-US", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "numeric",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true,
                        })}
                      </td>
                      <td className={styles.td} data-label="Labels">
                        {issue.labels?.nodes?.map((l) => l.name).join(", ") || "—"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {idx < stateEntries.length - 1 && <hr className={styles.divider} />}
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
