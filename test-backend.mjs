import { File, FormData } from "undici";
import * as fs from "fs";

async function run() {
  const fd = new FormData();
  fd.append("name", "Rohan Kundliya");
  fd.append("designation", "MERN");
  fd.append("phone", "+911234567890");
  fd.append("email", "rohank@gmail.com");
  fd.append("password", "Roohan003!");
  fd.append("qrToken", "");

  const fileData = fs.readFileSync("dummy.pdf");
  const file = new File([fileData], "dummy.pdf", { type: "application/pdf" });
  fd.append("resume", file);

  try {
    const res = await fetch("http://localhost:3000/api/v1/candidate/auth/register", {
      method: "POST",
      body: fd,
    });
    console.log("STATUS:", res.status);
    const json = await res.json();
    console.log("RESPONSE:", JSON.stringify(json, null, 2));
  } catch (err) {
    console.error(err);
  }
}

run();
