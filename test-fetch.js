const fs = require('fs');

async function test() {
  const fd = new FormData();
  fd.append("name", "Rohan");
  fd.append("designation", "MERN");
  fd.append("phone", "+911234567890");
  fd.append("email", "rohank@gmail.com");
  fd.append("password", "Roohan003!");
  
  // Create a Blob from dummy.pdf
  const fileBuffer = fs.readFileSync('dummy.pdf');
  const fileBlob = new Blob([fileBuffer], { type: 'application/pdf' });
  fd.append("resume", fileBlob, 'dummy.pdf');

  try {
    const res = await fetch('http://localhost:3000/api/v1/candidate/auth/register', {
      method: 'POST',
      body: fd
    });
    const json = await res.json();
    console.log("RESPONSE:", JSON.stringify(json, null, 2));
  } catch (err) {
    console.error("ERROR:", err);
  }
}
test();
