// src/lib/amplify-config.ts
import { Amplify } from "aws-amplify";

let isConfigured = false;

const configureAmplify = (): boolean => {
  // Force reconfiguration every time to ensure correct environment
  try {
    // Determine deployment environment
    const appEnv = process.env.NEXT_PUBLIC_APP_ENV || 'abhh';
    console.log(`🏢 Configuring Amplify for environment: ${appEnv}`);

    let amplifyConfig;

    if (appEnv === 'abhh') {
      // FORCE ABHH configuration - complete hardcoded config for us-west-1
      amplifyConfig = {
        aws_project_region: "us-west-1",
        aws_appsync_graphqlEndpoint: "https://4pz36wwojfhijdsnbkzmvmmmfu.appsync-api.us-west-1.amazonaws.com/graphql",
        aws_appsync_region: "us-west-1",
        aws_appsync_authenticationType: "API_KEY",
        aws_appsync_apiKey: "da2-h3ps5lhgdvd37cl7vnb6btj3wi",
        aws_cognito_identity_pool_id: "us-west-1:dc6a1bc8-8963-43cd-9276-c584f903b28b",
        aws_cognito_region: "us-west-1",
        aws_user_pools_id: "us-west-1_SIcVm4uiV",
        aws_user_pools_web_client_id: "o85glfsigcbn1e91icouo8r69",
        oauth: {},
        aws_cognito_username_attributes: ["EMAIL"],
        aws_cognito_social_providers: [],
        aws_cognito_signup_attributes: ["EMAIL"],
        aws_cognito_mfa_configuration: "OFF",
        aws_cognito_mfa_types: ["SMS"],
        aws_cognito_password_protection_settings: {
          passwordPolicyMinLength: 8,
          passwordPolicyCharacters: []
        },
        aws_cognito_verification_mechanisms: ["EMAIL"],
        aws_user_files_s3_bucket: "interview-saas-storage-bucket1fa42-abbhsaas",
        aws_user_files_s3_bucket_region: "us-west-1"
      };
      console.log("🔧 ABHH Configuration - FORCING us-west-1 region");
    } else {
      // Default to ABHH configuration
      amplifyConfig = {
        aws_project_region: "us-west-1",
        aws_appsync_graphqlEndpoint: "https://4pz36wwojfhijdsnbkzmvmmmfu.appsync-api.us-west-1.amazonaws.com/graphql",
        aws_appsync_region: "us-west-1",
        aws_appsync_authenticationType: "API_KEY",
        aws_appsync_apiKey: "da2-h3ps5lhgdvd37cl7vnb6btj3wi",
        aws_cognito_identity_pool_id: "us-west-1:dc6a1bc8-8963-43cd-9276-c584f903b28b",
        aws_cognito_region: "us-west-1",
        aws_user_pools_id: "us-west-1_SIcVm4uiV",
        aws_user_pools_web_client_id: "o85glfsigcbn1e91icouo8r69",
        oauth: {},
        aws_cognito_username_attributes: ["EMAIL"],
        aws_cognito_social_providers: [],
        aws_cognito_signup_attributes: ["EMAIL"],
        aws_cognito_mfa_configuration: "OFF",
        aws_cognito_mfa_types: ["SMS"],
        aws_cognito_password_protection_settings: {
          passwordPolicyMinLength: 8,
          passwordPolicyCharacters: []
        },
        aws_cognito_verification_mechanisms: ["EMAIL"],
        aws_user_files_s3_bucket: "interview-saas-storage-bucket1fa42-abbhsaas",
        aws_user_files_s3_bucket_region: "us-west-1"
      };
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
