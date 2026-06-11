import { httpClient } from '@/shared/api/httpClient'

export const predictionService = {
  getModels: () => httpClient.get('/predict/models'),
  getInputOptions: () => httpClient.get('/predict/input-options'),
  getLatestObservation: (destination) => httpClient.get(`/predict/latest-observation?destination=${encodeURIComponent(destination)}`),
  compare: (payload) => httpClient.post('/predict/compare', payload),
}
