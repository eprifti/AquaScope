/**
 * Spending Pie Chart
 *
 * Donut chart showing spending breakdown by category (equipment, consumables, livestock, ICP tests).
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { useTranslation } from 'react-i18next'
import type { CategorySpending } from '../../types'
import { formatPrice } from '../../utils/price'

const COLORS: Record<string, string> = {
  equipment: '#3b82f6',    // blue
  consumables: '#10b981',  // green
  livestock: '#f59e0b',    // amber
  icp_tests: '#8b5cf6',   // purple
}

interface Props {
  data: CategorySpending[]
  currency?: string
}

export default function SpendingPieChart({ data, currency = 'EUR' }: Props) {
  const { t } = useTranslation('finances')

  const chartData = data
    .filter((d) => d.total > 0)
    .map((d) => ({
      name: t(`categories.${d.category}`, d.category),
      value: d.total,
      color: COLORS[d.category] || '#94a3b8',
    }))

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        {t('noData')}
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => formatPrice(value, currency)}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
