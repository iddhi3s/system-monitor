import { useQuery } from "@tanstack/react-query";
import api from "./api";

const fetchMachines = async () => {
    const { data } = await api.get("machines");
    return data;
};

export const useGetMachines = () => {
    return useQuery({
        queryKey: ["machines"],
        queryFn: fetchMachines,
        staleTime: 1 * 60 * 1000, // Cache for 1 minutes
    });
};
