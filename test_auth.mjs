const email = "test_user_123@example.com";
const password = "mySecretPassword123";
const role = "student";

async function testAuth() {
  console.log("1. Testing Signup...");
  const signupPayload = { email, password, role, name: "Test User", registrationNumber: "AP25123456789", course: "CSE CORE", section: "A" };
  
  try {
    const signupRes = await fetch("http://localhost:3000/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signupPayload)
    });
    const signupBody = await signupRes.json();
    console.log("Signup Status:", signupRes.status);
    console.log("Signup Response:", signupBody);

    console.log("\n2. Testing Login with exact same credentials...");
    const loginPayload = { email, password };
    const loginRes = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginPayload)
    });
    const loginBody = await loginRes.json();
    console.log("Login Status:", loginRes.status);
    console.log("Login Response:", loginBody);

    console.log("\n3. Testing Login with uppercase email:");
    const loginPayload2 = { email: email.toUpperCase(), password };
    const loginRes2 = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginPayload2)
    });
    const loginBody2 = await loginRes2.json();
    console.log("Login Status (Uppercase Email):", loginRes2.status);
    console.log("Login Response (Uppercase Email):", loginBody2);

  } catch (err) {
    console.error("Test script error:", err);
  }
}

testAuth();
