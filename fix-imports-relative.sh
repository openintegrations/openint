#!/bin/bash
find apps/web -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i "" "s|@openint/shadcn/ui|../../packages/shadcn/ui|g"
