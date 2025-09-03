/** @type {import('next').NextConfig} */
module.exports = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  experimental: {
    serverComponentsExternalPackages: ["aws-amplify"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Force environment variables for AWS region override at build time
  env: {
    NEXT_PUBLIC_FORCE_REGION: 'us-west-1',
    NEXT_PUBLIC_AWS_PROJECT_REGION: 'us-west-1',
    NEXT_PUBLIC_AWS_COGNITO_REGION: 'us-west-1',
    NEXT_PUBLIC_AWS_APPSYNC_REGION: 'us-west-1',
    NEXT_PUBLIC_APP_ENV: 'abhh'
  }
};