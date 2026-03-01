import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { PRESETS, getPresetsForLevel, type Preset } from '@/ui/presets/presets'
import type { SimLevel } from '@/ui/hooks/usePlayer'
import type { Level1SimulationParams } from '@/simulation/levels/level1/Level1SimulationParams'
import type { Level2SimulationParams } from '@/simulation/levels/level2/Level2SimulationParams'

interface PresetSectionProps {
  level: SimLevel
  currentSeed: number
  onSetLevel: (l: SimLevel) => void
  onUpdateLevel1Params: (p: Partial<Level1SimulationParams>) => void
  onUpdateLevel2Params: (p: Partial<Level2SimulationParams>) => void
}

export function PresetSection({
  level,
  currentSeed,
  onSetLevel,
  onUpdateLevel1Params,
  onUpdateLevel2Params,
}: PresetSectionProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('')

  const presets = getPresetsForLevel(level)

  function applyPreset(preset: Preset) {
    // Switch level first if needed
    if (preset.level !== level) onSetLevel(preset.level)

    // Apply seed and level-specific params
    if (preset.level === 1) {
      onUpdateLevel1Params({ ...preset.level1Params, seed: preset.seed })
    } else {
      onUpdateLevel2Params({ ...preset.level2Params, seed: preset.seed })
    }
  }

  function handlePresetChange(id: string) {
    setSelectedPresetId(id)
    const preset = PRESETS.find(p => p.id === id)
    if (preset) applyPreset(preset)
  }

  function handleSeedChange(raw: string) {
    const n = parseInt(raw, 10)
    const seed = isNaN(n) ? 0 : Math.max(0, n)
    if (level === 1) onUpdateLevel1Params({ seed })
    else onUpdateLevel2Params({ seed })
    // Clear preset selection when seed is manually edited
    setSelectedPresetId('')
  }

  return (
    <section className="flex flex-col gap-2 border-b border-nss-border pb-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-nss-muted">Presets</p>

      <div className="flex flex-col gap-1">
        <Label className="text-[11px] text-nss-muted">Load preset</Label>
        <Select value={selectedPresetId} onValueChange={handlePresetChange}>
          <SelectTrigger className="h-auto min-h-7 border-nss-border bg-nss-bg text-xs text-nss-text">
            <SelectValue placeholder="Choose a preset…" />
          </SelectTrigger>
          <SelectContent className="border-nss-border bg-nss-surface text-nss-text">
            {presets.map(p => (
              <SelectItem key={p.id} value={p.id} className="text-xs">
                <div className="flex flex-col gap-0.5 whitespace-normal py-0.5 text-left">
                  <span className="font-medium leading-tight">{p.name}</span>
                  <span className="text-[10px] leading-snug text-nss-muted">{p.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-[11px] text-nss-muted">
          Seed{' '}
          <span className="text-[10px] normal-case text-nss-muted/60">
            (0 = random each run)
          </span>
        </Label>
        <input
          type="number"
          min={0}
          step={1}
          value={currentSeed}
          onChange={e => handleSeedChange(e.target.value)}
          className="h-7 w-full rounded-md border border-nss-border bg-nss-bg px-2 text-xs text-nss-text outline-none focus:border-nss-orange"
        />
      </div>
    </section>
  )
}
