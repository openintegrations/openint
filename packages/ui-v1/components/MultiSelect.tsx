'use client'

import {useState} from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Input,
  Separator,
} from '@openint/shadcn/ui'

interface MultiSelectProps {
  items: string[]
  onChange: (value: string[]) => void
  value: string[]
  hideSearch?: boolean
}

export function MultiSelect({
  hideSearch = false,
  items,
  value,
  onChange,
}: MultiSelectProps) {
  const [search, setSearch] = useState('')

  const filteredItems =
    search !== ''
      ? items.filter((item) =>
          item.toLowerCase().includes(search.toLowerCase()),
        )
      : items

  return (
    <Card className="w-full max-w-md gap-0 rounded-sm pb-0">
      {!hideSearch && (
        <>
          <CardHeader>
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
              }}
              className="mb-4 w-full"
            />
          </CardHeader>
          <Separator />
        </>
      )}
      <CardContent className="overflow-y-auto">
        <div className="flex flex-col gap-3">
          <div className="max-h-[300px]">
            {filteredItems.map((item) => (
              <label
                key={item}
                className="flex cursor-pointer items-center space-x-2 py-1">
                <Checkbox
                  checked={value.includes(item)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onChange([...value, item])
                    } else {
                      onChange(value.filter((value) => value !== item))
                    }
                  }}
                  className="mr-2"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
