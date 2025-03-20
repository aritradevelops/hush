import { IndexDb } from "@/lib/indexdb";
import { useEffect } from "react";

const indexDb = new IndexDb("hush_app", "hush_app");

export function useIndexDb() {
  useEffect(() => {
    // It closes the connection for the current component
    // if other components are still using it then 
    // they will open a new connection so no worries...
    // return () => indexDb.close();
  }, []);

  return indexDb;
}
