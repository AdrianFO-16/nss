import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { PlayerState } from '@/simulation/core/PlayerState'
import type { Level2SimulationParams } from '@/simulation/levels/level2/Level2SimulationParams'
import type { MetricSnapshot } from '@/ui/adapters/UISimulationAdapter'
import type { Distribution, DistributionType } from '@/simulation/stats/Distribution'
import type { SimLevel } from '@/ui/hooks/usePlayer'

interface Level2ParamsPanelProps {
  params: Level2SimulationParams
  playerState: PlayerState
  metrics?: MetricSnapshot
  sexualSelectionEnabled: boolean
  presetSection?: React.ReactNode
  onUpdateParams: (partial: Partial<Level2SimulationParams>) => void
  onSetLevel: (l: SimLevel) => void
  onSetSexualSelectionEnabled: (enabled: boolean) => void
}

function ParamRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-[11px] text-nss-muted">{label}</Label>
      {children}
    </div>
  )
}

function DistributionFields({
  dist,
  onChange,
}: {
  dist: Distribution
  onChange: (d: Distribution) => void
}) {
  const isNormal = dist.type === 'normal'
  return (
    <>
      <ParamRow label="Distribution type">
        <Select
          value={dist.type}
          onValueChange={(val) => onChange({ type: val as DistributionType, params: {} })}
        >
          <SelectTrigger className="h-7 border-nss-border bg-nss-bg text-xs text-nss-text">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-nss-border bg-nss-surface text-nss-text">
            <SelectItem value="normal" className="text-xs">Normal</SelectItem>
            <SelectItem value="exponential" className="text-xs">Exponential</SelectItem>
          </SelectContent>
        </Select>
      </ParamRow>
      {isNormal ? (
        <>
          <ParamRow label={`Mean: ${(dist.params.mean ?? 0).toFixed(2)}`}>
            <Slider min={0} max={1} step={0.05} value={[dist.params.mean ?? 0]}
              onValueChange={([v]) => onChange({ ...dist, params: { ...dist.params, mean: v } })} />
          </ParamRow>
          <ParamRow label={`Std Dev: ${(dist.params.stddev ?? 0.1).toFixed(2)}`}>
            <Slider min={0.01} max={0.5} step={0.01} value={[dist.params.stddev ?? 0.1]}
              onValueChange={([v]) => onChange({ ...dist, params: { ...dist.params, stddev: v } })} />
          </ParamRow>
        </>
      ) : (
        <ParamRow label={`Lambda: ${(dist.params.lambda ?? 1).toFixed(2)}`}>
          <Slider min={0.1} max={5} step={0.1} value={[dist.params.lambda ?? 1]}
            onValueChange={([v]) => onChange({ ...dist, params: { ...dist.params, lambda: v } })} />
        </ParamRow>
      )}
    </>
  )
}

