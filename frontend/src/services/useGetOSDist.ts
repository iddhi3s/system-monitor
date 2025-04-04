import { useQuery } from "@tanstack/react-query";
import api from "./api";

const fetOSDist = async () => {
    const { data } = await api.get("machines/os-distribution");
    return data;
};

export const useGetOsDist = () => {
    return useQuery({
        queryKey: ["os-dist"],
        queryFn: fetOSDist,
    });
};
