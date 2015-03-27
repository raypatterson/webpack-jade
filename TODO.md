### TODOs
| Filename | line # | TODO
|:------|:------:|:------
| gulpfile.js | 165 | Clean up. Not sure if it's better to do in two passes or nest folders?
| index.js | 2511 | Refactor logging methods into a different object to avoid name clashes
| index.js | 3638 | make this comparison case-insensitive on windows?
| index.js | 4283 | defer error events consistently everywhere, not just the cb
| index.js | 6453 | Handling all encodings inside a single object makes it very difficult
| index.js | 6455 | There should be a utf8-strict encoding that rejects invalid UTF-8 code
| index.js | 7030 | when maxfilesize rotate occurs
| index.js | 8131 | emit 'logged' correctly,
| index.js | 8452 | emit 'logged' correctly,
| index.js | 11077 | handle case where l is > Math.pow(2, 29)