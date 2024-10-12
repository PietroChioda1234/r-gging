export function addOneSpinningWheel() {
  const div = document.getElementById("loading");
  const element = document.createElement("img");
  element.src = "Animation - 1723914645050.gif";
  element.alt = "Computer man";
  element.style.height = "48px";
  div.appendChild(element);
  return element;
}
export function removeOneSpinningWheel() {
  const div = document.getElementById("loading");
  div.removeChild(div.lastChild);
}
export function addErrorIcon(oldChild) {
  const div = document.getElementById("loading");
  const element = document.createElement("p");
  element.style.textAlign = "center";
  element.style.scale = "1.8";
  element.innerHTML = "&#9888;";
  div.replaceChild(element, oldChild);
  removeErrorIconIn5Seconds(element);
}
export async function removeErrorIconIn5Seconds(element) {
  const div = document.getElementById("loading");
  setTimeout(() => {
    fadeOut(element).then(() => {
      div.removeChild(element);
    });
  }, 5000);
}
export async function fadeOut(element) {
  var opacity = 1; // Initial opacity
  return await new Promise((resolve) => {
    var interval = setInterval(function () {
      if (opacity > 0) {
        opacity -= 0.1;
        element.style.opacity = opacity;
      } else {
        resolve();
        clearInterval(interval); // Stop the interval when opacity reaches 0
        element.style.display = "none"; // Hide the element
        return;
      }
    }, 50);
  });
}
