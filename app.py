from flask import Flask, request, jsonify
import cv2
import pytesseract
import datetime
import os
from googlesearch import search

app = Flask(__name__)

def extract_text_from_image(image_path):
    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    text = pytesseract.image_to_string(gray)
    return text.strip()

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    
    image = request.files['image']
    image_path = "temp.jpg"
    image.save(image_path)
    
    extracted_text = extract_text_from_image(image_path)
    os.remove(image_path)
    
    if not extracted_text:
        return jsonify({'error': 'No text detected'}), 400
    
    return jsonify({'product_name': extracted_text})

def search_sustainable_alternatives(product_text):
    query = f"sustainable alternative to {product_text}"
    results = list(search(query, num=5, stop=5, pause=2))
    return results

@app.route('/search_alternatives', methods=['POST'])
def search_alternatives():
    data = request.json
    product_name = data.get('product_name')
    
    if not product_name:
        return jsonify({'error': 'Product name is required'}), 400
    
    alt_links = search_sustainable_alternatives(product_name)
    return jsonify({'alternatives': alt_links})

def calculate_carbon_tokens(original_price, alternative_price):
    return max((original_price - alternative_price) * 2, 0)

@app.route('/calculate_tokens', methods=['POST'])
def calculate_tokens():
    data = request.json
    original_price = data.get('original_price')
    alternative_price = data.get('alternative_price')
    
    if original_price is None or alternative_price is None:
        return jsonify({'error': 'Both prices are required'}), 400
    
    tokens = calculate_carbon_tokens(original_price, alternative_price)
    return jsonify({'carbon_tokens': tokens})

@app.route('/reset_score', methods=['GET'])
def reset_score():
    today = datetime.date.today()
    return jsonify({'monthly_carbon_score': 0 if today.day == 1 else 'No reset today'})

if __name__ == '__main__':
    app.run(debug=True)
