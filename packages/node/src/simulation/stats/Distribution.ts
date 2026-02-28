export type DistributionType = 'normal' | 'exponential'

export interface DistributionParams {
  mean?: number
  stddev?: number
  lambda?: number
}

export interface Distribution {
  type: DistributionType
  params: DistributionParams
}
