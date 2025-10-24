document.getElementById("generateBtn").addEventListener("click", async () => {
  const prompt = document.getElementById("prompt").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const resultBlock = document.getElementById("resultBlock");

  if (!prompt || !subject) {
    alert("Please enter prompt & image URL.");
    return;
  }

  resultBlock.innerHTML = "⏳ Generating...";

  try {
    const response = await fetch("/api/generate-batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        subject,
        batchCount: 1,
        width: 512,
        height: 512,
      }),
    });

    const data = await response.json();
    
    if (data.images && data.images.length > 0) {
      const imageUrl = data.images[0];
      resultBlock.innerHTML = `
        ✅ Success!
        <img src="${imageUrl}" alt="Generated Image">
      `;
    } else {
      resultBlock.innerHTML = "⚠ No image returned";
    }
  } catch (error) {
    console.error(error);
    resultBlock.innerHTML = "❌ Error generating image";
  }
});
