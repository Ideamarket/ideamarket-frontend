import { gql } from 'graphql-request'

export default function getQueryHeroTitle(): string {
  return gql`
    {
      contents(where: { key: "hero-title" }) {
        key
        value {
          html
        }
      }
    }
  `
}
