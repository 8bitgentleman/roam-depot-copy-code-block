import test from "node:test";
import assert from "node:assert/strict";
import { extractCode } from "../src/fence.mjs";

const cases = [
  ["3-fence, language", "```javascript\nconst a = 1;\nconsole.log(a);```", "const a = 1;\nconsole.log(a);"],
  ["3-fence, no language", "```\nplain```", "plain"],
  ["3-fence, c++", "```c++\nint main() {}```", "int main() {}"],
  ["3-fence, language with space", "```plain text\nhello world```", "hello world"],
  ["3-fence, newline before closing fence", "```python\nprint(1)\n```", "print(1)"],
  ["3-fence, empty", "```javascript\n```", ""],
  ["4-fence, language", "````javascript\nconst a = 1;````", "const a = 1;"],
  ["4-fence, no language", "````\nplain````", "plain"],
  ["4-fence with inner bare ``` lines", "````markdown\nHello\n```\nhaha\n```\nWorld````", "Hello\n```\nhaha\n```\nWorld"],
  ["4-fence inner bare ```, newline before closing fence", "````markdown\nHello\n```\nhaha\n```\nWorld\n````", "Hello\n```\nhaha\n```\nWorld"],
  ["4-fence with inner ```js block", "````markdown\nBefore\n```js\nlet x = 1;\n```\nAfter````", "Before\n```js\nlet x = 1;\n```\nAfter"],
  ["4-fence, empty", "````javascript\n````", ""],
  ["5-fence, language", "`````python\nprint(1)`````", "print(1)"],
  ["5-fence containing 4- and 3-fences", "`````markdown\nA\n````md\nB\n```js\nC\n```\nD\n````\nE`````", "A\n````md\nB\n```js\nC\n```\nD\n````\nE"],
  ["text around a 4-fence", "intro ````js\nx```` outro", "x"],
  ["inline code before a block", "see `foo` then ```js\nx```", "x"],
  ["two blocks -> first (known limitation)", "a ```python\na=1``` and ```bash\nls```", "a=1"],
  ["six backticks = empty 3-fence", "``````", ""],
  ["no fence", "just `inline` text", null],
  ["empty string", "", null],
  ["non-string", undefined, null],
];

for (const [name, input, expected] of cases) {
  test(name, () => {
    assert.equal(extractCode(input), expected);
  });
}
