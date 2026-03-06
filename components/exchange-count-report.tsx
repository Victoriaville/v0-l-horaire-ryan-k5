'use client'

import { useState, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { FirefighterExchangeCount } from '@/app/actions/exchange-count-report'

interface ExchangeCountReportProps {
  firefighters: FirefighterExchangeCount[]
  years: number[]
}

type SortField = 'name' | 'year'

export function ExchangeCountReport({ firefighters, years }: ExchangeCountReportProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortYear, setSortYear] = useState<number | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const sortedAndFiltered = useMemo(() => {
    let filtered = firefighters.filter((ff) =>
      `${ff.last_name} ${ff.first_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Sort by name
    if (sortField === 'name') {
      filtered.sort((a, b) => {
        const nameA = `${a.last_name} ${a.first_name}`
        const nameB = `${b.last_name} ${b.first_name}`
        const comparison = nameA.localeCompare(nameB)
        return sortDirection === 'asc' ? comparison : -comparison
      })
    }
    // Sort by selected year
    else if (sortField === 'year' && sortYear !== null) {
      filtered.sort((a, b) => {
        const countA = a.years[sortYear] || 0
        const countB = b.years[sortYear] || 0
        const comparison = countA - countB
        return sortDirection === 'asc' ? comparison : -comparison
      })
    }

    return filtered
  }, [firefighters, searchTerm, sortField, sortYear, sortDirection])

  const handleNameSort = () => {
    if (sortField === 'name') {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField('name')
      setSortDirection('asc')
    }
  }

  const handleYearSort = (year: number) => {
    if (sortField === 'year' && sortYear === year) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField('year')
      setSortYear(year)
      setSortDirection('desc')
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Input
          placeholder="Filtrer par nom..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rapport des échanges par pompier</CardTitle>
          <CardDescription>
            {sortedAndFiltered.length} pompier{sortedAndFiltered.length !== 1 ? 's' : ''} trouvé{sortedAndFiltered.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48">
                  <Button
                    variant="ghost"
                    onClick={handleNameSort}
                    className="p-0 h-auto font-semibold hover:bg-transparent"
                  >
                    Nom
                    {sortField === 'name' && (
                      <span className="ml-2">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </Button>
                </TableHead>
                {years.map((year) => (
                  <TableHead key={year} className="text-center min-w-24">
                    <Button
                      variant="ghost"
                      onClick={() => handleYearSort(year)}
                      className="p-0 h-auto font-semibold hover:bg-transparent"
                    >
                      {year}
                      {sortField === 'year' && sortYear === year && (
                        <span className="ml-2">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </Button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFiltered.map((firefighter) => (
                <TableRow key={firefighter.id}>
                  <TableCell className="font-medium">
                    {firefighter.last_name} {firefighter.first_name}
                  </TableCell>
                  {years.map((year) => (
                    <TableCell key={year} className="text-center">
                      {firefighter.years[year] || 0}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
