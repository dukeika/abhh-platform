// Application Configuration Manager
// Manages different deployments (ABHH vs ProRecruit)

export interface AppConfig {
  name: string;
  brandName: string;
  environment: 'abhh' | 'prorecruit';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  aws: {
    region: string;
    cognito: {
      identityPoolId: string;
      region: string;
      userPoolId: string;
      userPoolWebClientId: string;
    };
    appsync: {
      graphqlEndpoint: string;
      region: string;
      authenticationType: string;
      apiKey: string;
    };
  };
  baseUrl: string;
}

const getConfig = (): AppConfig => {
  const env = process.env.NEXT_PUBLIC_APP_ENV || 'prorecruit';
  
  const baseConfig = {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'ProRecruit',
    brandName: process.env.NEXT_PUBLIC_BRAND_NAME || 'ProRecruit Platform',
    environment: env as 'abhh' | 'prorecruit',
    colors: {
      primary: process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#0f766e',
      secondary: process.env.NEXT_PUBLIC_SECONDARY_COLOR || '#eab308',
      accent: process.env.NEXT_PUBLIC_ACCENT_COLOR || '#dc2626',
    },
    aws: {
      region: process.env.NEXT_PUBLIC_AWS_PROJECT_REGION || 'us-east-1',
      cognito: {
        identityPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_IDENTITY_POOL_ID || '',
        region: process.env.NEXT_PUBLIC_AWS_COGNITO_REGION || 'us-east-1',
        userPoolId: process.env.NEXT_PUBLIC_AWS_USER_POOLS_ID || '',
        userPoolWebClientId: process.env.NEXT_PUBLIC_AWS_USER_POOLS_WEB_CLIENT_ID || '',
      },
      appsync: {
        graphqlEndpoint: process.env.NEXT_PUBLIC_AWS_APPSYNC_GRAPHQLENDPOINT || '',
        region: process.env.NEXT_PUBLIC_AWS_APPSYNC_REGION || 'us-east-1',
        authenticationType: process.env.NEXT_PUBLIC_AWS_APPSYNC_AUTHENTICATION_TYPE || 'API_KEY',
        apiKey: process.env.NEXT_PUBLIC_AWS_APPSYNC_APIKEY || '',
      },
    },
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  };

  return baseConfig;
};

export const appConfig = getConfig();

// Brand-specific configurations
export const brandConfig = {
  abhh: {
    logo: '/logos/abhh-logo.png',
    favicon: '/favicons/abhh.ico',
    themeClass: 'theme-abhh',
    companyName: 'ABHH Healthcare',
    tagline: 'Advanced Brain & Heart Health',
  },
  prorecruit: {
    logo: '/logos/prorecruit-logo.png',
    favicon: '/favicons/prorecruit.ico',
    themeClass: 'theme-prorecruit',
    companyName: 'ProRecruit',
    tagline: 'Professional Recruitment Solutions',
  },
};

export const currentBrand = brandConfig[appConfig.environment];

// Environment detection helpers
export const isABHH = () => appConfig.environment === 'abhh';
export const isProRecruit = () => appConfig.environment === 'prorecruit';

export default appConfig;