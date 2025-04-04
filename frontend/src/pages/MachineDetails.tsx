import { useNavigate, useParams } from "react-router-dom";
import { useGetMachine } from "../services/useGetMachine";
import { useEffect, useState } from "react";

const MachineDetails = () => {
    const { serial } = useParams();
    const navigate = useNavigate();
    if (!serial) navigate("/machines");

    // @ts-ignore
    const { data, isLoading, isError } = useGetMachine(serial);
    console.log(data);
    return (
        <div className="w-full h-screen p-4 flex gap-4">
            {/* Machine Details */}
            <div className="w-full h-full px-4 border-l overflow-y-auto">
                <h1 className="text-2xl font-semibold mb-4">Machine Details</h1>
                {isLoading && <p>Loading...</p>}
                {isError && <p>Error loading machine details</p>}
                {data && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 text-lg font-semibold border-b pb-2">
                            General Information
                        </div>
                        <Detail label="Serial" value={data?.SerialNo} />
                        <Detail label="IP Address" value={data?.IPAddress} />
                        <Detail label="MAC Address" value={data?.MACAddress} />
                        <Detail label="Logged User" value={data?.LoggedUser} />
                        <Detail
                            label="Booted DateTime"
                            value={new Date(
                                data?.BootDateTime
                            ).toLocaleString()}
                        />
                        <Detail label="Last Sent" value={data?.lastSent} />

                        <div className="col-span-2 text-lg font-semibold border-b pb-2">
                            System Information
                        </div>
                        <Detail
                            label="Manufacture"
                            value={data?.Manufacturer}
                        />
                        <Detail label="Model" value={data?.Model} />
                        <Detail label="SKU" value={data?.SKU} />
                        <Detail
                            label="Manufacture Date"
                            value={data?.ManufactureDate}
                        />

                        <div className="col-span-2 text-lg font-semibold border-b pb-2">
                            OS Information
                        </div>
                        <Detail label="Version" value={data?.OSVersion} />
                        <Detail label="Serial" value={data?.OSSerial} />
                        <Detail label="Release" value={data?.OSRelease} />
                        <Detail label="Arch" value={data?.OSArch} />
                        <div className="col-span-2 text-lg font-semibold border-b pb-2">
                            CPU Information
                        </div>
                        <Detail label="Brand" value={data?.CPUBrand} />
                        <Detail label="Max Speed" value={data?.CPUSpeed} />
                        <Detail
                            label="Physical Cores"
                            value={data?.CPUPhysicalCores}
                        />
                        <Detail
                            label="Logical Cores"
                            value={data?.CPULogicalCores}
                        />

                        <div className="col-span-2 text-lg font-semibold border-b pb-2">
                            Storage Devices
                        </div>

                        {data?.StorageDevices.length === 0 && (
                            <p className="col-span-2 text-center">
                                No storage devices found
                            </p>
                        )}
                        {data?.StorageDevices.map(
                            (disk: any, index: number) => (
                                <div
                                    key={index}
                                    className="border p-2 rounded-md"
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
                        {data?.RamDetails.length === 0 && (
                            <p className="col-span-2 text-center">
                                No storage devices found
                            </p>
                        )}
                        {data?.RamDetails.map((disk: any, index: number) => (
                            <div key={index} className="border p-2 rounded-md">
                                {Object.entries(disk).map(([key, value]) => (
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
                        {data?.GpuDevices.length === 0 && (
                            <p className="col-span-2 text-center">
                                No storage devices found
                            </p>
                        )}
                        {data?.GpuDevices.map((disk: any, index: number) => (
                            <div key={index} className="border p-2 rounded-md">
                                {Object.entries(disk).map(([key, value]) => (
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
                        {data?.MonitorDevices.length === 0 && (
                            <p className="col-span-2 text-center">
                                No storage devices found
                            </p>
                        )}
                        {data?.MonitorDevices.map(
                            (disk: any, index: number) => (
                                <div
                                    key={index}
                                    className="border p-2 rounded-md"
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
