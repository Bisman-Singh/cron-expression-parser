import { ParsedCron } from "./parser";

export function getNextRunTimes(
  parsed: ParsedCron,
  count: number,
  from: Date = new Date()
): Date[] {
  const results: Date[] = [];
  const current = new Date(from);

  current.setSeconds(0, 0);
  current.setMinutes(current.getMinutes() + 1);

  const maxIterations = 525960; // ~1 year of minutes

  let iterations = 0;

  while (results.length < count && iterations < maxIterations) {
    iterations++;

    const minute = current.getMinutes();
    const hour = current.getHours();
    const dayOfMonth = current.getDate();
    const month = current.getMonth() + 1;
    const dayOfWeek = current.getDay();

    if (
      parsed.minute.values.includes(minute) &&
      parsed.hour.values.includes(hour) &&
      parsed.dayOfMonth.values.includes(dayOfMonth) &&
      parsed.month.values.includes(month) &&
      parsed.dayOfWeek.values.includes(dayOfWeek)
    ) {
      results.push(new Date(current));
    }

    current.setMinutes(current.getMinutes() + 1);
  }

  return results;
}

export function formatRunTime(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  return date.toLocaleString("en-US", options);
}
