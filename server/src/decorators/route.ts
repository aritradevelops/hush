import type Controller from "../lib/controller";

export const routeMap = new Map<string, string>();

export default function Route(route: string) {
  return function (ctr: typeof Controller<any, any>) {
    routeMap.set(ctr.name, route);
  };
}