import { useNavigate, useParams } from "react-router-dom";
import { useGetMachine } from "../services/useGetMachine";
import { useEffect, useState } from "react";

const MachineDetails = () => {
    const { serial } = useParams();
    const navigate = useNavigate();
    if (!serial) navigate("/machines");

    const [selectedMachine, setSelectedMachine] = useState<any | null>(null);
    // @ts-ignore
    const { data, isLoading, isError } = useGetMachine(serial);

    useEffect(() => {
        if (isLoading || isError) return;
        if (!data || data.length === 0) return;
        setSelectedMachine(data[0]);
    }, [data, isLoading, isError]);

    return (
        <div className="w-full h-screen p-4 flex gap-4">
            {/* History Sidebar */}
            <div className="w-1/3 h-full flex flex-col gap-4">
                <h1 className="text-xl text-center font-bold">
                    History for: {serial}
                </h1>
                {data &&
                    data.map((hist: any, index: number) => (
                        <button
                            key={index}
                            onClick={() => setSelectedMachine(hist)}
                            className={`w-full p-4 border rounded-xl cursor-pointer ${
                                selectedMachine?.id === hist.id
                                    ? "bg-gray-200"
                                    : ""
                            }`}
                        >
                            {hist.lastSent}
                        </button>
                    ))}
            </div>

            {/* Machine Details */}
            <div className="w-2/3 h-full px-4 border-l overflow-y-auto">
                {!selectedMachine ? (
                    <div className="h-full flex justify-center items-center font-bold text-2xl">
                        Select an item to view
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 text-lg font-semibold border-b pb-2">
                            General Information
                        </div>
                        <Detail label="Serial" value={selectedMachine.serial} />
                        <Detail
                            label="IP Address"
                            value={selectedMachine.ipAddress}
                        />
                        <Detail
                            label="MAC Address"
                            value={selectedMachine.macAddress}
                        />
                        <Detail
                            label="Logged User"
                            value={selectedMachine.loggedInUser}
                        />
                        <Detail
                            label="Logged Date"
                            value={selectedMachine.loggedDate}
                        />
                        <Detail
                            label="Logged Time"
                            value={selectedMachine.loggedTime}
                        />
                        <Detail
                            label="Last Sent"
                            value={selectedMachine.lastSent}
                        />
                        <Detail
                            label="Timestamp"
                            value={selectedMachine.timestamp}
                        />

                        <div className="col-span-2 text-lg font-semibold border-b pb-2">
                            OS Information
                        </div>
                        {Object.entries(selectedMachine.os).map(
                            ([key, value]) => (
                                <Detail key={key} label={key} value={value} />
                            )
                        )}

                        <div className="col-span-2 text-lg font-semibold border-b pb-2">
                            CPU Information
                        </div>
                        {Object.entries(selectedMachine.cpu).map(
                            ([key, value]) => (
                                <Detail key={key} label={key} value={value} />
                            )
                        )}

                        <div className="col-span-2 text-lg font-semibold border-b pb-2">
                            Storage Devices
                        </div>
                        {selectedMachine.disks.map(
                            (disk: any, index: number) => (
                                <div
                                    key={index}
                                    className="col-span-2 border p-2 rounded-md"
                                >
                                    {Object.entries(disk).map(
                                        ([key, value]) => (
                                            <Detail
                                                key={key}
                                                label={key}
                                                value={value}
                                            />
                                        )
                                    )}
                                </div>
                            )
                        )}

                        <div className="col-span-2 text-lg font-semibold border-b pb-2">
                            RAM Details
                        </div>
                        {selectedMachine.rams.map((ram: any, index: number) => (
                            <div
                                key={index}
                                className="col-span-2 border p-2 rounded-md"
                            >
                                {Object.entries(ram).map(([key, value]) => (
                                    <Detail
                                        key={key}
                                        label={key}
                                        value={value}
                                    />
                                ))}
                            </div>
                        ))}

                        <div className="col-span-2 text-lg font-semibold border-b pb-2">
                            GPU Details
                        </div>
                        {selectedMachine.gpu.map((gpu: any, index: number) => (
                            <div
                                key={index}
                                className="col-span-2 border p-2 rounded-md"
                            >
                                {Object.entries(gpu).map(([key, value]) => (
                                    <Detail
                                        key={key}
                                        label={key}
                                        value={value}
                                    />
                                ))}
                            </div>
                        ))}

                        <div className="col-span-2 text-lg font-semibold border-b pb-2">
                            Monitor Details
                        </div>
                        {selectedMachine.monitors.map(
                            (monitor: any, index: number) => (
                                <Detail
                                    key={index}
                                    label={`Monitor ${index + 1}`}
                                    value={monitor.connection}
                                />
                            )
                        )}

                        <div className="col-span-2 text-lg font-semibold border-b pb-2">
                            Battery Details
                        </div>
                        {Object.entries(selectedMachine.battery).map(
                            ([key, value]) => (
                                <Detail key={key} label={key} value={value} />
                            )
                        )}

                        <div className="col-span-2 text-lg font-semibold border-b pb-2">
                            System Information
                        </div>
                        {Object.entries(selectedMachine.systemInfo).map(
                            ([key, value]) => (
                                <Detail key={key} label={key} value={value} />
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const Detail = ({ label, value }: { label: string; value: any }) => (
    <div className="border p-2 rounded-md">
        <span className="font-semibold">{label}: </span>
        <span>{value}</span>
    </div>
);

export default MachineDetails;
