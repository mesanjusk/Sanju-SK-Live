const requiredClientEnv = ['VITE_API_BASE_URL', 'VITE_SITE_URL'];

export const validateEnv = () => {
  requiredClientEnv.forEach((key) => {
    if (!import.meta.env[key]) {
      console.warn(`[env] Missing ${key}. Falling back to default values.`);
    }
  });
};
