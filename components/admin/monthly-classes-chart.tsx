interface MonthlyBucket {
  key: string
  label: string
  classes: number
}

export function MonthlyClassesChart({ data }: { data: MonthlyBucket[] }) {
  const max = Math.max(1, ...data.map((d) => d.classes))

  return (
    <div className="flex h-48 items-end gap-2">
      {data.map((bucket) => (
        <div key={bucket.key} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-xs font-medium text-gray-500">{bucket.classes || ""}</span>
          <div
            className="w-full rounded-t-md bg-red-500 transition-all"
            style={{ height: `${Math.max(4, (bucket.classes / max) * 140)}px` }}
          />
          <span className="text-xs capitalize text-gray-500">{bucket.label}</span>
        </div>
      ))}
    </div>
  )
}
