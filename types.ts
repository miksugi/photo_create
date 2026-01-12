
export interface ProcessingState {
  isProcessing: boolean;
  error: string | null;
  progressMessage: string;
}

export interface GeneratedImage {
  url: string;
  originalUrl: string;
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  UNSPECIFIED = 'unspecified'
}
