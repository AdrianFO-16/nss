export function OrganismPanel() {
  return (
    <div className="flex h-full flex-col rounded-lg border border-nss-border bg-nss-surface p-3">
      <span className="mb-2 text-xs font-semibold uppercase tracking-widest text-nss-muted">
        Organism Display
      </span>
      <div className="flex flex-1 items-center justify-center rounded bg-nss-bg">
        <span className="text-sm text-nss-muted">Canvas will render here</span>
      </div>
    </div>
  )
}
