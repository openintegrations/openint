import type {Meta, StoryFn} from '@storybook/react'
import React, {ReactElement} from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from './chart'

// Define a wrapper component to use in stories
const ChartWrapper = ({
  children,
  config,
  className,
}: {
  children: ReactElement
  config: ChartConfig
  className?: string
}) => (
  <ChartContainer config={config} className={className}>
    {children}
  </ChartContainer>
)

const meta = {
  title: 'Shadcn/Chart',
  component: ChartWrapper,
} as Meta<typeof ChartWrapper>

export default meta

// Sample data for charts
const lineData = [
  {name: 'Jan', value: 400, value2: 240},
  {name: 'Feb', value: 300, value2: 139},
  {name: 'Mar', value: 200, value2: 980},
  {name: 'Apr', value: 278, value2: 390},
  {name: 'May', value: 189, value2: 480},
  {name: 'Jun', value: 239, value2: 380},
  {name: 'Jul', value: 349, value2: 430},
]

const barData = [
  {name: 'Q1', value: 12000, value2: 8000},
  {name: 'Q2', value: 19000, value2: 11000},
  {name: 'Q3', value: 9000, value2: 7000},
  {name: 'Q4', value: 22000, value2: 15000},
]

const pieData = [
  {name: 'Group A', value: 400},
  {name: 'Group B', value: 300},
  {name: 'Group C', value: 300},
  {name: 'Group D', value: 200},
]

// Basic Line Chart
export const LineChartExample: StoryFn = () => {
  const config = {
    value: {
      label: 'Revenue',
      theme: {
        light: '#0ea5e9',
        dark: '#0ea5e9',
      },
    },
    value2: {
      label: 'Profit',
      theme: {
        light: '#10b981',
        dark: '#10b981',
      },
    },
  }

  return (
    <ChartWrapper className="w-full max-w-lg" config={config}>
      <LineChart
        data={lineData}
        margin={{top: 5, right: 10, left: 10, bottom: 5}}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <ChartTooltip
          content={
            <ChartTooltipContent
              indicator="dot"
              labelFormatter={(value) => `${value}`}
            />
          }
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--color-value)"
          strokeWidth={2}
          activeDot={{r: 6}}
        />
        <Line
          type="monotone"
          dataKey="value2"
          stroke="var(--color-value2)"
          strokeWidth={2}
        />
        <ChartLegend content={<ChartLegendContent verticalAlign="bottom" />} />
      </LineChart>
    </ChartWrapper>
  )
}

// Area Chart
export const AreaChartExample: StoryFn = () => {
  const config = {
    value: {
      label: 'Users',
      theme: {
        light: '#8b5cf6',
        dark: '#8b5cf6',
      },
    },
  }

  return (
    <ChartWrapper className="w-full max-w-lg" config={config}>
      <AreaChart
        data={lineData}
        margin={{top: 5, right: 10, left: 10, bottom: 5}}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <ChartTooltip
          content={
            <ChartTooltipContent
              indicator="dot"
              labelFormatter={(value) => `${value}`}
            />
          }
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--color-value)"
          fill="var(--color-value)"
          fillOpacity={0.2}
        />
        <ChartLegend content={<ChartLegendContent verticalAlign="bottom" />} />
      </AreaChart>
    </ChartWrapper>
  )
}

// Bar Chart
export const BarChartExample: StoryFn = () => {
  const config = {
    value: {
      label: 'Revenue',
      theme: {
        light: '#f97316',
        dark: '#f97316',
      },
    },
    value2: {
      label: 'Expenses',
      theme: {
        light: '#06b6d4',
        dark: '#06b6d4',
      },
    },
  }

  return (
    <ChartWrapper className="w-full max-w-lg" config={config}>
      <BarChart
        data={barData}
        margin={{top: 5, right: 10, left: 10, bottom: 5}}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <ChartTooltip
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={(value) => `${value}`}
            />
          }
        />
        <Bar dataKey="value" fill="var(--color-value)" />
        <Bar dataKey="value2" fill="var(--color-value2)" />
        <ChartLegend content={<ChartLegendContent verticalAlign="bottom" />} />
      </BarChart>
    </ChartWrapper>
  )
}

