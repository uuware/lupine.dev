export const encodeHtml = (str: string): string => {
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      }[tag] || '')
  );
};

export const decodeHtml = (str: string): string => {
  return str.replace(
    /&(\D+);/gi,
    (tag) =>
      ({
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&#39;': "'",
        '&quot;': '"',
      }[tag] || '')
  );
};
