import { FieldValue, Timestamp } from "firebase/firestore";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type AxisRegistry = {
  tag: string;
  displayName: string;
  min: number;
  defaultValue: number;
  max: number;
  precision: number;
  description: string;
  fallbackOnly: boolean;
  illustrationUrl?: string;
  fallbacks: Array<{
    name: string;
    value: number;
    displayName: string;
  }>;
};

export type FontDetails = {
  thickness?: number | null;
  slant?: number | null;
  width?: number | null;
  lineHeight: number;
};

export type FamilyMetadata = {
  family: string;
  displayName: string | null;
  category: string;
  stroke?: string | null;
  classifications: string[];
  size: number;
  subsets: string[];
  fonts: Record<string, FontDetails>;
  axes: Array<any>;
  designers: string[];
  lastModified: string; // ISO date string
  dateAdded: string; // ISO date string
  popularity: number;
  trending: number;
  defaultSort: number;
  androidFragment: string | null;
  isNoto: boolean;
  colorCapabilities: Array<any>;
  primaryScript: string;
  primaryLanguage: string;
  isOpenSource: boolean;
  isBrandFont: boolean;
};

export type GoogleFontsAPIResponse = {
  axisRegistry: AxisRegistry[];
  familyMetadataList: FamilyMetadata[];
  promotedScript: any | null;
};

export type Font = {
  family: string;
  displayName?: string | null;
  category: string;
  stroke?: string | null;
  classifications?: string[];
  size?: number;
  subsets?: string[];
  fonts?: Record<string, FontDetails>;
  axes?: Array<any>;
  designers?: string[];
  lastModified?: string; // ISO date string
  dateAdded?: string; // ISO date string
  popularity?: number;
  trending?: number;
  defaultSort?: number;
  androidFragment?: string | null;
  isNoto?: boolean;
  colorCapabilities?: Array<any>;
  primaryScript?: string;
  primaryLanguage?: string;
  isOpenSource?: boolean;
  isBrandFont?: boolean;

  variants: string[];
  id: number;
};

export type FaviFontUser = {
  uid: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  displayImage: string;
  createdAt: Timestamp | FieldValue;

  favoriteFonts: Font[];
  currentIndex: number;
};