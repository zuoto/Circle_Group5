const APP_ID = "qygqOjKKgGQSWK7FXj2ElZD8DqPM8R7CurLav0xl"; 
const REST_KEY = "gZ3MUd66DAF8f6NjbLW4zmGPd6tIFHMdCmbw96rb"; 

const BASE_URL = "https://parseapi.back4app.com";

export async function getEvents() {
  const res = await fetch(`${BASE_URL}/features/Events`, {
    headers: {
      "X-Parse-Application-Id": APP_ID,
      "X-Parse-REST-API-Key": REST_KEY,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch events");
  }

  const data = await res.json();
  return data.results;
}
