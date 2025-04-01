import OSChart from "../components/OSChart";
import RAMChart from "../components/RAMChart";
import StorageChart from "../components/StorageChart";
import { useGetInactiveMachines } from "../services/useGetInactive";
import { useGetTotalMachines } from "../services/useGetTotal";

const Dashboard = () => {
    const {
        data: totalMachines,
        isLoading: totalMachinesLoading,
        isError: totalMachinesError,
    } = useGetTotalMachines();
    const {
        data: inactive,
        isLoading: inactiveLoading,
        isError: inactiveError,
    } = useGetInactiveMachines();
    return (
        <div className="w-full h-screen p-4 flex flex-col gap-8 pb-16">
            <div className="grid grid-cols-4 gap-4">
                <div className="border bg-gray-50 rounded-2xl min-h-28 p-3 flex flex-col gap-2 items-center justify-center">
                    <h1 className="font-bold text-xl">Total Machines</h1>
                    <h1 className="font-bold text-2xl">
                        {totalMachinesLoading && "Loading"}
                        {totalMachinesError && "Error"}
                        {totalMachines && totalMachines.total}
                    </h1>
                </div>
                <div className="border bg-gray-50 rounded-2xl min-h-28 p-3 flex flex-col gap-2 items-center justify-center">
                    <h1 className="font-bold text-xl">Inactive Machines</h1>
                    <h1 className="font-bold text-2xl">
                        {inactiveLoading && "Loading"}
                        {inactiveError && "Error"}
                        {inactive && inactive.inactiveCount}
                    </h1>
                </div>
                <div className="border bg-gray-50 rounded-2xl min-h-28 p-3 flex flex-col gap-2 items-center justify-center">
                    <h1 className="font-bold text-xl">Total Machines</h1>
                    <h1 className="font-bold text-2xl">
                        {totalMachinesLoading && "Loading"}
                        {totalMachinesError && "Error"}
                        {totalMachines && totalMachines.total}
                    </h1>
                </div>
                <div className="border bg-gray-50 rounded-2xl min-h-28 p-3 flex flex-col gap-2 items-center justify-center">
                    <h1 className="font-bold text-xl">Inactive Machines</h1>
                    <h1 className="font-bold text-2xl">
                        {inactiveLoading && "Loading"}
                        {inactiveError && "Error"}
                        {inactive && inactive.inactiveCount}
                    </h1>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <RAMChart />
                <OSChart />
                <StorageChart />
            </div>
        </div>
    );
};

export default Dashboard;
