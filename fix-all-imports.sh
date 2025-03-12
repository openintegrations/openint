#!/bin/bash
find . -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|[.][.]/[.][.]/packages/shadcn/ui|@openint/shadcn/ui|g'
find . -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|[.][.]/[.][.]/[.][.]/packages/shadcn/ui|@openint/shadcn/ui|g'
find . -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|[.][.]/packages/shadcn/ui|@openint/shadcn/ui|g'
