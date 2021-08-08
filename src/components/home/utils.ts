import { DropdownFilters } from 'components/tokens/OverviewFilters'
import defaultColumns from './defaultColumns'

export const getVisibleColumns = (selectedColumns: any) =>
  defaultColumns.filter((h) => !h.isOptional || selectedColumns.has(h.name))

export const startingOptionalColumns = defaultColumns
  .filter(
    (c) =>
      c.isSelectedAtStart && DropdownFilters.COLUMNS.values.includes(c.name)
  )
  .map((c) => c.name)
