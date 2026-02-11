/**
 * Monthly Bar Chart
 *
 * Stacked bar chart showing monthly spending per category with a cumulative line.
 */

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useTranslation } from 'react-i18next'
import type { MonthlySpending } from '../../types'
import { formatPrice } from '../../utils/price'

interface Props {
  data: MonthlySpending[]
  currency?: string
}

export default function MonthlyBarChart({ data, currency = 'EUR' }: Props) {
  const { t } = useTranslation('finances')

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        {t('noData')}
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value: number, name: string) => [
            formatPrice(value, currency),
            name,
          ]}
        />
        <Legend />
        <Bar
          dataKey="equipment"
          name={t('categories.equipment')}
          stackId="a"
          fill="#3b82f6"
        />
        <Bar
          dataKey="consumables"
          name={t('categories.consumables')}
          stackId="a"
          fill="#10b981"
        />
        <Bar
          dataKey="livestock"
          name={t('categories.livestock')}
          stackId="a"
          fill="#f59e0b"
        />
        <Bar
          dataKey="icp_tests"
          name={t('categories.icp_tests')}
          stackId="a"
          fill="#8b5cf6"
        />
        <Line
          type="monotone"
          dataKey="cumulative"
          name={t('cumulative')}
          stroke="#ef4444"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
