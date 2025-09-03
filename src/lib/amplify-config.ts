// src/lib/amplify-config.ts
import { Amplify } from "aws-amplify";
import awsExports from "../aws-exports";

let isConfigured = false;

const configureAmplify = (): boolean => {
  // Force reconfiguration every time to ensure correct environment
  try {
    // Determine deployment environment
    const appEnv = process.env.NEXT_PUBLIC_APP_ENV || 'abhh';
    console.log(`🏢 Configuring Amplify for environment: ${appEnv}`);

    let amplifyConfig;

    if (appEnv === 'abhh') {
      // FORCE ABHH configuration - override everything to ensure us-west-1
      amplifyConfig = {
        ...awsExports,
        // FORCE us-west-1 region for ABHH
        aws_project_region: "us-west-1",
        aws_cognito_region: "us-west-1",
        aws_user_pools_id: "us-west-1_SIcVm4uiV",
        aws_user_pools_web_client_id: "o85glfsigcbn1e91icouo8r69",
        aws_cognito_identity_pool_id: "us-west-1:dc6a1bc8-8963-43cd-9276-c584f903b28b",
        aws_appsync_region: "us-west-1",
        aws_appsync_graphqlEndpoint: "https://4pz36wwojfhijdsnbkzmvmmmfu.appsync-api.us-west-1.amazonaws.com/graphql",
        aws_appsync_apiKey: "da2-h3ps5lhgdvd37cl7vnb6btj3wi",
        aws_appsync_authenticationType: "API_KEY",
        aws_user_files_s3_bucket: "interview-saas-storage-bucket1fa42-abbhsaas",
        aws_user_files_s3_bucket_region: "us-west-1"
      };
      console.log("🔧 ABHH Configuration - FORCING us-west-1 region");
    } else if (appEnv === 'prorecruit') {
      // ProRecruit configuration - eu-west-2
      amplifyConfig = {
        ...awsExports,
        aws_project_region: "eu-west-2",
        aws_cognito_region: "eu-west-2",
        aws_user_pools_id: "eu-west-2_FpwJJthe4",
        aws_user_pools_web_client_id: "3juansb0jr3s3b8qouon7nr9gn",
        aws_cognito_identity_pool_id: "eu-west-2:22f32436-beb3-4729-b3bc-a2e7dbf71218",
        aws_appsync_region: "eu-west-2",
        aws_appsync_graphqlEndpoint: "https://javwcpdxwnavrj7rq7egf55ihu.appsync-api.eu-west-2.amazonaws.com/graphql",
        aws_appsync_apiKey: "da2-kf4wdhfwkrfxzeykzqez5rci4a",
        aws_appsync_authenticationType: "API_KEY",
        aws_user_files_s3_bucket: "prorecruit-storage-eu-west-2-624914081304",
        aws_user_files_s3_bucket_region: "eu-west-2"
      };
      console.log("🔧 ProRecruit Configuration - eu-west-2 region");
    } else {
      // Default to ABHH
      amplifyConfig = awsExports;
      console.log("🔧 Default Configuration");
    }

    // Override with environment variables if available
    if (process.env.NEXT_PUBLIC_AWS_USER_POOLS_ID) {
      amplifyConfig.aws_user_pools_id = process.env.NEXT_PUBLIC_AWS_USER_POOLS_ID;
    }
    if (process.env.NEXT_PUBLIC_AWS_USER_POOLS_WEB_CLIENT_ID) {
      amplifyConfig.aws_user_pools_web_client_id = process.env.NEXT_PUBLIC_AWS_USER_POOLS_WEB_CLIENT_ID;
    }
    if (process.env.NEXT_PUBLIC_AWS_COGNITO_REGION) {
      amplifyConfig.aws_cognito_region = process.env.NEXT_PUBLIC_AWS_COGNITO_REGION;
    }
    if (process.env.NEXT_PUBLIC_AWS_COGNITO_IDENTITY_POOL_ID) {
      amplifyConfig.aws_cognito_identity_pool_id = process.env.NEXT_PUBLIC_AWS_COGNITO_IDENTITY_POOL_ID;
    }
    if (process.env.NEXT_PUBLIC_AWS_PROJECT_REGION) {
      amplifyConfig.aws_project_region = process.env.NEXT_PUBLIC_AWS_PROJECT_REGION;
    }
    if (process.env.NEXT_PUBLIC_AWS_APPSYNC_GRAPHQLENDPOINT) {
      amplifyConfig.aws_appsync_graphqlEndpoint = process.env.NEXT_PUBLIC_AWS_APPSYNC_GRAPHQLENDPOINT;
    }
    if (process.env.NEXT_PUBLIC_AWS_APPSYNC_APIKEY) {
      amplifyConfig.aws_appsync_apiKey = process.env.NEXT_PUBLIC_AWS_APPSYNC_APIKEY;
    }
    if (process.env.NEXT_PUBLIC_AWS_APPSYNC_REGION) {
      amplifyConfig.aws_appsync_region = process.env.NEXT_PUBLIC_AWS_APPSYNC_REGION;
    }

    // Debug logging
    console.log("🔧 Final Amplify Configuration Debug:");
    console.log("Environment:", appEnv);
    console.log("User Pool ID:", amplifyConfig.aws_user_pools_id);
    console.log("Web Client ID:", amplifyConfig.aws_user_pools_web_client_id);
    console.log("Cognito Region:", amplifyConfig.aws_cognito_region);
    console.log("Project Region:", amplifyConfig.aws_project_region);
    console.log("Identity Pool:", amplifyConfig.aws_cognito_identity_pool_id);
    console.log("GraphQL Endpoint:", amplifyConfig.aws_appsync_graphqlEndpoint);
    console.log("AppSync Region:", amplifyConfig.aws_appsync_region);

    // Configure Amplify
    Amplify.configure(amplifyConfig);
    isConfigured = true;
    console.log(`✅ ${appEnv.toUpperCase()} Amplify configured successfully`);
    return true;
  } catch (error) {
    console.error("❌ Failed to configure Amplify:", error);
    return false;
  }
};

const isAmplifyConfigured = () => isConfigured;

// Auto-configure on import in browser (like amplify-client.ts)
if (typeof window !== 'undefined') {
  configureAmplify();
}

// Export both named and default exports
export { configureAmplify, isAmplifyConfigured };
export default configureAmplify;
