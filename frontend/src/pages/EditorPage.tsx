import { useState } from 'react';
import { Code2, Info } from 'lucide-react';
import { CodeEditor } from '@/components/ui';
import { Card } from '@/components/ui';

const SNIPPETS: Record<string, string> = {
  python: '# Welcome to the MindOS code editor\n# Write your Python below — execution is coming soon.\n\ndef solve(nums: list[int], target: int) -> list[int]:\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n    return []\n\nprint(solve([2, 7, 11, 15], 9))',
  java: '// Welcome to the MindOS code editor\n// Execution is coming soon.\n\npublic class Main {\n  public static int[] twoSum(int[] nums, int target) {\n    java.util.Map<Integer, Integer> seen = new java.util.HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n      if (seen.containsKey(target - nums[i]))\n        return new int[]{seen.get(target - nums[i]), i};\n      seen.put(nums[i], i);\n    }\n    return new int[]{};\n  }\n}',
  cpp: '// Welcome to the MindOS code editor\n// Execution is coming soon.\n\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n  unordered_map<int, int> seen;\n  for (int i = 0; i < nums.size(); i++) {\n    if (seen.count(target - nums[i]))\n      return {seen[target - nums[i]], i};\n    seen[nums[i]] = i;\n  }\n  return {};\n}',
  javascript: '// Welcome to the MindOS code editor\n// Execution is coming soon.\n\nfunction twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    if (seen.has(target - nums[i]))\n      return [seen.get(target - nums[i]), i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}',
  sql: '-- Welcome to the MindOS code editor\n-- Execution is coming soon.\n\nSELECT department, COUNT(*) AS headcount\nFROM employees\nGROUP BY department\nORDER BY headcount DESC;',
  typescript: '// Welcome to the MindOS code editor\n// Execution is coming soon.\n\nfunction twoSum(nums: number[], target: number): number[] {\n  const seen = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    if (seen.has(target - nums[i]))\n      return [seen.get(target - nums[i])!, i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}',
  bash: '# Welcome to the MindOS code editor\n# Execution is coming soon.\n\ngreet() {\n  echo "Hello, $1!"\n}\n\ngreet "MindOS"',
};

export default function EditorPage() {
  const [lang, setLang] = useState<keyof typeof SNIPPETS>('python');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-900">Code Editor</h1>
          <p className="text-sm text-ink-500">A focused scratchpad for working through problems.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-card px-2.5 py-1 text-xs text-ink-400">
          <Code2 className="h-3.5 w-3.5" /> No execution yet
        </span>
      </div>

      <Card className="border-brand-100 bg-brand-50/30">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          <p className="text-xs text-ink-600">
            The editor supports syntax selection, copy, download, and reset. A code runner is reserved as an
            extension point for a future release — the <strong>Run</strong> button is a placeholder.
          </p>
        </div>
      </Card>

      <div className="flex gap-1.5 overflow-x-auto">
        {(Object.keys(SNIPPETS) as (keyof typeof SNIPPETS)[]).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${lang === l ? 'bg-ink-900 text-white' : 'bg-surface-card text-ink-500 hover:text-ink-900'}`}
          >
            {l}
          </button>
        ))}
      </div>

      <CodeEditor initialCode={SNIPPETS[lang]} initialLanguage={lang as 'python'} />
    </div>
  );
}
