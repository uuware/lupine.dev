export const isFrontEnd = () => {
  return typeof window === 'object' && typeof document === 'object';
};
