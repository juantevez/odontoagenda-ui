/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL_IAM: string;
  readonly VITE_API_BASE_URL_PATIENT: string;
  readonly VITE_API_BASE_URL_PROFESSIONAL: string;
  readonly VITE_API_BASE_URL_SCHEDULING: string;
  readonly VITE_API_BASE_URL_COVERAGE: string;
  readonly VITE_API_BASE_URL_BILLING: string;
  readonly VITE_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
