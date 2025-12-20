import cv2
import numpy as np

# Create a 512x512 image
img = np.zeros((512, 512, 3), dtype=np.uint8)

# Draw some shapes to make it interesting for forensics
# Gradient background
for i in range(512):
    img[i, :] = (i // 2, 255 - i // 2, 100)

# A rectangle
cv2.rectangle(img, (50, 50), (200, 200), (0, 0, 255), -1)

# A circle
cv2.circle(img, (300, 300), 80, (0, 255, 0), -1)

# Text
cv2.putText(img, "TEST IMAGE", (100, 450), cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 3)

# Save as JPEG
cv2.imwrite("test_image.jpg", img)
print("Created test_image.jpg")
