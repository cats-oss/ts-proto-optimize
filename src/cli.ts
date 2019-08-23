import path from "path";
import fs from "fs";
import meow from "meow";
import chalk from "chalk";
import mkdirp from "mkdirp";
import { optimize } from "./optimize";
import { NamespaceReplacement } from "./types";

const Status = {
  OK: 0,
  ERROR: 1
} as const;

const cli = meow(
  `
${chalk.yellow("USAGE:")}
  $ ts-proto-optimize [options] path

${chalk.yellow("OPTIONS:")}
  --output, -o   Path to output file
  --ns           Namespace replacement config (e.g. "before:after")
  --help, -h     Show this help
  --version, -v  Show current version

${chalk.yellow("EXAMPLES:")}
  $ ts-proto-optimize path/to/proto.d.ts
  $ ts-proto-optimize path/to/proto.d.ts --output dist/to/proto.d.ts
  $ ts-proto-optimize path/to/proto.d.ts --ns root:fuga
  $ ts-proto-optimize path/to/proto.d.ts --ns root:fuga --ns hoge:piyo
  $ ts-proto-optimize path/to/proto.d.ts --ns root:
`,
  {
    flags: {
      output: {
        type: "string",
        alias: "o"
      },
      ns: {
        type: "string"
      },
      help: {
        alias: "h"
      },
      version: {
        alias: "v"
      }
    }
  }
);

const fileExists = (input: string) => {
  try {
    return fs.statSync(input).isFile() === true;
  } catch (e) {
    return false;
  }
};

const parseNamespaces = (
  input: string | string[] | undefined
): NamespaceReplacement => {
  if (input == null) {
    return {};
  }

  if (Array.isArray(input)) {
    return input
      .map(v => parseNamespaces(v))
      .reduce(
        (acc, cur) => ({
          ...acc,
          ...cur
        }),
        {}
      );
  }

  const [key, value] = input.split(":");

  return { [key]: value };
};

(async () => {
  try {
    const cwd = process.cwd();

    const filepath = path.resolve(cwd, cli.input[0]);
    if (!fileExists(filepath)) {
      throw new Error(`proto file does not exist ("${filepath}")`);
    }

    const output =
      cli.flags.output != null ? path.join(cwd, cli.flags.output) : null;

    const input = fs.readFileSync(filepath, { encoding: "utf8" });
    const result = optimize(input, parseNamespaces(cli.flags.ns));

    if (output == null) {
      console.log(result);
    } else {
      mkdirp.sync(path.dirname(output));
      fs.writeFileSync(output, result);
    }

    process.exit(Status.OK);
  } catch (e) {
    console.error(
      `${chalk.bgRed.bold.white(" ERROR ")} ${chalk.red(e.message)}`
    );

    process.exit(Status.ERROR);
  }
})();
