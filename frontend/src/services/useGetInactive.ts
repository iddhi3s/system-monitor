import { useQuery } from "@tanstack/react-query";
import api from "./api";

const fetchInactiveMachines = async () => {
    const { data } = await api.get("machines/inactive");
    return data;
};

export const useGetInactiveMachines = () => {
    return useQuery({
        queryKey: ["inactive"],
        queryFn: fetchInactiveMachines,
        staleTime: 1 * 60 * 1000, // Cache for 1 minutes
    });
};
