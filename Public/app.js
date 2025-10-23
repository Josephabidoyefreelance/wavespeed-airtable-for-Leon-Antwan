const form = document.getElementById("generateForm");
const outputDiv = document.getElementById("output");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const prompt = formData.get("prompt");
  const subject = formData.get("subject");
  const references = formData.get("references") ? formData.get("references").split(",").map(s => s.trim()) : [];
  const width = formData.get("width");
  const height = formData.get("height");
  const batch = formData.get("batch");

  outputDiv.innerHTML = "<p>Generating… check Airtable shortly!</p>";

  try {
    const response = await fetch("/api/create-record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, subject, references, width, height, batch })
    });

    const data = await response.json();
    outputDiv.innerHTML = `<p>${data.message}</p><pre>${JSON.stringify(data.result, null, 2)}</pre>`;

    const recordsResp = await fetch("/api/records");
    const recordsData = await recordsResp.json();

    outputDiv.innerHTML += "<h2>All Airtable Records:</h2>";
    recordsData.data.forEach(record => {
      const div = document.createElement("div");
      div.className = "record";
      div.innerHTML = `<strong>ID:</strong> ${record.id}<br>
                       <strong>Prompt:</strong> ${record.fields.Prompt || ""}<br>
                       <strong>Status:</strong> ${record.fields.Status || ""}<br>`;
      outputDiv.appendChild(div);
    });

  } catch (err) {
    outputDiv.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
  }
});
