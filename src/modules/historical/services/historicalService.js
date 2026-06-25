import { httpClient } from '../../../shared/api/httpClient'

export const historicalService = {
  getFilters: () => httpClient.get('/historical/filters'),
  getSummary: (year, destination, continent, campaignId) => {
    const params = new URLSearchParams()
    if (year) params.append('year', year)
    if (destination) params.append('destination', destination)
    if (continent) params.append('continent', continent)
    if (campaignId) params.append('campaign_id', campaignId)
    return httpClient.get(`/historical/summary?${params.toString()}`)
  },
  getChartData: (year, destination, continent, campaignId) => {
    const params = new URLSearchParams()
    if (year) params.append('year', year)
    if (destination) params.append('destination', destination)
    if (continent) params.append('continent', continent)
    if (campaignId) params.append('campaign_id', campaignId)
    return httpClient.get(`/historical/chart?${params.toString()}`)
  },
  getComparison: (destination, continent, campaignId) => {
    const params = new URLSearchParams()
    if (destination) params.append('destination', destination)
    if (continent) params.append('continent', continent)
    if (campaignId) params.append('campaign_id', campaignId)
    return httpClient.get(`/historical/comparison?${params.toString()}`)
  },
}
