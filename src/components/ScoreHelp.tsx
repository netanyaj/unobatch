import { WEIGHTS } from "@/lib/match";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

const FACTORS: [keyof typeof WEIGHTS, string][] = [
  ["experience", "Has worked in this category, plus extra for past projects in it that went ahead."],
  ["capability", "Has the specific skills your claims and problems call for."],
  ["location", "In your city, or nearby. Matters less for technologists and labs."],
  ["workload", "Has room to take you on now."],
  ["history", "How past intros went: went ahead counts for, declined or didn't work counts against."],
  ["certification", "Holds the certifications that matter for this type of partner."],
  ["batchFit", "Your first batch sits comfortably inside their range, not right at the minimum."],
];

export default function ScoreHelp() {
  return (
    <div className="rounded-md bg-muted p-3 text-sm">
      <p className="text-muted-foreground">
        First we remove partners who can&apos;t do the job: wrong category, can&apos;t handle your storage, or your
        batch is outside their range. Then we score the rest out of 100:
      </p>
      <Table className="mt-2">
        <TableBody>
          {FACTORS.map(([k, text]) => (
            <TableRow key={k} className="hover:bg-transparent">
              <TableCell className="w-10 py-1.5 font-medium tabular-nums">{WEIGHTS[k]}</TableCell>
              <TableCell className="whitespace-normal py-1.5">{text}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

