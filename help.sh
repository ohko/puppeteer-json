#!/bin/sh

echo "# 指令集\n" > HELP.md
echo '```json' >> HELP.md
cat runtime/*.ts|grep '// { ".*'|awk -F "// " '{print $2}'|sort >> HELP.md
echo '```' >> HELP.md