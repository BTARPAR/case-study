const axios = require("axios");
const {find, get, toLower} = require("lodash");

axios.defaults.baseURL = 'https://svc.metrotransit.org/nextripv2';

const metroTransitApi = (url, callback) => {
  return axios.get(url)
    .then((response) => {
      // handle success
      return callback(response.data)
    })
}

const nextScheduled = async (busRoute, stopName, direction) => {
  if (!busRoute || !stopName || !direction) return 'Please enter required information.'

  // get route_id from /routes api
  const getRouteId = await metroTransitApi('/routes', (response) => {
    return get(find(response, (route) => {
      return toLower(route.route_label) === toLower(busRoute)
    }), ['route_id'], '')
  })

  // get direction_id from /directions api
  const directionId = await metroTransitApi(`/directions/${getRouteId}`, (response) => {
    return get(find(response, (route) => {
      return toLower(route.direction_name).includes(toLower(direction))
    }), ['direction_id'], '')
  })

  // get place_code from /stops api
  const placeCode = await metroTransitApi(`/stops/${getRouteId}/${directionId}`, (response) => {
    return get(find(response, (route) => {
      return toLower(route.description).includes(toLower(stopName))
    }), ['place_code'], '')
  })

  // get departure_text from /stops api
  const departureText = await metroTransitApi(`/${getRouteId}/${directionId}/${placeCode}`, (response) => {
    return get(response, ['departures', 0, 'departure_text'])
  })

  const convertTo24HrFormat = departureText.split(':')

  const scheduleTime = new Date()
  scheduleTime.setHours(parseInt(convertTo24HrFormat[0]) + 12);
  scheduleTime.setMinutes(parseInt(convertTo24HrFormat[1]));
  scheduleTime.setSeconds(0);

  const timeDiff = Math.abs(scheduleTime - new Date());

  // waitTime in minutes
  const waitTime = Math.ceil(timeDiff / (1000 * 60))
  if (waitTime > 1) {
    return waitTime + ' minutes'
  } else {
    return waitTime + ' minutes'
  }
}

nextScheduled('METRO Blue Line', 'Target Field Station Platform 1', 'south').then((response) => {
  console.log(response)
})

