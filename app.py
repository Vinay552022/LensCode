from flask import Flask, render_template, request, jsonify
from PIL import Image
from torchvision import transforms
import torch
import numpy as np
import subprocess
import os
from model import Pix2Code
from util import Vocabulary

app = Flask(__name__)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Load the model
try:
    model = Pix2Code()
    model.load_state_dict(torch.load('pix2code.weights', map_location=device))
    model = model.to(device)
    model.eval()
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Load vocabulary
try:
    vocab = Vocabulary('voc.pkl')
    print("Vocabulary loaded successfully!")
except Exception as e:
    print(f"Error loading vocabulary: {e}")
    vocab = None

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        if not model or not vocab:
            return jsonify({'error': 'Model or vocabulary not loaded properly!'}), 500
        try:
            image_file = request.files.get('image')
            if not image_file:
                return jsonify({'error': 'No image file uploaded!'}), 400
            image = Image.open(image_file).convert('RGB')
            transform = transforms.Compose([
                transforms.Resize([256, 256]),
                transforms.ToTensor(),
            ])
            image_tensor = transform(image).unsqueeze(0).to(device)
            generated_code = generate_code(image_tensor, vocab, model)

            # Step 1: Save generated code to output.gui file
            output_path = 'compiler/output.gui'
            with open(output_path, 'w') as f:
                f.write(generated_code)

            # Step 2: Run web-compiler.py
            result = run_web_compiler(output_path)

            if result:
                # Step 3: Read the output.html file generated in the compiler folder
                output_html_path = 'compiler/output.html'
                output_html = read_output_html(output_html_path)
                return jsonify({'code': output_html})
            else:
                return jsonify({'error': 'Error compiling code'}), 500
        except Exception as e:
            print(f"Error processing request: {e}")
            return jsonify({'error': str(e)}), 500
    return render_template('myindex.html')

def generate_code(image, vocab, model):
    try:
        print(f"Image tensor device: {image.device}, Model device: {next(model.parameters()).device}")
        ct = [vocab.to_vec(' '), vocab.to_vec('<START>')]
        output = ''
        for _ in range(200):
            context_array = np.array(ct, dtype=np.float32)
            context_tensor = torch.tensor(context_array).unsqueeze(0).float().to(device)
            index = torch.argmax(model(image.to(device), context_tensor), dim=2).squeeze()[-1].item()
            v = vocab.to_vocab(index)
            if v == '<END>':
                break
            output += v
            ct.append(vocab.to_vec(v))
        return output
    except Exception as e:
        print(f"Error during code generation: {e}")
        return "Error generating code"

def run_web_compiler(input_path):
    try:
        # Get the current working directory
        current_dir = os.getcwd()

        # Change the current directory to 'compiler' folder
        os.chdir('compiler')

        # Run the web-compiler.py script with the input file
        result = subprocess.run(['python', 'web-compiler.py', 'output.gui'], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Check for success or failure of the process
        if result.returncode == 0:
            print("Web compiler executed successfully.")
        else:
            print(f"Error in web-compiler.py: {result.stderr.decode()}")

        # Change back to the original directory
        os.chdir(current_dir)

        # Return whether the compilation was successful
        return result.returncode == 0
    except Exception as e:
        print(f"Error running web-compiler: {e}")
        # Ensure we return to the original directory in case of error
        os.chdir(current_dir)
        return False


def read_output_html(output_html_path):
    try:
        with open(output_html_path, 'r') as f:
            output_html = f.read()
        return output_html
    except Exception as e:
        print(f"Error reading output.html: {e}")
        return f"Error reading output HTML file: {e}"

if __name__ == '__main__':
    app.run(debug=True)
