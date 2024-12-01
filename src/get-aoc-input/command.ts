import fs from 'node:fs';
import path from 'node:path';
import wretch from 'wretch';

function getAocClient(session: string) {
  return wretch('https://adventofcode.com')
    .options({ credentials: 'same-origin' })
    .headers({
      Cookie: `session=${session}`,
    });
}

async function downloadAOCInput(year: string, day: string, session: string, outputDir: string): Promise<void> {
  const result = await getAocClient(session).url(`/${year}/day/${day}/input`).get().text();
  const outputPath = path.join(outputDir, 'input.txt');
  return fs.writeFileSync(outputPath, result);
}

export async function fetchCommand(year: string, day: string, session: string, output: string) {
  try {
    console.log(`RETRIEVING AOC INPUT FOR YEAR ${year} DAY ${day}...`);
    const outputDir = output ?? path.join(process.cwd(), `day${day}`);
    fs.mkdirSync(outputDir);

    await downloadAOCInput(year, day, session, outputDir);
    console.log(`AOC INPUT FOR YEAR ${year} DAY ${day} RETRIEVED SUCCESSFULLY!`);
  } catch (error) {
    console.error('ERROR RETRIEVING AOC INPUT: ', error);
  }
}

export async function fetchTitle(year: string, day: string, session: string): Promise<string> {
  const document = await getAocClient(session).url(`/${year}/day/${day}`).get().text();

  const titleRegex = /(---) (Day) (\d+): (.+) (---)/g;
  const fullTitle = document.match(titleRegex);
  if (!fullTitle) {
    return `Day ${day}: unknown title`;
  }

  return fullTitle[0].replaceAll('-', '').trim();
}

function scaffoldAOCFolder(year: string, day: string, outputDir: string, title: string): void {
  const README_TEMPLATE = `[${title}](https://adventofcode.com/${year}/day/${day} "${title}")

\`\`\`shell
npx vite-node task.ts
\`\`\`
`;
  const readmePath = path.join(outputDir, 'README.md');
  fs.writeFileSync(readmePath, README_TEMPLATE);

  const TASK_TEMPLATE = `import { parseInput } from '../src/parse-input';

function part1(input: string[]) {}

function part2(input: string[]) {}

function go(): void {
  const input = parseInput('./input.txt');

  const res1 = part1(input);
  console.log('PART 1: ', res1);

  const res2 = part2(input);
  console.log('PART 2: ', res2);
}

go();
`;
  const taskPath = path.join(outputDir, 'task.ts');
  fs.writeFileSync(taskPath, TASK_TEMPLATE);
}

export async function scaffoldCommand(year: string, day: string, session: string, output: string): Promise<void> {
  try {
    console.log(`SCAFFOLDING AOC INPUT FOR YEAR ${year} DAY ${day}...`);
    const outputDir = output ?? path.join(process.cwd(), `day${day}`);
    fs.mkdirSync(outputDir);

    await downloadAOCInput(year, day, session, outputDir);

    const title = await fetchTitle(year, day, session);
    scaffoldAOCFolder(year, day, outputDir, title);
    console.log(`AOC INPUT FOR YEAR ${year} DAY ${day} SCAFFOLDED SUCCESSFULLY!`);
  } catch (error) {
    console.error('ERROR SCAFFOLDING AOC INPUT: ', error);
  }
}
