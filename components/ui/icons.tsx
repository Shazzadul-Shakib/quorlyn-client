import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      width={18}
      height={18}
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconCheck = (p: IconProps) => (
  <Icon {...p}><path d="m4.5 12.5 5 5 10-11" /></Icon>
);
export const IconX = (p: IconProps) => (
  <Icon {...p}><path d="M6 6l12 12M18 6 6 18" /></Icon>
);
export const IconPlus = (p: IconProps) => (
  <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>
);
export const IconTrash = (p: IconProps) => (
  <Icon {...p}><path d="M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3" /></Icon>
);
export const IconEdit = (p: IconProps) => (
  <Icon {...p}><path d="M4 20h4L20 8l-4-4L4 16v4Z" /></Icon>
);
export const IconLink = (p: IconProps) => (
  <Icon {...p}><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" /></Icon>
);
export const IconUsers = (p: IconProps) => (
  <Icon {...p}><circle cx="9" cy="8" r="3.2" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 5.5a3 3 0 0 1 0 5.5M17 20a6 6 0 0 0-2-4.4" /></Icon>
);
export const IconBook = (p: IconProps) => (
  <Icon {...p}><path d="M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z" /><path d="M5 17a3 3 0 0 1 3-3h9" /></Icon>
);
export const IconChart = (p: IconProps) => (
  <Icon {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></Icon>
);
export const IconClock = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Icon>
);
export const IconAlert = (p: IconProps) => (
  <Icon {...p}><path d="M12 4.5 2.5 20h19L12 4.5Z" /><path d="M12 10v4.5M12 17.5h.01" /></Icon>
);
export const IconInfo = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5M12 7.7h.01" /></Icon>
);
export const IconLogout = (p: IconProps) => (
  <Icon {...p}><path d="M15 5H6v14h9" /><path d="m14 12h8m0 0-3-3m3 3-3 3" /></Icon>
);
export const IconSun = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" /></Icon>
);
export const IconMoon = (p: IconProps) => (
  <Icon {...p}><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" /></Icon>
);
export const IconTable = (p: IconProps) => (
  <Icon {...p}><rect x="3.5" y="4.5" width="17" height="15" rx="1.5" /><path d="M3.5 10h17M9.5 4.5v15" /></Icon>
);
export const IconBuilding = (p: IconProps) => (
  <Icon {...p}><path d="M4 20V6l8-3v17M12 20h8V10l-8-3" /><path d="M7 9h2M7 13h2M7 17h2M15 12h2M15 16h2" /></Icon>
);
export const IconChevronRight = (p: IconProps) => (
  <Icon {...p}><path d="m9 5 7 7-7 7" /></Icon>
);
export const IconChevronDown = (p: IconProps) => (
  <Icon {...p}><path d="m5 9 7 7 7-7" /></Icon>
);
export const IconArrowLeft = (p: IconProps) => (
  <Icon {...p}><path d="M20 12H4m0 0 6-6m-6 6 6 6" /></Icon>
);
export const IconCopy = (p: IconProps) => (
  <Icon {...p}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h8" /></Icon>
);
export const IconMail = (p: IconProps) => (
  <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 7 8.5 6 8.5-6" /></Icon>
);
export const IconShield = (p: IconProps) => (
  <Icon {...p}><path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" /></Icon>
);
export const IconPlay = (p: IconProps) => (
  <Icon {...p}><path d="M8 5.5v13l11-6.5-11-6.5Z" /></Icon>
);
export const IconTrophy = (p: IconProps) => (
  <Icon {...p}><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" /><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 20h6M12 14v6" /></Icon>
);
export const IconSearch = (p: IconProps) => (
  <Icon {...p}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></Icon>
);
export const IconMenu = (p: IconProps) => (
  <Icon {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Icon>
);
export const IconRefresh = (p: IconProps) => (
  <Icon {...p}><path d="M20 11a8 8 0 1 0-1.5 6" /><path d="M20 5v6h-6" /></Icon>
);
export const IconEye = (p: IconProps) => (
  <Icon {...p}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></Icon>
);
export const IconHome = (p: IconProps) => (
  <Icon {...p}><path d="M4 11.5 12 4l8 7.5" /><path d="M6 10v10h12V10" /><path d="M10 20v-6h4v6" /></Icon>
);
export const IconSettings = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="12" r="3.2" /><path d="M12 3.5v2.2M12 18.3v2.2M4.6 7l1.9 1.1M17.5 15.9l1.9 1.1M3.5 12h2.2M18.3 12h2.2M4.6 17l1.9-1.1M17.5 8.1l1.9-1.1" /></Icon>
);
export const IconLayers = (p: IconProps) => (
  <Icon {...p}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></Icon>
);
export const IconArrowUp = (p: IconProps) => (
  <Icon {...p}><path d="M12 20V4m0 0-6 6m6-6 6 6" /></Icon>
);
export const IconArrowDown = (p: IconProps) => (
  <Icon {...p}><path d="M12 4v16m0 0 6-6m-6 6-6-6" /></Icon>
);
