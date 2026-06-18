import { httpClient } from '@/shared/api/httpClient'

export const profitabilityService = {
  getOptions: () => httpClient.get('/profitability/options'),
  getModels: () => httpClient.get('/profitability/models'),
  calculate: (payload) => httpClient.post('/profitability/calculate', payload),
  calculateWithPrediction: (payload) => httpClient.post('/profitability/calculate-with-prediction', payload),

  listCampaigns: () => httpClient.get('/profitability/campaigns'),
  createCampaign: (payload) => httpClient.post('/profitability/campaigns', payload),
  getCampaign: (id) => httpClient.get(`/profitability/campaigns/${id}`),
  updateCampaign: (id, payload) => httpClient.patch(`/profitability/campaigns/${id}`, payload),
  deleteCampaign: (id) => httpClient.delete(`/profitability/campaigns/${id}`),

  listSimulations: (campaignId) => httpClient.get(`/profitability/campaigns/${campaignId}/simulations`),
  createSimulation: (campaignId, payload) => httpClient.post(`/profitability/campaigns/${campaignId}/simulations`, payload),
  generateAutoScenarios: (campaignId, payload) =>
    httpClient.post(`/profitability/campaigns/${campaignId}/simulations/generate-auto`, payload),
  updateSimulation: (id, payload) => httpClient.patch(`/profitability/simulations/${id}`, payload),
  deleteSimulation: (id) => httpClient.delete(`/profitability/simulations/${id}`),
  markBest: (id) => httpClient.post(`/profitability/simulations/${id}/mark-best`),
}
