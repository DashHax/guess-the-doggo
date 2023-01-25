import api from "../lib/api";
import type { PageServerLoad } from "./$types";

export const load:PageServerLoad = async () => {
    const dogBreedsResponse = await api.dogApi.get("/breeds/list/all");
    const { message } = dogBreedsResponse.data;

    return {
        breeds: message
    }
};