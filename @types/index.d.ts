
type SCOPES = 'SELF' | 'ORGANIZATION' | 'ACCOUNT' | 'ROOT';
declare namespace Express {
  interface Request {
    user?: {
      scope: SCOPES;
      acc_id: string;
      org_id: string | null;
      id: string;
    };
  }
}