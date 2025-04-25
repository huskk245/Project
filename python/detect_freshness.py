import os
import sys
import json
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np
from PIL import Image
import traceback

# Suppress TensorFlow logging
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
tf.get_logger().setLevel("ERROR")

# Disable progress bar
tf.keras.utils.disable_interactive_logging()

# Set environment variable for protobuf compatibility
os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"

# Define class names
class_names = [
    "freshapples",
    "freshbanana",
    "freshcucumber",
    "freshokra",
    "freshoranges",
    "freshpotato",
    "freshtomato",
    "rottenapples",
    "rottenbanana",
    "rottencucumber",
    "rottenokra",
    "rottenoranges",
    "rottenpotato",
    "rottentomato",
]

# Get the directory of the current script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, "final_freshness_resnet_model.keras")


def log_error(message):
    error_json = json.dumps({"error": message, "traceback": traceback.format_exc()})
    print(error_json, file=sys.stderr)


def log_debug(message):
    debug_json = json.dumps({"debug": message})
    print(debug_json, file=sys.stderr)


def load_model():
    try:
        log_debug(f"Attempting to load model from {MODEL_PATH}")
        if not os.path.exists(MODEL_PATH):
            log_error(f"Model file not found at {MODEL_PATH}")
            return None

        model = tf.keras.models.load_model(MODEL_PATH)
        log_debug("Model loaded successfully")
        return model
    except Exception as e:
        log_error(f"Error loading model: {str(e)}")
        return None


def predict_freshness(image_path):
    try:
        log_debug(f"Starting prediction for image: {image_path}")

        # Check if image exists
        if not os.path.exists(image_path):
            log_error(f"Image file not found at {image_path}")
            return 1

        # Load model
        model = load_model()
        if model is None:
            return 1

        # Load and preprocess the image
        log_debug("Loading and preprocessing image")
        img = Image.open(image_path)
        img_resized = img.resize((224, 224))
        img_array = image.img_to_array(img_resized)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = tf.keras.applications.resnet50.preprocess_input(img_array)

        # Make prediction
        log_debug("Making prediction")
        predictions = model.predict(img_array, verbose=0)  # Disable progress bar
        predicted_class = np.argmax(predictions, axis=1)[0]

        # Log raw prediction values
        log_debug(f"Raw predictions: {predictions[0].tolist()}")
        log_debug(f"Predicted class index: {predicted_class}")

        # Calculate confidence score with more precision
        confidence_score = float(predictions[0][predicted_class] * 100)
        log_debug(f"Calculated confidence score: {confidence_score}")

        result = {
            "predicted_label": class_names[predicted_class],
            "confidence": round(
                confidence_score, 4
            ),  # Increase decimal places from 2 to 4
            "is_fresh": "fresh" in class_names[predicted_class].lower(),
        }

        log_debug(f"Final result object: {result}")
        # Print only the result JSON, nothing else on stdout
        print(json.dumps(result))
        sys.stdout.flush()
        return 0
    except Exception as e:
        log_error(f"Error during prediction: {str(e)}")
        return 1


if __name__ == "__main__":
    if len(sys.argv) != 2:
        log_error("Image path not provided")
        sys.exit(1)

    sys.exit(predict_freshness(sys.argv[1]))
