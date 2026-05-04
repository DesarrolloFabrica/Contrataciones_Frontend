declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.svg";

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.mp4" {
  const src: string;
  export default src;
}

declare module "*.lottie" {
  const src: string;
  export default src;
}