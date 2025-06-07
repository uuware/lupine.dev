export type JsonKeyValue = {
  [key: string]: string | number | boolean | null | undefined | JsonKeyValue | JsonKeyValue[];
};
export type JsonObject =
  | JsonKeyValue[]
  | {
      [key: string]: string | number | boolean | null | undefined | JsonKeyValue | JsonKeyValue[];
    };
