import linearRequest from "./request";

// ----------------------------
// GraphQL query – fetch a single team ID by name
// ----------------------------
const TEAM_ID_QUERY = `
  query TeamId($teamName: String!) {
    teams(filter: { name: { eq: $teamName } }, first: 1) {
      nodes {
        id
      }
    }
  }
`;

// ----------------------------
// GraphQL query – fetch team details incl. issues
// ----------------------------
const TEAM_DETAILS_QUERY = `
  query Team($teamId: String!) {
    team(id: $teamId) {
      id
      name
      issues {
        nodes {
          id
          title
          description
           state {         
              id 
              name 
              type         
            }
          assignee {
            id
            name
          }
          createdAt
          archivedAt
        }
      }
    }
  }
`;

// ----------------------------
// Types
// ----------------------------
export interface LinearIssue {
  id: string;
  title: string;
  description: string | null;
  assignee?: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  archivedAt?: string | null;
  state: {
    name: string;
  };
}

export interface LinearTeamDetails {
  id: string;
  name: string;
  issues: {
    nodes: LinearIssue[];
  };
}


// ----------------------------
// Public API – fetchTeamId
// ----------------------------
export async function fetchTeamId(teamName: string): Promise<string> {
  type Response = {
    teams: {
      nodes: { id: string }[];
    };
  };
  const data = await linearRequest<Response>(TEAM_ID_QUERY, { teamName });
  const team = data.teams.nodes[0];
  if (!team) {
    throw new Error(`Team not found: ${teamName}`);
  }
  return team.id;
}

// ----------------------------
// Public API – fetchTeamDetails
// ----------------------------
export async function fetchTeamDetails(teamId: string): Promise<LinearTeamDetails> {
  type Response = { team: LinearTeamDetails };
  const data = await linearRequest<Response>(TEAM_DETAILS_QUERY, { teamId });
  if (!data.team) {
    throw new Error(`Team not found: ${teamId}`);
  }
  return data.team;
}
