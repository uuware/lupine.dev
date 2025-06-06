export const camelToHyphens = function (name: string) {
  return name.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
};
