/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
const needMerge = (item: any) => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

/**
 * Deep merge two objects.
 * target must be a object, and array will be replaced
 * @param target
 * @param ...sources
 */
export const deepMerge = (target: any, ...sources: any[]): any => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (needMerge(target) && needMerge(source)) {
    for (const key in source) {
      if (needMerge(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
};

// Clone data object only, also defined in core.ts
export const cloneJson = (json: any) => {
  return JSON.parse(JSON.stringify(json));
};
