// src/lib/amplify-client.ts
"use client";

import { Amplify } from "aws-amplify";

// Check for forced region override from environment
const forceRegion = process.env.NEXT_PUBLIC_FORCE_REGION;
const targetRegion = forceRegion || "us-west-1";

console.log(`🔧 Amplify Client - Force Region: ${forceRegion}, Target Region: ${targetRegion}`);

// AWS configuration - force us-west-1 for ABHH
const awsconfig = {
  aws_project_region: targetRegion,
  aws_appsync_graphqlEndpoint: `https://4pz36wwojfhijdsnbkzmvmmmfu.appsync-api.${targetRegion}.amazonaws.com/graphql`,
  aws_appsync_region: targetRegion,
  aws_appsync_authenticationType: "API_KEY",
  aws_appsync_apiKey: "da2-h3ps5lhgdvd37cl7vnb6btj3wi",
  aws_cognito_identity_pool_id: `${targetRegion}:dc6a1bc8-8963-43cd-9276-c584f903b28b`,
  aws_cognito_region: targetRegion,
  aws_user_pools_id: `${targetRegion}_SIcVm4uiV`,
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
  aws_user_files_s3_bucket_region: targetRegion
};

let isConfigured = false;

export function configureAmplifyClient() {
  if (typeof window === 'undefined' || isConfigured) return;
  
  try {
    Amplify.configure(awsconfig);
    isConfigured = true;
    console.log("✅ Amplify configured successfully");
  } catch (error) {
    console.error("❌ Failed to configure Amplify:", error);
  }
}

// Auto-configure on import in browser
if (typeof window !== 'undefined') {
  configureAmplifyClient();
}