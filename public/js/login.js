// FRONT-END (CLIENT) JAVASCRIPT FOR LOGIN PAGE

const login = async function (event) {
  event.preventDefault();

  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const messageElement = document.getElementById("login-message");

  const username = usernameInput.value;
  const password = passwordInput.value;

  const body = JSON.stringify({ username, password });

  const response = await fetch("/login", {
    method: "POST",
    body: body,
    headers: {
      "Content-Type": "application/json"
    }
  });

  const result = await response.json();

  if (result.success) {
    if (result.newAccount) {
      messageElement.textContent = "CREATED NEW ACCOUNT, LOGGED IN SUCCESSFULLY";
    } else {
      messageElement.textContent = "LOGGED IN SUCCESSFULLY";
    }
    window.location.href = "/app.html"; // Redirects user to main page after successful login
  } else {
    messageElement.textContent = "LOGIN FAILED";
  }
}

window.onload = function () {
  const loginForm = document.getElementById("login-form");
  loginForm.addEventListener("submit", login);
}