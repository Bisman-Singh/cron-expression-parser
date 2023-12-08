#!/usr/bin/env node

import chalk from "chalk";
import { parseCron, validateCron } from "./parser";
import { describeCron } from "./describer";
import { getNextRunTimes, formatRunTime } from "./scheduler";

export { parseCron, validateCron } from "./parser";
export { describeCron } from "./describer";
export { getNextRunTimes, formatRunTime } from "./scheduler";

function printUsage(): void {
  console.log(`
${chalk.bold("cron-expression-parser")} - Parse, validate, and describe cron expressions

${chalk.bold("Usage:")}
  cron-parser <expression> [options]

${chalk.bold("Options:")}
  --next <n>    Show next N run times (default: 5)
  --validate    Only validate the expression
  --help        Show this help message

${chalk.bold("Examples:")}
  cron-parser "0 9 * * 1-5"
  cron-parser "*/15 * * * *" --next 10
  cron-parser "0 0 1 * *" --validate
`);
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h") || args.length === 0) {
    printUsage();
    process.exit(0);
  }

  const expression = args[0];
  let nextCount = 5;
  let validateOnly = false;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--next" && args[i + 1]) {
      nextCount = parseInt(args[i + 1], 10);
      if (isNaN(nextCount) || nextCount < 1) {
        console.error(chalk.red("Error: --next must be a positive number"));
        process.exit(1);
      }
      i++;
    } else if (args[i] === "--validate") {
      validateOnly = true;
    }
  }

  console.log(chalk.bold("\n  Cron Expression Parser\n"));
  console.log(chalk.gray(`  Expression: ${expression}\n`));

  const validation = validateCron(expression);

  if (!validation.valid) {
    console.log(chalk.red(`  Invalid: ${validation.error}\n`));
    process.exit(1);
  }

  console.log(chalk.green("  Valid cron expression\n"));

  if (validateOnly) {
    process.exit(0);
  }

  const parsed = parseCron(expression);

  const description = describeCron(parsed);
  console.log(chalk.bold("  Description:"));
  console.log(chalk.cyan(`  ${description}\n`));

  console.log(chalk.bold("  Field Breakdown:"));
  console.log(chalk.gray(`  Minute:       ${parsed.minute.values.join(", ")}`));
  console.log(chalk.gray(`  Hour:         ${parsed.hour.values.join(", ")}`));
  console.log(chalk.gray(`  Day of Month: ${parsed.dayOfMonth.values.join(", ")}`));
  console.log(chalk.gray(`  Month:        ${parsed.month.values.join(", ")}`));
  console.log(chalk.gray(`  Day of Week:  ${parsed.dayOfWeek.values.join(", ")}\n`));

  console.log(chalk.bold(`  Next ${nextCount} Run Times:\n`));

  const nextRuns = getNextRunTimes(parsed, nextCount);

  if (nextRuns.length === 0) {
    console.log(chalk.yellow("  No upcoming run times found within the next year.\n"));
  } else {
    nextRuns.forEach((date, index) => {
      console.log(chalk.white(`  ${(index + 1).toString().padStart(2)}. ${formatRunTime(date)}`));
    });
    console.log("");
  }
}

if (require.main === module) {
  main();
}