// Pie Chart
export const PieChartExample: StoryFn = () => {
  const config = {
    'Group A': {
      label: 'Group A',
      theme: {
        light: '#ec4899',
        dark: '#ec4899',
      },
    },
    'Group B': {
      label: 'Group B',
      theme: {
        light: '#14b8a6',
        dark: '#14b8a6',
      },
    },
    'Group C': {
      label: 'Group C',
      theme: {
        light: '#f59e0b',
        dark: '#f59e0b',
      },
    },
    'Group D': {
      label: 'Group D',
      theme: {
        light: '#6366f1',
        dark: '#6366f1',
      },
    },
  }

  return (
    <ChartWrapper className="w-full max-w-lg" config={config}>
      <PieChart margin={{top: 5, right: 5, left: 5, bottom: 5}}>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name">
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={`var(--color-${entry.name})`} />
          ))}
        </Pie>
        <ChartTooltip
          content={
            <ChartTooltipContent
              indicator="dot"
              labelFormatter={(value) => `${value}`}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent verticalAlign="bottom" />} />
      </PieChart>
    </ChartWrapper>
  )
}

// Multi-series Line Chart with Custom Tooltip
export const CustomTooltipExample: StoryFn = () => {
  const config = {
    value: {
      label: 'Sales',
      theme: {
        light: '#0ea5e9',
        dark: '#0ea5e9',
      },
    },
    value2: {
      label: 'Conversions',
      theme: {
        light: '#10b981',
        dark: '#10b981',
      },
    },
  }

  return (
    <ChartWrapper className="w-full max-w-lg" config={config}>
      <LineChart
        data={lineData}
        margin={{top: 5, right: 10, left: 10, bottom: 5}}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <ChartTooltip
          content={
            <ChartTooltipContent
              indicator="dashed"
              labelFormatter={(value) => `Month: ${value}`}
              formatter={(value, name, item) => (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">
                    {name === 'value' ? 'Sales' : 'Conversions'}
                  </span>
                  <span className="font-medium">${value.toLocaleString()}</span>
                </div>
              )}
            />
          }
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--color-value)"
          strokeWidth={2}
          activeDot={{r: 6}}
        />
        <Line
          type="monotone"
          dataKey="value2"
          stroke="var(--color-value2)"
          strokeWidth={2}
        />
        <ChartLegend content={<ChartLegendContent verticalAlign="bottom" />} />
      </LineChart>
    </ChartWrapper>
  )
}

// Responsive Chart
export const ResponsiveChartExample: StoryFn = () => {
  const config = {
    value: {
      label: 'Revenue',
      theme: {
        light: '#0ea5e9',
        dark: '#0ea5e9',
      },
    },
    value2: {
      label: 'Profit',
      theme: {
        light: '#10b981',
        dark: '#10b981',
      },
    },
  }

  return (
    <div className="w-full max-w-4xl">
      <h3 className="mb-4 text-lg font-medium">Responsive Chart Example</h3>
      <p className="text-muted-foreground mb-6 text-sm">
        This chart will resize based on the container width.
      </p>
      <ChartWrapper className="w-full" config={config}>
        <LineChart
          data={lineData}
          margin={{top: 5, right: 10, left: 10, bottom: 5}}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <ChartTooltip
            content={
              <ChartTooltipContent
                indicator="dot"
                labelFormatter={(value) => `${value}`}
              />
            }
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--color-value)"
            strokeWidth={2}
            activeDot={{r: 6}}
          />
          <Line
            type="monotone"
            dataKey="value2"
            stroke="var(--color-value2)"
            strokeWidth={2}
          />
          <ChartLegend
            content={<ChartLegendContent verticalAlign="bottom" />}
          />
        </LineChart>
      </ChartWrapper>
    </div>
  )
}
