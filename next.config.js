/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverRuntimeConfig: {
    // Configurations accessibles uniquement côté serveur
    PROJECT_ROOT: process.cwd(),
  },
  publicRuntimeConfig: {
    // Configurations accessibles côté client et serveur
    API_URL: process.env.NODE_ENV === 'production' 
      ? 'https://votre-domaine.com/api' 
      : 'http://localhost:3000/api',
  },
  env: {
    // Variables d'environnement accessibles côté client et serveur
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DB: process.env.MONGODB_DB,
    MONGODB_COLLECTION: process.env.MONGODB_COLLECTION,
  },
  webpack: (config, { isServer }) => {
    // Empêche l'importation des modules Node.js côté client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        util: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig 