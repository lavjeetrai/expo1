import fs from 'fs';

const email = "test_user_123@example.com";
const password = "mySecretPassword123";

async function testLogin() {
  let output = "";
  try {
    const loginPayload = { email, password };
    const loginRes = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginPayload)
    });
    const loginBody = await loginRes.json();
    output += "Exact Login Status: " + loginRes.status + "\n";
    output += "Exact Login Response: " + JSON.stringify(loginBody) + "\n";

    const loginPayloadUpper = { email: email.toUpperCase(), password };
    const loginRes2 = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginPayloadUpper)
    });
    const loginBody2 = await loginRes2.json();
    output += "Uppercase Login Status: " + loginRes2.status + "\n";
    output += "Uppercase Login Response: " + JSON.stringify(loginBody2) + "\n";

  } catch (err) {
    output += "Error: " + err.message + "\n";
  }
  fs.writeFileSync('test_login_output.txt', output);
}

testLogin();
