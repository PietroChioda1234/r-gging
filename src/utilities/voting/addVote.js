export async function addVote(latitude, longitude, vote) {
    fetch("http://localhost:3000/marker/vote", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lat: latitude, lon: longitude, vote: vote }),
    }).then((response) =>
      response.text().then((json) => {
        return json;
      })
    );
  }
  