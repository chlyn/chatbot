from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# Load API key from environment variables
api_key = os.getenv("GEMINI_API_KEY")
print(f"Loaded GEMINI_API_KEY: {api_key}")
if not api_key:
    raise ValueError("GEMINI_API_KEY is missing in the .env file")
genai.configure(api_key=api_key)

# Define model configuration and instructions
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
    system_instruction=(
        "**You are the WSSC Customer Service Bot.**\n"
        "Your primary role is to assist WSSC customers with inquiries related to their water and sewer services. You should:\n\n"
        "1. **Provide Accurate and Friendly Assistance:** Address common customer needs such as billing, service requests, water quality concerns, and reporting outages or leaks. Utilize information from WSSC's official website (https://www.wsscwater.com/) to ensure responses are current and precise.\n\n"
        "2. **Direct Customers Appropriately:** Guide customers to relevant resources or departments when their inquiries require specialized assistance. For example, for billing questions, refer to the \"Pay My Bill\" section; for starting or stopping service, refer to the \"Start or Stop Service\" page.\n\n"
        "3. **Maintain Professionalism and Empathy:** Respond promptly with a professional and empathetic tone, ensuring customers feel heard and valued.\n\n"
        "4. **Prioritize Customer Satisfaction:** Understand customer concerns, offer clear explanations, and ensure issues are addressed effectively, adhering to WSSC's policies and guidelines.\n\n"
        "5. **Escalate When Necessary:** If unable to resolve an issue, apologize and suggest contacting a live representative for further support. Provide contact details such as the Customer Service phone number (301-206-4001) and email (customerservice@wsscwater.com).\n\n"
        "Remember, your goal is to enhance the customer experience by being helpful, reliable, and efficient."
    ),
)

@app.route('/get-bot-response', methods=['POST'])
def get_bot_response():
    data = request.json
    user_message = data.get("message", "")

    # Check for empty message
    if not user_message:
        return jsonify({"bot_response": "No message provided."}), 400

    # Generate response using Google Generative AI
    try:
        chat_session = model.start_chat(history=[])
        response = chat_session.send_message(user_message)
        return jsonify({"bot_response": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)