/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_APPS_SCRIPT_URL: string;
  readonly VITE_USE_PROXY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
