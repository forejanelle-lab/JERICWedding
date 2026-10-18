import type { PhotoFolder, PhotoQuestion, PredictionQuestion, QuizQuestion } from "@/lib/hub/types";

export type SiteContent = {
  siteCopy: Record<string, string>;
  siteImages: Record<string, string>;
  siteHidden: string[];
  hiddenPages: string[];
  heroImage: string;
  photoFolders: PhotoFolder[];
  gameQuestions?: Record<string, QuizQuestion[]>;
  photoQuestions?: PhotoQuestion[];
  predictionQuestions?: PredictionQuestion[];
};
