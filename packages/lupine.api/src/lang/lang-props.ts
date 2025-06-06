export type OneLangProps = {
  langName: string;
  langs: { [key: string]: string };
};

export type LangProps = { [key: string]: OneLangProps };
