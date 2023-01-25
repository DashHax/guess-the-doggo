import axios from "axios";

const instanceDogCeoAPI = axios.create({
    baseURL: "https://dog.ceo/api"
});

export default {
    dogApi: instanceDogCeoAPI
}