import { setPageTitle } from "../core/bind-meta";

export const PageTitle = ({ children }: { children: string }) => {
  setPageTitle(children);
  return <></>;
};
