type SCOPES = 'SELF' | 'ORGANIZATION' | 'ACCOUNT' | 'ROOT';
declare namespace Express {
  interface Request {
    user?: {
      scope: SCOPES;
      acc_id: `${string}-${string}-${string}-${string}-${string}`;
      org_id: `${string}-${string}-${string}-${string}-${string}` | null;
      id: `${string}-${string}-${string}-${string}-${string}`;
    };
  }
}

// declare module 'socket.io' {
//   interface Socket {
//     user?: {
//       id: `${string}-${string}-${string}-${string}-${string}`;
//     };
//   }
// }

