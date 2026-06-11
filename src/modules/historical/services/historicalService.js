import { httpClient } from '../../../shared/api/httpClient'

export const historicalService = {
  getFilters: () => httpClient.get('/historical/filters'),
  getSummary: (year, destination, continent) => {
    const params = new URLSearchParams()
    params.append('year', year)
    if (destination) params.append('destination', destination)
    if (continent) params.append('continent', continent)
    return httpClient.get(`/historical/summary?${params.toString()}`)
  },
  getChartData: (year, destination, continent) => {
    const params = new URLSearchParams()
    params.append('year', year)
    if (destination) params.append('destination', destination)
    if (continent) params.append('continent', continent)
    return httpClient.get(`/historical/chart?${params.toString()}`)
  },
  getComparison: (destination, continent) => {
    const params = new URLSearchParams()
    if (destination) params.append('destination', destination)
    if (continent) params.append('continent', continent)
    return httpClient.get(`/historical/comparison?${params.toString()}`)
  },
}
