import { ParsedCron } from "./parser";

const DAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const displayMinute = minute.toString().padStart(2, "0");
  return `${displayHour}:${displayMinute} ${period}`;
}

function describeMinutes(values: number[]): string {
  if (values.length === 60) return "every minute";
  if (values.length === 1) return `at minute ${values[0]}`;

  const isStep = values.length > 1 && values.every((v, i) => {
    if (i === 0) return true;
    return v - values[i - 1] === values[1] - values[0];
  });

  if (isStep && values[0] === 0) {
    const step = values[1] - values[0];
    return `every ${step} minutes`;
  }

  return `at minutes ${values.join(", ")}`;
}

function describeHours(values: number[]): string {
  if (values.length === 24) return "";
  if (values.length === 1) {
    const period = values[0] >= 12 ? "PM" : "AM";
    const hour = values[0] === 0 ? 12 : values[0] > 12 ? values[0] - 12 : values[0];
    return `${hour} ${period}`;
  }
  return `hours ${values.map((h) => {
    const period = h >= 12 ? "PM" : "AM";
    const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${display} ${period}`;
  }).join(", ")}`;
}

function describeDaysOfWeek(values: number[]): string {
  if (values.length === 7) return "";
  if (values.length === 1) return `on ${DAY_NAMES[values[0]]}`;

  const consecutive = values.every((v, i) => {
    if (i === 0) return true;
    return v - values[i - 1] === 1;
  });

  if (consecutive && values.length > 2) {
    return `${DAY_NAMES[values[0]]} through ${DAY_NAMES[values[values.length - 1]]}`;
  }

  return `on ${values.map((d) => DAY_NAMES[d]).join(", ")}`;
}

function describeMonths(values: number[]): string {
  if (values.length === 12) return "";
  if (values.length === 1) return `in ${MONTH_NAMES[values[0]]}`;
  return `in ${values.map((m) => MONTH_NAMES[m]).join(", ")}`;
}

function describeDaysOfMonth(values: number[]): string {
  if (values.length === 31) return "";
  if (values.length === 1) return `on day ${values[0]}`;
  return `on days ${values.join(", ")}`;
}

export function describeCron(parsed: ParsedCron): string {
  const parts: string[] = [];

  const allMinutes = parsed.minute.values.length === 60;
  const allHours = parsed.hour.values.length === 24;
  const allDaysOfMonth = parsed.dayOfMonth.values.length === 31;
  const allMonths = parsed.month.values.length === 12;
  const allDaysOfWeek = parsed.dayOfWeek.values.length === 7;

  if (allMinutes && allHours && allDaysOfMonth && allMonths && allDaysOfWeek) {
    return "Every minute";
  }

  if (allMinutes && allHours) {
    parts.push("Every minute");
  } else if (allMinutes) {
    parts.push(`Every minute of ${describeHours(parsed.hour.values)}`);
  } else if (parsed.minute.values.length === 1 && parsed.hour.values.length === 1) {
    parts.push(`At ${formatTime(parsed.hour.values[0], parsed.minute.values[0])}`);
  } else if (parsed.minute.values.length === 1 && allHours) {
    parts.push(`At minute ${parsed.minute.values[0]} of every hour`);
  } else {
    const minDesc = describeMinutes(parsed.minute.values);
    const hourDesc = describeHours(parsed.hour.values);
    if (hourDesc) {
      parts.push(`${capitalize(minDesc)} during ${hourDesc}`);
    } else {
      parts.push(capitalize(minDesc));
    }
  }

  const dowDesc = describeDaysOfWeek(parsed.dayOfWeek.values);
  if (dowDesc) parts.push(dowDesc);

  const domDesc = describeDaysOfMonth(parsed.dayOfMonth.values);
  if (domDesc && allDaysOfWeek) parts.push(domDesc);

  const monthDesc = describeMonths(parsed.month.values);
  if (monthDesc) parts.push(monthDesc);

  return parts.join(", ");
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
