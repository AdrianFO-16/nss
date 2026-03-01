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
import { PlayerState } from '@/simulation/core/PlayerState'
import type { Level1SimulationParams } from '@/simulation/levels/level1/Level1SimulationParams'
import type { MetricSnapshot } from '@/ui/adapters/UISimulationAdapter'
import type { Distribution, DistributionType } from '@/simulation/stats/Distribution'

interface Level1ParamsPanelProps {
  params: Level1SimulationParams
  playerState: PlayerState
  metrics?: MetricSnapshot
  onUpdateParams: (partial: Partial<Level1SimulationParams>) => void
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
  bodySizeScale,
  onChange,
}: {
  dist: Distribution
  bodySizeScale?: boolean
  onChange: (d: Distribution) => void
}) {
  const isNormal = dist.type === 'normal'
  const maxMean = bodySizeScale ? 20 : 1
  const maxStd = bodySizeScale ? 5 : 0.5
  const stepMean = bodySizeScale ? 0.5 : 0.05

  return (
    <>
      <ParamRow label="Distribution type">
        <Select
          value={dist.type}
          onValueChange={(val) =>
            onChange({ type: val as DistributionType, params: {} })
          }
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
            <Slider
              min={bodySizeScale ? 0.5 : 0}
              max={maxMean}
              step={stepMean}
              value={[dist.params.mean ?? 0]}
              onValueChange={([v]) =>
                onChange({ ...dist, params: { ...dist.params, mean: v } })
              }
            />
          </ParamRow>
          <ParamRow label={`Std Dev: ${(dist.params.stddev ?? 0.1).toFixed(2)}`}>
            <Slider
              min={0.01}
              max={maxStd}
              step={0.01}
              value={[dist.params.stddev ?? 0.1]}
              onValueChange={([v]) =>
                onChange({ ...dist, params: { ...dist.params, stddev: v } })
              }
            />
          </ParamRow>
        </>
      ) : (
        <ParamRow label={`Lambda: ${(dist.params.lambda ?? 1).toFixed(2)}`}>
          <Slider
            min={0.1}
            max={5}
            step={0.1}
            value={[dist.params.lambda ?? 1]}
            onValueChange={([v]) =>
              onChange({ ...dist, params: { ...dist.params, lambda: v } })
            }
          />
        </ParamRow>
      )}
    </>
  )
}

export function Level1ParamsPanel({
  params,
  playerState,
  metrics,
  onUpdateParams,
}: Level1ParamsPanelProps) {
  const isIdle = playerState === PlayerState.IDLE
  const maxPopReached = metrics?.maxPopReached ?? false
  const extinctionGuardActive = metrics?.extinctionGuardActive ?? false

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1 text-nss-text">

      {/* ── Locked-after-start ─────────────────────── */}
      <section className="flex flex-col gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-nss-muted">
          Setup {!isIdle && <span className="ml-1 text-nss-yellow">(locked)</span>}
        </p>
        <ParamRow label={`Initial Population: ${params.initialPopulation}`}>
          <Slider
            min={10}
            max={500}
            step={10}
            value={[params.initialPopulation]}
            disabled={!isIdle}
            onValueChange={([v]) => onUpdateParams({ initialPopulation: v })}
            className={!isIdle ? 'opacity-40' : ''}
          />
        </ParamRow>
      </section>

      {/* ── General ────────────────────────────────── */}
      <section className="flex flex-col gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-nss-muted">General</p>
        <ParamRow label={`Generation Limit: ${params.generationLimit}`}>
          <Slider
            min={10}
            max={500}
            step={10}
            value={[params.generationLimit]}
            onValueChange={([v]) => onUpdateParams({ generationLimit: v })}
          />
        </ParamRow>
        <ParamRow label={`Tick Rate: ${params.tickRateMs} ms`}>
          <Slider
            min={100}
            max={2000}
            step={100}
            value={[params.tickRateMs]}
            onValueChange={([v]) => onUpdateParams({ tickRateMs: v })}
          />
        </ParamRow>
      </section>

      {/* ── Distribution accordions ─────────────────── */}
      <Accordion type="multiple" className="w-full">

        <AccordionItem value="bodySize" className="border-nss-border">
          <AccordionTrigger className="py-2 text-xs font-semibold text-nss-text hover:text-nss-orange hover:no-underline">
            Body Size Distribution
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-3 pb-3 pt-1">
            <DistributionFields
              dist={params.bodySizeDistribution}
              bodySizeScale
              onChange={(d) => onUpdateParams({ bodySizeDistribution: d })}
            />
          </AccordionContent>
        </AccordionItem>

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
              <Slider
                min={0}
                max={1}
                step={0.05}
                value={[params.deathThreshold]}
                onValueChange={([v]) => onUpdateParams({ deathThreshold: v })}
              />
            </ParamRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="reproduction" className="border-b-0">
          <AccordionTrigger className="py-2 text-xs font-semibold text-nss-text hover:text-nss-orange hover:no-underline">
            Reproduction Distribution
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-3 pb-3 pt-1">
            <DistributionFields
              dist={params.reproductionDistribution}
              onChange={(d) => onUpdateParams({ reproductionDistribution: d })}
            />
            <ParamRow label={`Mutation Std Dev: ${params.mutationStddev.toFixed(2)}`}>
              <Slider
                min={0.01}
                max={1}
                step={0.01}
                value={[params.mutationStddev]}
                onValueChange={([v]) => onUpdateParams({ mutationStddev: v })}
              />
            </ParamRow>
          </AccordionContent>
        </AccordionItem>

      </Accordion>

      {/* ── Population guard indicators (P-M1) ─────── */}
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
      </div>
    </div>
  )
}
