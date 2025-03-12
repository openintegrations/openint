#!/bin/bash
find apps -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i "" "s|@openint/shadcn/ui|packages/shadcn/ui|g"
