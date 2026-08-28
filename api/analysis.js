export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const { image } = req.body || {};

        if (!image) {
            return res.status(400).json({
                error: "No image was provided."
            });
        }

        // Make sure the API key exists on Vercel
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({
                error: "OPENAI_API_KEY is not configured on Vercel."
            });
        }

        const response = await fetch(
            "https://api.openai.com/v1/responses",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        `Bearer ${process.env.OPENAI_API_KEY}`
                },

                body: JSON.stringify({
                    model: "gpt-5.6-luna",

                    input: [
                        {
                            role: "user",

                            content: [
                                {
                                    type: "input_text",

                                    text: `
You are ISREYA, an image-analysis and cultural-heritage assistant.

Analyze the uploaded image carefully.

Identify, when possible:
- What is visible
- Object, structure, artwork or place type
- Possible location or region
- Possible historical or cultural context
- Approximate period or age
- Important visual clues
- Materials, architecture, symbols or inscriptions
- What cannot be determined reliably

Do NOT invent facts.

If identification is uncertain, clearly say so and give the most plausible possibilities.

Write the response in an elegant but informative style suitable for the ISREYA interface.

Begin with a concise identification, followed by a clear explanation of the evidence and uncertainty.
`
                                },

                                {
                                    type: "input_image",
                                    image_url: image,
                                    detail: "high"
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("OpenAI API error:", data);

            return res.status(response.status).json({
                error:
                    data?.error?.message ||
                    "OpenAI analysis failed."
            });
        }

        return res.status(200).json({
            analysis: data.output_text || "No analysis was returned."
        });

    } catch (error) {
        console.error("Server error:", error);

        return res.status(500).json({
            error: "Something went wrong while analysing the image."
        });
    }
}
