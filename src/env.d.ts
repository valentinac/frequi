/* Provide Type for Vite's import.meta.env structure */
interface ImportMetaEnv extends Readonly<Record<string, string>> {
  readonly BASE_URL: string;
  readonly MODE: string;
  readonly PROD: boolean;
  readonly DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __COMMIT_HASH__: string;
