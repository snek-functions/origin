export default async function getExperiments(headers: {authorization: string}) {
  const response = await fetch('https://photonq.at/api2/experiments', {
    headers
  })

  const experiments = await response.json()
  return experiments
}
