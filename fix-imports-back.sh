#!/bin/bash
find apps -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|[.][.]/[.][.]/[.][.]/[.][.]/packages/shadcn/ui|@openint/shadcn/ui|g'
