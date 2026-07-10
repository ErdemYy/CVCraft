import type { PersonalInfo } from "@/lib/cv-types";

export interface InfoItem {
  label: string;
  value: string;
  icon: string;
  field?: keyof PersonalInfo;
}

function clean(value: string | undefined) {
  return value?.trim() ?? "";
}

export function formatBirthDate(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function getContactItems(personalInfo: PersonalInfo): InfoItem[] {
  const items: InfoItem[] = [
    { label: "E-posta", value: clean(personalInfo.email), icon: "✉", field: "email" },
    { label: "Telefon", value: clean(personalInfo.phone), icon: "☎", field: "phone" },
    { label: "Konum", value: clean(personalInfo.location), icon: "⌖", field: "location" },
    { label: "Web", value: clean(personalInfo.website), icon: "↗", field: "website" },
    { label: "LinkedIn", value: clean(personalInfo.linkedin), icon: "in", field: "linkedin" },
    { label: "GitHub", value: clean(personalInfo.github), icon: "gh", field: "github" },
  ];
  return items.filter((item) => item.value);
}

export function getPersonalDetailItems(personalInfo: PersonalInfo): InfoItem[] {
  const items: InfoItem[] = [
    { label: "Doğum Tarihi", value: formatBirthDate(clean(personalInfo.birthDate)), icon: "•", field: "birthDate" },
    { label: "Uyruk", value: clean(personalInfo.nationality), icon: "•", field: "nationality" },
    { label: "Medeni Durum", value: clean(personalInfo.maritalStatus), icon: "•", field: "maritalStatus" },
    { label: "Askerlik", value: clean(personalInfo.militaryStatus), icon: "•", field: "militaryStatus" },
    { label: "Ehliyet", value: clean(personalInfo.drivingLicense), icon: "•", field: "drivingLicense" },
  ];
  return items.filter((item) => item.value);
}
