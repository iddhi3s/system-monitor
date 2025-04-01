import { useQuery } from "@tanstack/react-query";
import api from "./api";

const fetchMachine = async (serial: string) => {
    const { data } = await api.get("machines/" + serial);
    return data;
};

export const useGetMachine = (serial: string) => {
    return useQuery({
        queryKey: ["machines", serial],
        queryFn: () => fetchMachine(serial),
        enabled: !!serial,
        staleTime: 60 * 60 * 1000, // Cache for 60 minutes
    });
};
