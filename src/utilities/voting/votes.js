import { addVote } from "./addVote";

export async function setCommunityVote(vote, vote_n) {
  const div = document.getElementById("community_vote");
  const child_position = Math.trunc(Math.floor(vote));
  let new_color;
  if (child_position >= 10) {
    child_position = 9;
  }
  if (vote_n <= 0) {
    new_color = "bg-[#57534e]";
  } else {
    const vote_selector =
      document.getElementById("user_vote").children[child_position];
    new_color = vote_selector.className.substring(0, 12);
  }

  const old_color = div.className
    .substring(div.className.indexOf("bg"))
    .split(" ")[0];
  div.classList.remove(old_color);
  div.classList.add(new_color);
  div.textContent = vote.toFixed(1);
}

export async function setDevVote_fun(num) {
  const div = document.getElementById("dev_vote_fun");
  if (!num) {
    div.textContent = "flat";
    changeBackgroundColor(-60, div);
    return;
  }
  div.textContent = num.toFixed(1);
  changeBackgroundColor(num.toFixed(2), div);
}
export function changeBackgroundColor(value, element) {
  // Ensure the value is within the range -60 to 60
  const clampedValue = Math.max(-60, Math.min(60, value));

  // Convert the value to a scale of 0 to 1
  const normalizedValue = (clampedValue + 60) / 120;

  // Calculate the RGB components
  const red = Math.round(255 * (1 - normalizedValue));
  const green = Math.round(255 * normalizedValue);
  const blue = 0; // We don't change blue, as the gradient is between red and green

  // Create the RGB color string
  const color = `rgb(${red}, ${green}, ${blue})`;

  // Get the element by its ID

  // Change the background color of the element
  if (element) {
    element.style.backgroundColor = color;
  } else {
    console.error(`Element not found.`);
  }
}
export function manageListenersForVoting() {
  const father = document.getElementById("user_vote");
  const new_father = father.cloneNode(true);
  father.parentNode.replaceChild(new_father, father);
  for (let index = 0; index < new_father.children.length; index++) {
    const element = new_father.children[index];
    element.addEventListener("click", () => {
      const vote = index + 1;
      const latitude = sessionStorage.getItem("latitude");
      const longitude = sessionStorage.getItem("longitude");
      addVote(latitude, longitude, vote);
    });
  }
}
