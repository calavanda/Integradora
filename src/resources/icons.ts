import { IconType } from "react-icons";

import {
  HiOutlineRocketLaunch,
  HiOutlineDocumentChartBar,
  HiOutlineShieldCheck,
  HiOutlineSquares2X2,
  HiCog8Tooth,
  HiOutlineCube,
  HiOutlineCodeBracket,
  HiOutlineSparkles,
  HiOutlineBookOpen,
  HiOutlineInformationCircle,
  HiOutlineUserGroup,
  HiOutlineDocumentText,
  HiOutlineEnvelope,
  HiOutlineChevronDown,
} from "react-icons/hi2";

export const iconLibrary: Record<string, IconType> = {
  rocket: HiOutlineRocketLaunch,
  grid: HiOutlineSquares2X2,
  HiOutlineDocumentChartBar,
  HiOutlineShieldCheck,
  HiOutlineSquares2X2,
  HiCog8Tooth,
  cube: HiOutlineCube,
  code: HiOutlineCodeBracket,
  sparkle: HiOutlineSparkles,
  book: HiOutlineBookOpen,
  infoCircle: HiOutlineInformationCircle,
  people: HiOutlineUserGroup,
  document: HiOutlineDocumentText,
  email: HiOutlineEnvelope,
  chevronDown: HiOutlineChevronDown,
};

export type IconLibrary = typeof iconLibrary;
export type IconName = keyof IconLibrary;

// Augment Once UI IconLibraryOverrides so all custom icon names typecheck cleanly
declare module "@once-ui-system/core" {
  interface IconLibraryOverrides {
    rocket: true;
    grid: true;
    HiOutlineDocumentChartBar: true;
    HiOutlineShieldCheck: true;
    HiOutlineSquares2X2: true;
    HiCog8Tooth: true;
    cube: true;
    infoCircle: true;
    people: true;
    email: true;
  }
}