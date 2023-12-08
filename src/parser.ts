export interface CronField {
  values: number[];
  raw: string;
}

export interface ParsedCron {
  minute: CronField;
  hour: CronField;
  dayOfMonth: CronField;
  month: CronField;
  dayOfWeek: CronField;
  raw: string;
}

interface FieldConfig {
  name: string;
  min: number;
  max: number;
  aliases?: Record<string, number>;
}

const FIELD_CONFIGS: FieldConfig[] = [
  { name: "minute", min: 0, max: 59 },
  { name: "hour", min: 0, max: 23 },
  { name: "day of month", min: 1, max: 31 },
  {
    name: "month",
    min: 1,
    max: 12,
    aliases: {
      jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
      jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
    },
  },
  {
    name: "day of week",
    min: 0,
    max: 6,
    aliases: {
      sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
    },
  },
];

function replaceAliases(field: string, aliases?: Record<string, number>): string {
  if (!aliases) return field;
  let result = field.toLowerCase();
  for (const [alias, value] of Object.entries(aliases)) {
    result = result.replace(new RegExp(alias, "gi"), String(value));
  }
  return result;
}

function parseField(raw: string, config: FieldConfig): CronField {
  const field = replaceAliases(raw, config.aliases);
  const values: Set<number> = new Set();

  const parts = field.split(",");

  for (const part of parts) {
    if (part === "*") {
      for (let i = config.min; i <= config.max; i++) {
        values.add(i);
      }
      continue;
    }

    const stepMatch = part.match(/^(.+)\/(\d+)$/);
    if (stepMatch) {
      const [, range, stepStr] = stepMatch;
      const step = parseInt(stepStr, 10);

      let start = config.min;
      let end = config.max;

      if (range !== "*") {
        const rangeMatch = range.match(/^(\d+)-(\d+)$/);
        if (rangeMatch) {
          start = parseInt(rangeMatch[1], 10);
          end = parseInt(rangeMatch[2], 10);
        } else {
          start = parseInt(range, 10);
          end = config.max;
        }
      }

      for (let i = start; i <= end; i += step) {
        if (i >= config.min && i <= config.max) {
          values.add(i);
        }
      }
      continue;
    }

    const rangeMatch = part.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const end = parseInt(rangeMatch[2], 10);

      if (start > end) {
        throw new Error(
          `Invalid range ${start}-${end} in ${config.name} field`
        );
      }

      for (let i = start; i <= end; i++) {
        if (i >= config.min && i <= config.max) {
          values.add(i);
        }
      }
      continue;
    }

    const num = parseInt(part, 10);
    if (isNaN(num)) {
      throw new Error(
        `Invalid value "${part}" in ${config.name} field`
      );
    }

    if (num < config.min || num > config.max) {
      throw new Error(
        `Value ${num} out of range (${config.min}-${config.max}) in ${config.name} field`
      );
    }

    values.add(num);
  }

  return {
    values: Array.from(values).sort((a, b) => a - b),
    raw,
  };
}

export function parseCron(expression: string): ParsedCron {
  const trimmed = expression.trim();
  const fields = trimmed.split(/\s+/);

  if (fields.length !== 5) {
    throw new Error(
      `Invalid cron expression: expected 5 fields, got ${fields.length}`
    );
  }

  return {
    minute: parseField(fields[0], FIELD_CONFIGS[0]),
    hour: parseField(fields[1], FIELD_CONFIGS[1]),
    dayOfMonth: parseField(fields[2], FIELD_CONFIGS[2]),
    month: parseField(fields[3], FIELD_CONFIGS[3]),
    dayOfWeek: parseField(fields[4], FIELD_CONFIGS[4]),
    raw: trimmed,
  };
}

export function validateCron(expression: string): { valid: boolean; error?: string } {
  try {
    parseCron(expression);
    return { valid: true };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
