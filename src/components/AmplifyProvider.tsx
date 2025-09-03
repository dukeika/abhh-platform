"use client";

import { useEffect } from "react";
import { Amplify } from "aws-amplify";

export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Force us-west-1 configuration for ABHH
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

    try {
      Amplify.configure(awsconfig);
      console.log("✅ ABHH Amplify configured for us-west-1");
      console.log("🔧 Cognito Region:", awsconfig.aws_cognito_region);
      console.log("🔧 User Pool:", awsconfig.aws_user_pools_id);
    } catch (error) {
      console.error("❌ Failed to configure Amplify:", error);
    }
  }, []);

  return <>{children}</>;
}