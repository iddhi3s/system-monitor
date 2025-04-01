import { useQuery } from "@tanstack/react-query";
import api from "./api";

const fetchTotalMachines = async () => {
    const { data } = await api.get("machines/total");
    return data;
};

export const useGetTotalMachines = () => {
    return useQuery({
        queryKey: ["total"],
        queryFn: fetchTotalMachines,
        staleTime: 1 * 60 * 1000, // Cache for 1 minutes
    });
};
