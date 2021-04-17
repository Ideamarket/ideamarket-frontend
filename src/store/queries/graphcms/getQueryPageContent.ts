import { gql } from 'graphql-request'

export default function getQueryPageContent(pageTitle: string): string {
  return gql`
    {
      contents(where: { page: ${pageTitle} }) {
        key
        value {
          html
        }
      }
    }
  `
}
