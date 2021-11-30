import { FeatureSwitch } from '../../types/databaseTypes'
import { getClient, q } from 'lib/faunaDb'

/**
 * Returns the feature switch
 */
export async function fetchFeatureSwitch(
  feature: string
): Promise<FeatureSwitch> {
  try {
    const featureSwitchRef = q.Match(
      q.Index('feature_switch_by_feature'),
      feature
    )
    const featureSwitch: any = await getClient().query(
      q.If(q.Exists(featureSwitchRef), q.Get(featureSwitchRef), null)
    )

    if (!featureSwitch) {
      return null
    }
    return { ...featureSwitch.data }
  } catch (error) {
    console.error(error)
  }
}
