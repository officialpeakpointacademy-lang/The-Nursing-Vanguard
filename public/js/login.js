const form =
  document.getElementById("loginForm");

const message =
  document.getElementById("loginMessage");


form.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    message.textContent =
      "Signing you in...";


    const id =
      document
        .getElementById("id")
        .value
        .trim();


    const password =
      document
        .getElementById("password")
        .value;


    try {

      const response =
        await fetch(
          "/api/auth/login",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              id,
              password
            })
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        message.textContent =
          data.message ||
          "Login failed.";

        return;
      }


      if (
        data.user.roles.includes(
          "admin"
        ) ||
        data.user.roles.includes(
          "super_admin"
        )
      ) {

        window.location.href =
          "/admin";

      } else {

        window.location.href =
          "/member";

      }

    } catch (error) {

      message.textContent =
        "Unable to connect to the server.";

    }

  }
);


/* SHOW / HIDE PASSWORD */

const togglePassword =
  document.getElementById("togglePassword");

const passwordInput =
  document.getElementById("password");

if (togglePassword && passwordInput) {

  togglePassword.addEventListener("click", () => {

    const isPassword =
      passwordInput.type === "password";

    passwordInput.type =
      isPassword ? "text" : "password";

    togglePassword.textContent =
      isPassword ? "Hide" : "Show";

    togglePassword.setAttribute(
      "aria-label",
      isPassword ? "Hide password" : "Show password"
    );

  });

}
