export function PlotsPanel() {
  return (
    <div className="flex h-full flex-col rounded-lg border border-nss-border bg-nss-surface p-3">
      <span className="mb-2 text-xs font-semibold uppercase tracking-widest text-nss-muted">
        Plots
      </span>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-1 items-center justify-center rounded bg-nss-bg">
          <span className="text-sm text-nss-muted">Population chart</span>
        </div>
        <div className="flex flex-1 items-center justify-center rounded bg-nss-bg">
          <span className="text-sm text-nss-muted">Key metric chart</span>
        </div>
      </div>
    </div>
  )
}
