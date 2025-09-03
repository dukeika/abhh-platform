// src/lib/mock-auth.ts
// Mock authentication for development when AWS credentials are not available

interface MockUser {
  userId: string;
  username: string;
  email: string;
  role: 'super_admin' | 'company_admin' | 'candidate';
  attributes: Record<string, string>;
}

const MOCK_USERS: Record<string, MockUser> = {
  'admin@abhh.com': {
    userId: 'mock-admin-uuid',
    username: 'admin@abhh.com',
    email: 'admin@abhh.com',
    role: 'super_admin',
    attributes: {
      email: 'admin@abhh.com',
      given_name: 'ABHH',
      family_name: 'Admin',
      'custom:role': 'super_admin'
    }
  },
  'company@test.com': {
    userId: 'mock-company-uuid',
    username: 'company@test.com', 
    email: 'company@test.com',
    role: 'company_admin',
    attributes: {
      email: 'company@test.com',
      given_name: 'Company',
      family_name: 'Admin',
      'custom:role': 'company_admin'
    }
  },
  'candidate@test.com': {
    userId: 'mock-candidate-uuid',
    username: 'candidate@test.com',
    email: 'candidate@test.com', 
    role: 'candidate',
    attributes: {
      email: 'candidate@test.com',
      given_name: 'Test',
      family_name: 'Candidate',
      'custom:role': 'candidate'
    }
  }
};

export class MockAuthService {
  private currentUser: MockUser | null = null;

  async signIn(email: string, password: string) {
    console.log('🧪 Mock Auth: Sign in attempt for', email);
    
    const mockUser = MOCK_USERS[email.toLowerCase()];
    if (!mockUser) {
      throw new Error('User not found');
    }
    
    // Simple password check - in development, any password works
    if (!password) {
      throw new Error('Password required');
    }
    
    this.currentUser = mockUser;
    console.log('🧪 Mock Auth: Sign in successful for', mockUser.role);
    
    return {
      isSignedIn: true,
      nextStep: {
        signInStep: 'DONE'
      }
    };
  }

  async signUp(email: string, password: string, attributes: Record<string, string> = {}) {
    console.log('🧪 Mock Auth: Sign up attempt for', email);
    
    // In mock mode, create a new candidate user
    const mockUser: MockUser = {
      userId: `mock-${Date.now()}`,
      username: email,
      email,
      role: 'candidate',
      attributes: {
        email,
        given_name: attributes.given_name || 'New',
        family_name: attributes.family_name || 'User',
        'custom:role': 'candidate',
        ...attributes
      }
    };
    
    MOCK_USERS[email.toLowerCase()] = mockUser;
    
    return {
      isSignUpComplete: true,
      nextStep: {
        signUpStep: 'DONE'
      }
    };
  }

  async getCurrentUser() {
    if (!this.currentUser) {
      throw new Error('No user signed in');
    }
    
    return {
      userId: this.currentUser.userId,
      username: this.currentUser.username,
      signInDetails: {
        loginId: this.currentUser.email
      }
    };
  }

  async fetchUserAttributes() {
    if (!this.currentUser) {
      throw new Error('No user signed in');
    }
    
    return this.currentUser.attributes;
  }

  async fetchAuthSession() {
    if (!this.currentUser) {
      throw new Error('No user signed in');
    }

    // Mock JWT token with groups
    const groups = this.currentUser.role === 'super_admin' ? ['SuperAdmins'] :
                   this.currentUser.role === 'company_admin' ? ['CompanyAdmins'] :
                   ['Candidates'];

    return {
      tokens: {
        accessToken: {
          payload: {
            'cognito:groups': groups,
            email: this.currentUser.email,
            username: this.currentUser.username
          }
        }
      }
    };
  }

  async signOut() {
    console.log('🧪 Mock Auth: Sign out');
    this.currentUser = null;
  }

  async confirmSignUp(email: string, code: string) {
    console.log('🧪 Mock Auth: Confirm sign up for', email, 'with code', code);
    return {
      isSignUpComplete: true,
      nextStep: {
        signUpStep: 'DONE'
      }
    };
  }

  async resendSignUpCode(email: string) {
    console.log('🧪 Mock Auth: Resend confirmation code for', email);
    return {
      destination: email,
      deliveryMedium: 'EMAIL'
    };
  }

  async updateUserAttributes(attributes: { userAttributes: Record<string, string> }) {
    if (!this.currentUser) {
      throw new Error('No user signed in');
    }
    
    console.log('🧪 Mock Auth: Update user attributes', attributes);
    
    // Update the mock user attributes
    Object.assign(this.currentUser.attributes, attributes.userAttributes);
    
    if (attributes.userAttributes['custom:role']) {
      this.currentUser.role = attributes.userAttributes['custom:role'] as any;
    }
  }
}

export const mockAuthService = new MockAuthService();