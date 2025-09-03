// src/lib/amplify-config.d.ts
declare module "@/lib/amplify-config" {
  export function configureAmplify(): boolean;
  export function isAmplifyConfigured(): boolean;

  const _default: () => boolean;
  export default _default;
}
