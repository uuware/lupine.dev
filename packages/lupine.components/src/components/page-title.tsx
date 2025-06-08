import { setPageTitle } from "lupine.web";

export const PageTitle = ({ children }: { children: string }) => {
  setPageTitle(children);
  return <></>;
};
