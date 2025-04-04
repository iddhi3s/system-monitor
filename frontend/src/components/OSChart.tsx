import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { useGetOsDist } from "../services/useGetOSDist";

const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#AF19FF",
    "#FF3C38",
    "#FF8C00",
    "#4CAF50",
    "#1E90FF",
    "#C71585",
];

export default function OSChart() {
    const { data, isLoading, isError } = useGetOsDist();
    return (
        <>
            {isLoading && <div>Loading...</div>}
            {isError && <div>Error loading data</div>}
            {!isLoading && !isError && data && (
                <ResponsiveContainer className="w-full">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="count"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            label={({ count }) => count} //`${name} (${count})`
                        >
                            {/* @ts-ignore */}
                            {data.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </>
    );
}
