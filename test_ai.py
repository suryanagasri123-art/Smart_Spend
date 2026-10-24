import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("Error: API key not found in .env file.")
else:
    try:
        client = genai.Client(api_key=api_key)

        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=(
                "You are a friendly SmartSpend assistant. "
                "Give one short, encouraging money-saving tip "
                "for a student."
            )
        )

        print("\nSmartSpend AI Assistant:")
        print(response.text)

    except Exception as error:
        print("AI connection error:", error)