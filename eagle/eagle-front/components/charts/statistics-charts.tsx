"use client";

import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    AreaChart,
    Area,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

type ChartData = Record<string, unknown>[];

interface BarChartProps {
    data: ChartData;
    dataKeys: { key: string; fill: string; name: string }[];
    xAxisKey: string;
}

export function CustomBarChart({ data, dataKeys, xAxisKey }: BarChartProps) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xAxisKey} />
                <YAxis />
                <Tooltip />
                <Legend />
                {dataKeys.map((dk) => (
                    <Bar key={dk.key} dataKey={dk.key} fill={dk.fill} name={dk.name} />
                ))}
            </BarChart>
        </ResponsiveContainer>
    );
}

interface ColoredBarChartProps {
    data: ChartData;
    dataKey: string;
    xAxisKey: string;
    name: string;
    colors?: string[];
}

export function ColoredBarChart({ data, dataKey, xAxisKey, name, colors }: ColoredBarChartProps) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xAxisKey} />
                <YAxis />
                <Tooltip />
                <Bar dataKey={dataKey} name={name}>
                    {data.map((entry, index) => (
                        <Cell 
                            key={`cell-${index}`} 
                            fill={colors ? colors[index % colors.length] : (entry as { color?: string }).color || "#3b82f6"} 
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

interface SimplePieChartProps {
    data: { name: string; value: number; color: string }[];
}

export function SimplePieChart({ data }: SimplePieChartProps) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip />
            </PieChart>
        </ResponsiveContainer>
    );
}

interface AreaChartProps {
    data: ChartData;
    areas: { key: string; stroke: string; fill: string; name: string; stackId?: string }[];
    xAxisKey: string;
}

export function CustomAreaChart({ data, areas, xAxisKey }: AreaChartProps) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xAxisKey} />
                <YAxis />
                <Tooltip />
                <Legend />
                {areas.map((area) => (
                    <Area
                        key={area.key}
                        type="monotone"
                        dataKey={area.key}
                        stackId={area.stackId}
                        stroke={area.stroke}
                        fill={area.fill}
                        name={area.name}
                    />
                ))}
            </AreaChart>
        </ResponsiveContainer>
    );
}

interface LineChartProps {
    data: ChartData;
    lines: { key: string; stroke: string; name: string }[];
    xAxisKey: string;
}

export function CustomLineChart({ data, lines, xAxisKey }: LineChartProps) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xAxisKey} />
                <YAxis />
                <Tooltip />
                <Legend />
                {lines.map((line) => (
                    <Line
                        key={line.key}
                        type="monotone"
                        dataKey={line.key}
                        stroke={line.stroke}
                        strokeWidth={3}
                        name={line.name}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
}


