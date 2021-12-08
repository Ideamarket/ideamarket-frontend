import { fetchFeatureSwitch } from 'lib/models/featureSwitchModel'
import { FeatureSwitch } from 'types/databaseTypes'
import { isServerSide } from 'utils'

export async function getFeatureSwitch(value: string): Promise<FeatureSwitch> {
  return isServerSide()
    ? await getFeatureSwitchFromServer(value)
    : await getFeatureSwitchFromClient(value)
}

async function getFeatureSwitchFromServer(
  value: string
): Promise<FeatureSwitch> {
  const featureSwitch = await fetchFeatureSwitch(value)
  if (!featureSwitch) {
    return {
      feature: value,
      enabled: true,
    }
  }
  return featureSwitch
}

async function getFeatureSwitchFromClient(
  value: string
): Promise<FeatureSwitch> {
  const response = await fetch(`/api/fs?value=${value}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const data: FeatureSwitch = await response.json()
  return data
}
