import axios from "axios"
import { baseUrl } from "./constants"
import { config } from "./configuration"

const api = axios.create({
 baseURL: baseUrl,
//  withCredentials: true
...config
})

export default api