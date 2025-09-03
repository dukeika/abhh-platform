// src/lib/amplify-config.ts
import { Amplify } from "aws-amplify";

let isConfigured = false;

const configureAmplify = (): boolean => {
  // Force ABHH configuration for us-west-1
  try {
    // Use the same configuration format as AmplifyProvider
    const awsconfig = {
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

    // Environment variables are already set in Amplify deployment, use hardcoded config

    // Debug logging
    console.log("🔧 Final Amplify Configuration Debug:");
    console.log("User Pool ID:", awsconfig.aws_user_pools_id);
    console.log("Web Client ID:", awsconfig.aws_user_pools_web_client_id);
    console.log("Cognito Region:", awsconfig.aws_cognito_region);
    console.log("Project Region:", awsconfig.aws_project_region);
    console.log("Identity Pool:", awsconfig.aws_cognito_identity_pool_id);
    console.log("GraphQL Endpoint:", awsconfig.aws_appsync_graphqlEndpoint);
    console.log("AppSync Region:", awsconfig.aws_appsync_region);

    // Configure Amplify
    Amplify.configure(awsconfig);
    isConfigured = true;
    console.log("✅ ABHH Amplify configured successfully");
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
