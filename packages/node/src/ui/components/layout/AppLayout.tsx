import { OrganismPanel } from './OrganismPanel'
import { PlotsPanel } from './PlotsPanel'
import { ControlsPanel } from './ControlsPanel'
import { ParamsPanel } from './ParamsPanel'

export function AppLayout() {
  return (
    <div className="flex h-screen w-screen flex-col gap-2 bg-nss-bg p-2">
      {/* Row 1 — 70% height: organism display (60%) + plots (40%) */}
      <div className="flex min-h-0 flex-[7] gap-2">
        <div className="min-w-0 flex-[6]">
          <OrganismPanel />
        </div>
        <div className="min-w-0 flex-[4]">
          <PlotsPanel />
        </div>
      </div>

      {/* Row 2 — 30% height: controls (50%) + params (50%) */}
      <div className="flex min-h-0 flex-[3] gap-2">
        <div className="min-w-0 flex-1">
          <ControlsPanel />
        </div>
        <div className="min-w-0 flex-1">
          <ParamsPanel />
        </div>
      </div>
    </div>
  )
}
