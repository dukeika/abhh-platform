"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/services/userService";
import { UserRole, ApprovalStatus } from "@/API";

interface AuthContextType {
  user: any | null;
  userRecord: any | null;
  userRole: "super_admin" | "company_admin" | "candidate" | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, attributes?: any) => Promise<any>;
  signOut: () => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<any>;
  resendConfirmation: (email: string) => Promise<any>;
  setUserRole: (
    role: "super_admin" | "company_admin" | "candidate"
  ) => Promise<void>;
  amplifyReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any | null>(null);
  const [userRecord, setUserRecord] = useState<any | null>(null);
  const [userRole, setUserRoleState] = useState<
    "super_admin" | "company_admin" | "candidate" | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [amplifyReady, setAmplifyReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Force configure Amplify for us-west-1 (ABHH)
        const { Amplify } = await import("aws-amplify");
        
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

        Amplify.configure(awsconfig);
        console.log("✅ ABHH Amplify configured for us-west-1 in AuthContext");
        console.log("🔧 Cognito Region:", awsconfig.aws_cognito_region);
        console.log("🔧 User Pool:", awsconfig.aws_user_pools_id);
        
        setAmplifyReady(true);
        await checkUser();
      } catch (error) {
        console.error("Failed to initialize authentication:", error);
        console.warn("Falling back to mock authentication for development");
        setAmplifyReady(false);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const checkUser = async () => {
    try {
      // Try to get current user with real Amplify
      const amplifyAuth = await import("aws-amplify/auth");
      const currentUser = await amplifyAuth.getCurrentUser();
      setUser(currentUser);

      console.log("✅ Current user found:", currentUser);

      // Try to get user role from Cognito groups first, then attributes, then database, then email pattern
      let role: "super_admin" | "company_admin" | "candidate" | null = null;
      let attributes: any = {};
      
      try {
        attributes = await amplifyAuth.fetchUserAttributes();
        console.log("📋 User attributes:", attributes);
        
        // Check Cognito groups first (most reliable)
        try {
          const session = await amplifyAuth.fetchAuthSession();
          console.log("🎫 Full auth session:", session);
          console.log("🎫 Access token:", session?.tokens?.accessToken);
          console.log("🎫 Access token payload:", (session as any)?.tokens?.accessToken?.payload);
          
          const groups = (session as any)?.tokens?.accessToken?.payload?.["cognito:groups"] || [];
          console.log("🔍 User groups from JWT:", groups);
          console.log("🔍 Groups type:", typeof groups, Array.isArray(groups));
          
          if (groups.includes('SuperAdmins')) {
            console.log("✅ Found SuperAdmins group - setting role to super_admin");
            role = 'super_admin';
          } else if (groups.includes('CompanyAdmins')) {
            console.log("✅ Found CompanyAdmins group - setting role to company_admin");
            role = 'company_admin';
          } else if (groups.includes('Candidates')) {
            console.log("✅ Found Candidates group - setting role to candidate");
            role = 'candidate';
          } else {
            console.log("⚠️ No recognized groups found. Available groups:", groups);
          }
        } catch (groupError) {
          console.log("ℹ️ Could not get groups from JWT:", groupError);
          console.log("ℹ️ Continuing with other methods");
        }
        
        // If no role from groups, check custom role attribute
        if (!role) {
          const roleAttribute = attributes["custom:role"];
          if (roleAttribute) {
            role = roleAttribute as "super_admin" | "company_admin" | "candidate";
          }
        }

        // If still no role, check database record
        if (!role) {
          try {
            const { userService } = await import('@/services/userService');
            const userRecord = await userService.getUserBySub(currentUser.userId || currentUser.username);
            
            if (userRecord?.role) {
              console.log("🔍 Role from database:", userRecord.role);
              switch (userRecord.role) {
                case 'SUPER_ADMIN':
                  role = 'super_admin';
                  break;
                case 'COMPANY_ADMIN':
                  role = 'company_admin';
                  break;
                case 'CANDIDATE':
                  role = 'candidate';
                  break;
              }
            }
          } catch (dbError) {
            console.log("ℹ️ Could not get role from database, continuing with email pattern");
          }
        }

        
      } catch (attrError) {
        console.log("⚠️ Could not fetch user attributes:", attrError);
      }

      // If no role from attributes, determine from email pattern
      if (!role && currentUser?.username) {
        // Get email from attributes first (most reliable), then try to extract from username/signInDetails
        let email = attributes.email;
        
        if (!email) {
          // Check if username is an email (not UUID)
          if (currentUser.username?.includes('@')) {
            email = currentUser.username;
          } else if (currentUser.signInDetails?.loginId) {
            // Try to get from signInDetails
            email = currentUser.signInDetails.loginId;
          } else {
            // As a last resort, check if we stored the email during sign in
            email = currentUser.username; // This will be UUID if no email found
          }
        }
        
        console.log(`📧 Email for role determination: "${email}"`);
        console.log(`📧 Email includes "admin": ${email?.includes("admin")}`);
        console.log(`📧 Email includes "company": ${email?.includes("company")}`);
        
        if (email?.includes("admin") && !email?.includes("company")) {
          role = "super_admin";
          console.log(`✅ Email pattern matched: super_admin (admin found, no company)`);
        } else if (email?.includes("company")) {
          role = "company_admin";
          console.log(`✅ Email pattern matched: company_admin (company found)`);
        } else {
          role = "candidate";
          console.log(`✅ Email pattern matched: candidate (fallback)`);
        }
        console.log(`🔍 Determined role from email pattern (${email}): ${role}`);
      }

      setUserRoleState(role);
      console.log(`👤 User role set to: ${role}`);

      // Ensure user record exists in our database
      await ensureUserRecord(currentUser, role);

      // Auto-redirect based on role if on home page or login page
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        console.log(`🛣️ Current path: ${currentPath}, Role: ${role}`);
        
        if (currentPath === "/" || currentPath === "/login") {
          console.log(`🎯 Redirecting user with role ${role}`);
          await redirectByRole(role);
        }
      }
    } catch (error) {
      console.log("❌ No authenticated user found:", error);
      setUser(null);
      setUserRoleState(null);
    } finally {
      setLoading(false);
    }
  };

  const ensureUserRecord = async (cognitoUser: any, role: "super_admin" | "company_admin" | "candidate" | null) => {
    if (!cognitoUser?.userId || !role) return;

    try {
      // Check if user already exists in our database
      const existingUser = await userService.getUserBySub(cognitoUser.userId);
      
      if (!existingUser) {
        console.log("🔄 Creating user record in database...");
        
        // Get additional user details
        const amplifyAuth = await import("aws-amplify/auth");
        let attributes: any = {};
        try {
          attributes = await amplifyAuth.fetchUserAttributes();
        } catch (error) {
          console.warn("Could not fetch user attributes:", error);
        }

        // Create user record
        const newUser = await userService.createUser({
          sub: cognitoUser.userId,
          email: attributes.email || cognitoUser.username || '',
          firstName: attributes.given_name || 'User',
          lastName: attributes.family_name || 'Name',
          phone: attributes.phone_number,
          role: role === 'super_admin' ? UserRole.SUPER_ADMIN :
                role === 'company_admin' ? UserRole.COMPANY_ADMIN :
                UserRole.CANDIDATE,
          isActive: true,
          approvalStatus: ApprovalStatus.APPROVED // All users are now auto-approved
        });

        console.log("✅ User record created:", newUser);
        setUserRecord(newUser);
      } else {
        console.log("✅ User record already exists in database");
        setUserRecord(existingUser);
      }
    } catch (error) {
      console.error("❌ Error ensuring user record:", error);
      // Don't throw - authentication can continue even if user record creation fails
    }
  };

  const redirectByRole = async (
    role: "super_admin" | "company_admin" | "candidate" | null
  ) => {
    console.log(`🚀 Redirecting based on role: ${role}`);
    
    switch (role) {
      case "super_admin":
        console.log("📍 Redirecting to admin dashboard");
        router.push("/admin/dashboard");
        break;
      case "company_admin":
        // Check if this is a first-time login (needs setup)
        try {
          const userRecord = await userService.getUserBySub(user.userId);
          const isFirstLogin = !userRecord?.lastLoginAt || userRecord.lastLoginAt === null;
          
          if (isFirstLogin) {
            console.log("📍 First-time company admin login - redirecting to setup");
            router.push("/company/setup");
          } else {
            console.log("📍 Redirecting to company dashboard");
            router.push("/company/dashboard");
          }
        } catch (error) {
          console.error("Error checking first login status:", error);
          // Fallback to dashboard
          console.log("📍 Redirecting to company dashboard (fallback)");
          router.push("/company/dashboard");
        }
        break;
      case "candidate":
        console.log("📍 Redirecting to candidate dashboard");
        router.push("/candidate/dashboard");
        break;
      default:
        console.log("📍 Redirecting to login");
        router.push("/login");
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    console.log("🔐 Attempting authentication for:", email);

    if (!amplifyReady) {
      // Use mock authentication for development
      console.log("🧪 Using mock authentication - AWS credentials not available");
      
      try {
        const { mockAuthService } = await import('@/lib/mock-auth');
        const result = await mockAuthService.signIn(email, password);
        
        // Get mock user and set state
        const mockUser = await mockAuthService.getCurrentUser();
        const mockAttributes = await mockAuthService.fetchUserAttributes();
        const mockSession = await mockAuthService.fetchAuthSession();
        
        setUser(mockUser);
        
        // Determine role from mock session
        const groups = mockSession?.tokens?.accessToken?.payload?.["cognito:groups"] || [];
        let role: "super_admin" | "company_admin" | "candidate" | null = null;
        
        if (groups.includes('SuperAdmins')) {
          role = 'super_admin';
        } else if (groups.includes('CompanyAdmins')) {
          role = 'company_admin';
        } else if (groups.includes('Candidates')) {
          role = 'candidate';
        }
        
        setUserRoleState(role);
        console.log(`🧪 Mock user role set to: ${role}`);
        
        // Auto-redirect based on role
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          if (currentPath === "/" || currentPath === "/login") {
            await redirectByRole(role);
          }
        }
        
        return result;
        
      } catch (error) {
        console.error('❌ Mock sign in error:', error);
        throw error;
      }
    }

    try {
      console.log("☁️ Attempting Cognito authentication");
      const amplifyAuth = await import('aws-amplify/auth');
      
      // Check if there's already a signed-in user and sign them out first
      try {
        const currentUser = await amplifyAuth.getCurrentUser();
        if (currentUser) {
          console.log("🔄 Signing out existing user before new authentication");
          await amplifyAuth.signOut();
        }
      } catch (err) {
        // No current user or already signed out, continue
        console.log("ℹ️ No existing user session found");
      }
      
      const result = await amplifyAuth.signIn({
        username: email,
        password,
      });

      console.log("✅ Cognito sign in successful:", result);
      
      // Refresh user state after sign in
      await checkUser();
      return result;
      
    } catch (error) {
      console.error('❌ Amplify sign in error:', error);
      throw error;
    }
  };

  const handleSignUp = async (
    email: string,
    password: string,
    attributes = {}
  ) => {
    console.log("🔐 Attempting user registration for:", email);
    
    if (!amplifyReady) {
      throw new Error("Authentication service not available - check AWS configuration");
    }

    try {
      const amplifyAuth = await import("aws-amplify/auth");
      const result = await amplifyAuth.signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            "custom:role": "candidate",
            ...attributes,
          },
        },
      });
      return result;
    } catch (error) {
      console.error("Amplify sign up error:", error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    if (amplifyReady) {
      try {
        const amplifyAuth = await import("aws-amplify/auth");
        await amplifyAuth.signOut();
      } catch (error) {
        console.error("Amplify sign out error:", error);
      }
    } else {
      // Mock authentication sign out
      try {
        const { mockAuthService } = await import('@/lib/mock-auth');
        await mockAuthService.signOut();
        console.log("🧪 Mock sign out successful");
      } catch (error) {
        console.error("Mock sign out error:", error);
      }
    }

    setUser(null);
    setUserRecord(null);
    setUserRoleState(null);
    router.push("/login");
  };

  const handleConfirmSignUp = async (email: string, code: string) => {
    if (!amplifyReady) {
      throw new Error("Authentication service not available - check AWS configuration");
    }

    try {
      const amplifyAuth = await import("aws-amplify/auth");
      const result = await amplifyAuth.confirmSignUp({
        username: email,
        confirmationCode: code,
      });
      return result;
    } catch (error) {
      console.error("Amplify confirm sign up error:", error);
      throw error;
    }
  };

  const handleResendConfirmation = async (email: string) => {
    if (!amplifyReady) {
      throw new Error("Authentication service not available - check AWS configuration");
    }

    try {
      const amplifyAuth = await import("aws-amplify/auth");
      const result = await amplifyAuth.resendSignUpCode({
        username: email,
      });
      return result;
    } catch (error) {
      console.error("Amplify resend confirmation error:", error);
      throw error;
    }
  };

  const setUserRole = async (
    role: "super_admin" | "company_admin" | "candidate"
  ) => {
    if (!amplifyReady) {
      throw new Error("Authentication service not available - check AWS configuration");
    }

    try {
      const amplifyAuth = await import("aws-amplify/auth");
      await amplifyAuth.updateUserAttributes({
        userAttributes: {
          "custom:role": role,
        },
      });
      setUserRoleState(role);
    } catch (error) {
      console.error("Amplify update user attributes error:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userRecord,
    userRole,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    confirmSignUp: handleConfirmSignUp,
    resendConfirmation: handleResendConfirmation,
    setUserRole,
    amplifyReady,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
