# 🍎 Freshness Detection using ResNet50

## 📌 Overview
This project is a deep learning model based on **ResNet50** to classify the freshness of fruits and vegetables. It uses **TensorFlow** and **Keras**, with image augmentation and fine-tuning techniques to improve accuracy.

---

## 📂 Dataset Structure
https://www.kaggle.com/datasets/swoyam2609/fresh-and-stale-classification/data
- `Train/` → Contains training images (fresh & rotten)
- `Test/` → Contains test images (fresh & rotten)
- Images are categorized into separate class folders

---

## ⚙️ Model Configuration
```python
IMG_HEIGHT, IMG_WIDTH = 224, 224
BATCH_SIZE = 32
EPOCHS = 20
LEARNING_RATE = 1e-4
```

- **Image Size:** 224x224 pixels
- **Batch Size:** 32
- **Epochs:** 20
- **Learning Rate:** 0.0001

---

## 🔄 Data Preprocessing & Augmentation
```python
train_datagen = ImageDataGenerator(
    preprocessing_function=tf.keras.applications.resnet50.preprocess_input,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    validation_split=0.2
)
```
### ✅ Features:
- **Rotation, Shift, Shear, Zoom** → Prevents overfitting
- **Validation Split** → 20% of training data is used for validation

---

## 🏗️ Model Architecture
```python
def create_resnet_model(input_shape=(IMG_HEIGHT, IMG_WIDTH, 3), num_classes=NUM_CLASSES):
    base_model = ResNet50(weights='imagenet', include_top=False, input_shape=input_shape)
    
    for layer in base_model.layers[-20:]:  # Unfreeze last 20 layers for fine-tuning
        layer.trainable = True
    
    model = models.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.BatchNormalization(),
        layers.Dense(512, activation='relu'),
        layers.Dropout(0.5),
        layers.Dense(256, activation='relu'),
        layers.Dropout(0.3),
        layers.Dense(num_classes, activation='softmax')
    ])
    
    optimizer = tf.keras.optimizers.Adam(learning_rate=LEARNING_RATE)
    
    model.compile(optimizer=optimizer, loss='categorical_crossentropy', 
                  metrics=['accuracy', tf.keras.metrics.Precision(), tf.keras.metrics.Recall()])
    return model
```
### ✅ Features:
- **ResNet50 (Pre-trained on ImageNet)**
- **Fine-tuned last 20 layers**
- **Dropout (0.5, 0.3) to prevent overfitting**

---

## 🚀 Training the Model
```python
model = create_resnet_model()
history = model.fit(
    train_generator,
    epochs=EPOCHS,
    validation_data=validation_generator,
    callbacks=[early_stopping, model_checkpoint],
    verbose=1
)
```
### ✅ Features:
- **Early Stopping** → Stops training if validation loss doesn't improve
- **Model Checkpoint** → Saves the best model

---

## 📊 Model Evaluation
```python
test_loss, test_accuracy, test_precision, test_recall = model.evaluate(test_generator)
print(f"Test Loss: {test_loss}, Test Accuracy: {test_accuracy}")
```
- Evaluates model on **unseen test data**.

---

## 📈 Training Results
```python
plt.figure(figsize=(12, 4))
plt.subplot(1, 2, 1)
plt.plot(history.history['accuracy'], label='Train Accuracy')
plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
plt.title('Model Accuracy')
plt.xlabel('Epochs')
plt.ylabel('Accuracy')
plt.legend()

plt.subplot(1, 2, 2)
plt.plot(history.history['loss'], label='Train Loss')
plt.plot(history.history['val_loss'], label='Validation Loss')
plt.title('Model Loss')
plt.xlabel('Epochs')
plt.ylabel('Loss')
plt.legend()
plt.show()
```
- Plots accuracy and loss for training & validation data.

---

## 🎯 Making Predictions
```python
from tensorflow.keras.preprocessing import image
import numpy as np

model = tf.keras.models.load_model("final_freshness_resnet_model.keras")

img_path = r"C:\\Users\\Welcome\\ai\\archive (1)\\dataset\\Test\\rottenapples\\a_r086.png"
img = image.load_img(img_path, target_size=(224, 224))
img_array = image.img_to_array(img) / 255.0
img_array = np.expand_dims(img_array, axis=0)

predictions = model.predict(img_array)
predicted_class_index = np.argmax(predictions)
predicted_class_name = class_names[predicted_class_index]
confidence_score = predictions[0][predicted_class_index] * 100

print(f"Predicted Class: {predicted_class_name} ({confidence_score:.2f}% confidence)")
```
### ✅ Features:
- Loads **new test image**
- Predicts **class & confidence score (%)**

---

## 🚨 Challenges Faced & Solutions
### **1. Overfitting**
**Problem:** Model performed well on training data but poorly on validation/test data.
**Solution:**
- Used **Dropout Layers** (0.5, 0.3)
- Applied **Data Augmentation**

### **2. Learning Rate Issues**
**Problem:** Model learning was too slow or unstable.
**Solution:**
- Used **ExponentialDecay Learning Rate Scheduler**

### **3. Incorrect Predictions**
**Problem:** Model classified images incorrectly.
**Solution:**
- Increased **training data**
- Fine-tuned **last 20 layers of ResNet50**

---

## 📌 Future Improvements
- **Try EfficientNet/MobileNet** for better accuracy
- **Use more training data** to improve generalization
- **Implement a web app** for real-time freshness detection

---

## 🏁 Conclusion
This model successfully classifies fresh & rotten fruits/vegetables using **ResNet50** with fine-tuning. The prediction system provides a **freshness score (%)** to measure confidence in classification. 🚀

---

## 📜 Author
Developed by **[Your Name]**