export function Level2ParamsPanel({
  params,
  playerState,
  metrics,
  sexualSelectionEnabled,
  presetSection,
  onUpdateParams,
  onSetLevel,
  onSetSexualSelectionEnabled,
}: Level2ParamsPanelProps) {
  const isIdle = playerState === PlayerState.IDLE
  const maxPopReached = metrics?.maxPopReached ?? false
  const extinctionGuardActive = metrics?.extinctionGuardActive ?? false
  const colorGuard = (metrics?.colorExtinctionGuardActive ?? {}) as Record<string, boolean>

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 text-nss-text">

      {/* ── Fixed header (level selector + presets + addon) ── */}
      <div className="shrink-0 flex flex-col gap-3">

        {/* Level selector */}
        <div className="flex flex-col gap-1">
          <Label className="text-[10px] font-semibold uppercase tracking-widest text-nss-muted">
            Simulation Level
          </Label>
          <Select
            value="2"
            onValueChange={(val) => onSetLevel(Number(val) as SimLevel)}
          >
            <SelectTrigger className="h-7 border-nss-border bg-nss-bg text-xs text-nss-text">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-nss-border bg-nss-surface text-nss-text">
              <SelectItem value="1" className="text-xs">Level 1: Directional Selection</SelectItem>
              <SelectItem value="2" className="text-xs">Level 2: RPS Selection</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {presetSection}

        {/* Addon checkbox */}
        <div className="flex items-center gap-2">
          <Switch
            id="ssa-toggle"
            checked={sexualSelectionEnabled}
            onCheckedChange={onSetSexualSelectionEnabled}
          />
          <Label htmlFor="ssa-toggle" className="cursor-pointer text-xs text-nss-text">
            Level 3: Sexual Selection
          </Label>
        </div>
      </div>

      {/* ── Scrollable params ─────────────────────────── */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">

      {/* ── Locked-after-start ────────────────────────── */}
      <section className="flex flex-col gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-nss-muted">
          Setup {!isIdle && <span className="ml-1 text-nss-yellow">(locked)</span>}
        </p>
        <ParamRow label={`Initial Population: ${params.initialPopulation}`}>
          <Slider min={30} max={600} step={30} value={[params.initialPopulation]}
            disabled={!isIdle}
            onValueChange={([v]) => onUpdateParams({ initialPopulation: v })}
            className={!isIdle ? 'opacity-40' : ''} />
        </ParamRow>
      </section>

      {/* ── General ───────────────────────────────────── */}
      <section className="flex flex-col gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-nss-muted">General</p>
        <ParamRow label={`Generation Limit: ${params.generationLimit}`}>
          <Slider min={10} max={500} step={10} value={[params.generationLimit]}
            onValueChange={([v]) => onUpdateParams({ generationLimit: v })} />
        </ParamRow>
        <ParamRow label={`Tick Rate: ${params.tickRateMs} ms`}>
          <Slider min={100} max={2000} step={100} value={[params.tickRateMs]}
            onValueChange={([v]) => onUpdateParams({ tickRateMs: v })} />
        </ParamRow>
      </section>

      {/* ── Accordions ────────────────────────────────── */}
      <Accordion type="multiple" className="w-full">

        <AccordionItem value="death" className="border-nss-border">
          <AccordionTrigger className="py-2 text-xs font-semibold text-nss-text hover:text-nss-orange hover:no-underline">
            Death Distribution
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-3 pb-3 pt-1">
            <DistributionFields
              dist={params.deathDistribution}
              onChange={(d) => onUpdateParams({ deathDistribution: d })}
            />
            <ParamRow label={`Death Threshold: ${params.deathThreshold.toFixed(2)}`}>
              <Slider min={0} max={1} step={0.05} value={[params.deathThreshold]}
                onValueChange={([v]) => onUpdateParams({ deathThreshold: v })} />
            </ParamRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="colorRepro" className="border-nss-border">
          <AccordionTrigger className="py-2 text-xs font-semibold text-nss-text hover:text-nss-orange hover:no-underline">
            Color Reproduction Probabilities
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-3 pb-3 pt-1">
            <ParamRow label={`Orange Base Prob: ${params.orangeBaseReproProb.toFixed(2)}`}>
              <Slider min={0} max={1} step={0.05} value={[params.orangeBaseReproProb]}
                onValueChange={([v]) => onUpdateParams({ orangeBaseReproProb: v })} />
            </ParamRow>
            <ParamRow label={`Blue Base Prob: ${params.blueBaseReproProb.toFixed(2)}`}>
              <Slider min={0} max={1} step={0.05} value={[params.blueBaseReproProb]}
                onValueChange={([v]) => onUpdateParams({ blueBaseReproProb: v })} />
            </ParamRow>
            <ParamRow label={`Yellow Base Prob: ${params.yellowBaseReproProb.toFixed(2)}`}>
              <Slider min={0} max={1} step={0.05} value={[params.yellowBaseReproProb]}
                onValueChange={([v]) => onUpdateParams({ yellowBaseReproProb: v })} />
            </ParamRow>
            <ParamRow label={`Orange–Yellow Invasion Penalty Max: ${params.orangeYellowInvasionPenaltyMax.toFixed(2)}`}>
              <Slider min={0} max={1} step={0.01} value={[params.orangeYellowInvasionPenaltyMax]}
                onValueChange={([v]) => onUpdateParams({ orangeYellowInvasionPenaltyMax: v })} />
            </ParamRow>
            <ParamRow label={`Yellow–Orange Bonus Max: ${params.yellowOrangeBonusMax.toFixed(2)}`}>
              <Slider min={0} max={1} step={0.01} value={[params.yellowOrangeBonusMax]}
                onValueChange={([v]) => onUpdateParams({ yellowOrangeBonusMax: v })} />
            </ParamRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="neighborhood" className="border-nss-border">
          <AccordionTrigger className="py-2 text-xs font-semibold text-nss-text hover:text-nss-orange hover:no-underline">
            Neighborhood
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-3 pb-3 pt-1">
            <ParamRow label={`Radius: ${params.neighborhoodRadius} units`}>
              <Slider min={5} max={200} step={5} value={[params.neighborhoodRadius]}
                onValueChange={([v]) => onUpdateParams({ neighborhoodRadius: v })} />
            </ParamRow>
            <ParamRow label={`Offspring Spread: ${params.offspringSpread} units`}>
              <Slider min={5} max={300} step={5} value={[params.offspringSpread]}
                onValueChange={([v]) => onUpdateParams({ offspringSpread: v })} />
            </ParamRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="colorGuard" className="border-nss-border">
          <AccordionTrigger className="py-2 text-xs font-semibold text-nss-text hover:text-nss-orange hover:no-underline">
            Per-Color Extinction Guard
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-3 pb-3 pt-1">
            <p className="text-[10px] text-nss-muted">
              When a color drops below the threshold, its repro prob is floored to prevent extinction.
            </p>
            <ParamRow label={`Threshold Ratio: ${params.colorExtinctionThresholdRatio.toFixed(2)}`}>
              <Slider min={0} max={0.5} step={0.01} value={[params.colorExtinctionThresholdRatio]}
                onValueChange={([v]) => onUpdateParams({ colorExtinctionThresholdRatio: v })} />
            </ParamRow>
            <ParamRow label={`Repro Floor: ${params.colorExtinctionReproFloor.toFixed(2)}`}>
              <Slider min={0} max={1} step={0.05} value={[params.colorExtinctionReproFloor]}
                onValueChange={([v]) => onUpdateParams({ colorExtinctionReproFloor: v })} />
            </ParamRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="inheritance" className="border-nss-border">
          <AccordionTrigger className="py-2 text-xs font-semibold text-nss-text hover:text-nss-orange hover:no-underline">
            Trait Inheritance
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-3 pb-3 pt-1">
            <div className="flex items-center gap-2">
              <Switch
                id="discrete-mode"
                checked={params.discreteMode}
                onCheckedChange={(v) => onUpdateParams({ discreteMode: v })}
              />
              <Label htmlFor="discrete-mode" className="cursor-pointer text-xs text-nss-text">
                Discrete mode (offspring inherits pure dominant color)
              </Label>
            </div>
            {!params.discreteMode && (
              <ParamRow label={`Mutation Std Dev: ${params.mutationStddev.toFixed(2)}`}>
                <Slider min={0.01} max={0.5} step={0.01} value={[params.mutationStddev]}
                  onValueChange={([v]) => onUpdateParams({ mutationStddev: v })} />
              </ParamRow>
            )}
          </AccordionContent>
        </AccordionItem>

        {sexualSelectionEnabled && (
          <AccordionItem value="sexualSelection" className="border-nss-border">
            <AccordionTrigger className="py-2 text-xs font-semibold text-nss-text hover:text-nss-orange hover:no-underline">
              Level 3: Sexual Selection Bonus
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-3 pb-3 pt-1">
              <p className="text-[10px] text-nss-muted">
                Bonus = sample(distribution) × (1 − frequency). Rarer colors get a larger bonus.
              </p>
              <DistributionFields
                dist={{ type: 'normal', params: { mean: 0.3, stddev: 0.1 } }}
                onChange={() => {/* bonus distribution is set at addon construction; shown for reference */}}
              />
            </AccordionContent>
          </AccordionItem>
        )}

      </Accordion>

      {/* ── Population guard indicators (P-M1) ──────── */}
      <div className="mt-auto flex flex-wrap gap-2 border-t border-nss-border pt-2">
        <Badge
          variant="outline"
          className={`text-[10px] transition-colors ${
            maxPopReached
              ? 'border-nss-yellow bg-nss-yellow/20 text-nss-yellow'
              : 'border-nss-border text-nss-muted opacity-50'
          }`}
        >
          Max pop reached
        </Badge>
        <Badge
          variant="outline"
          className={`text-[10px] transition-colors ${
            extinctionGuardActive
              ? 'border-red-500 bg-red-500/20 text-red-400'
              : 'border-nss-border text-nss-muted opacity-50'
          }`}
        >
          Extinction guard active
        </Badge>
        {(['orange', 'blue', 'yellow'] as const).map((c) => (
          <Badge
            key={c}
            variant="outline"
            className={`text-[10px] transition-colors ${
              colorGuard[c]
                ? c === 'orange'
                  ? 'border-nss-orange bg-nss-orange/20 text-nss-orange'
                  : c === 'blue'
                  ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                  : 'border-nss-yellow bg-nss-yellow/20 text-nss-yellow'
                : 'border-nss-border text-nss-muted opacity-50'
            }`}
          >
            {c} guard
          </Badge>
        ))}
      </div>
      </div>{/* end scrollable params */}
    </div>
  )
}
