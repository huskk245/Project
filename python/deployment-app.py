import os
import streamlit as st
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np
from PIL import Image
import gdown

# Set page config as the first Streamlit command
st.set_page_config(page_title="Freshness Detection System", page_icon="🍎")

# Set environment variable for protobuf compatibility
os.environ['PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION'] = 'python'

# Define class names
class_names = ['freshapples', 'freshbanana', 'freshcucumber', 'freshokra', 'freshoranges', 
               'freshpotato', 'freshtomato', 'rottenapples', 'rottenbanana', 'rottencucumber', 
               'rottenokra', 'rottenoranges', 'rottenpotato', 'rottentomato']

# Google Drive file ID (replace with your actual FILE_ID)
GOOGLE_DRIVE_FILE_ID = '1sV4uOks9_XqI5vRCXTphjH22qI3MooCF'  # Replace with the ID from your Google Drive file
MODEL_PATH = 'final_freshness_resnet_model.keras'

# Download model from Google Drive if not present
if not os.path.exists(MODEL_PATH):
    with st.spinner("Downloading model (298 MB)... This may take a moment."):
        url = f"https://drive.google.com/uc?id={GOOGLE_DRIVE_FILE_ID}"
        gdown.download(url, MODEL_PATH, quiet=False)

# Load the model (using st.cache for Streamlit 1.11.0 compatibility)
@st.cache(allow_output_mutation=True)  # Suppress deprecation warning in 1.11.0
def load_model():
    try:
        model = tf.keras.models.load_model(MODEL_PATH)
        return model
    except Exception as e:
        st.error(f"Error loading model: {e}")
        return None

# Prediction function
def predict_freshness(img):
    model = load_model()
    if model is None:
        return None, None

    # Preprocess the image
    img_resized = img.resize((224, 224))
    img_array = image.img_to_array(img_resized)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = tf.keras.applications.resnet50.preprocess_input(img_array)

    # Make prediction
    predictions = model.predict(img_array)
    predicted_class = np.argmax(predictions, axis=1)[0]
    confidence_score = predictions[0][predicted_class] * 100

    return class_names[predicted_class], round(confidence_score, 2)

# Streamlit app
def main():
    st.title("🍎 Freshness Detection System")
    st.write("Upload an image to check its freshness.")

    # File uploader
    uploaded_file = st.file_uploader("Choose an image...", type=["jpg", "png", "jpeg"])

    if uploaded_file is not None:
        # Display the uploaded image
        img = Image.open(uploaded_file)
        st.image(img, caption="Uploaded Image", use_column_width=True)

        # Predict freshness
        with st.spinner("Predicting..."):
            predicted_label, confidence = predict_freshness(img)

        # Display results
        if predicted_label is not None:
            st.subheader("Prediction Result:")
            st.write(f"**Category:** {predicted_label}")
            st.write(f"**Confidence Score:** {confidence}%")

            # Highlight based on prediction
            if "fresh" in predicted_label.lower():
                st.success(f"✅ The food item is fresh!")
            else:
                st.warning(f"⚠️ The food item is rotten!")
    else:
        st.write("Please upload an image to get a prediction.")

if __name__ == '__main__':
    main()