#!/usr/bin/env python3
"""
Create a test image with comprehensive EXIF metadata including GPS coordinates
"""
from PIL import Image, ImageDraw, ImageFont
import piexif
from datetime import datetime
import numpy as np

def create_test_image_with_metadata():
    # Create a colorful test image (800x600)
    width, height = 800, 600
    img = Image.new('RGB', (width, height), color='white')
    draw = ImageDraw.Draw(img)
    
    # Draw some colorful patterns for testing
    # Gradient background
    for y in range(height):
        r = int(255 * (y / height))
        g = int(128 + 127 * np.sin(y / 50))
        b = int(255 - 255 * (y / height))
        draw.rectangle([(0, y), (width, y+1)], fill=(r, g, b))
    
    # Draw some geometric shapes for testing copy-move detection
    draw.ellipse([100, 100, 200, 200], fill='red', outline='darkred', width=3)
    draw.ellipse([600, 100, 700, 200], fill='red', outline='darkred', width=3)  # Duplicate
    draw.rectangle([150, 300, 300, 450], fill='blue', outline='darkblue', width=3)
    draw.polygon([(400, 400), (500, 300), (600, 400)], fill='green', outline='darkgreen', width=3)
    
    # Add text
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 40)
    except:
        font = ImageFont.load_default()
    
    draw.text((250, 50), "TEST IMAGE", fill='yellow', font=font, stroke_width=2, stroke_fill='black')
    draw.text((200, 500), "Forensic Analysis Test", fill='white', font=font, stroke_width=2, stroke_fill='black')
    
    # Create comprehensive EXIF data
    # GPS coordinates (fake location: Eiffel Tower, Paris)
    gps_ifd = {
        piexif.GPSIFD.GPSVersionID: (2, 0, 0, 0),
        piexif.GPSIFD.GPSLatitudeRef: 'N',
        piexif.GPSIFD.GPSLatitude: ((48, 1), (51, 1), (2989, 100)),  # 48°51'29.89"N
        piexif.GPSIFD.GPSLongitudeRef: 'E',
        piexif.GPSIFD.GPSLongitude: ((2, 1), (17, 1), (4009, 100)),  # 2°17'40.09"E
        piexif.GPSIFD.GPSAltitudeRef: 0,
        piexif.GPSIFD.GPSAltitude: (35, 1),  # 35 meters
        piexif.GPSIFD.GPSTimeStamp: ((14, 1), (30, 1), (0, 1)),
        piexif.GPSIFD.GPSDateStamp: '2024:06:15',
    }
    
    # Standard EXIF data
    exif_ifd = {
        piexif.ExifIFD.DateTimeOriginal: '2024:06:15 14:30:00',
        piexif.ExifIFD.DateTimeDigitized: '2024:06:15 14:30:00',
        piexif.ExifIFD.LensMake: 'Canon',
        piexif.ExifIFD.LensModel: 'EF 50mm f/1.8 STM',
        piexif.ExifIFD.FocalLength: (50, 1),
        piexif.ExifIFD.FNumber: (18, 10),  # f/1.8
        piexif.ExifIFD.ExposureTime: (1, 125),  # 1/125s
        piexif.ExifIFD.ISOSpeedRatings: 400,
        piexif.ExifIFD.Flash: 0,  # Flash did not fire
        piexif.ExifIFD.WhiteBalance: 0,  # Auto
        piexif.ExifIFD.ExifVersion: b'0231',
        piexif.ExifIFD.ColorSpace: 1,
        piexif.ExifIFD.PixelXDimension: width,
        piexif.ExifIFD.PixelYDimension: height,
    }
    
    # 0th IFD (main image data)
    zeroth_ifd = {
        piexif.ImageIFD.Make: 'Canon',
        piexif.ImageIFD.Model: 'Canon EOS 5D Mark IV',
        piexif.ImageIFD.Orientation: 1,
        piexif.ImageIFD.XResolution: (72, 1),
        piexif.ImageIFD.YResolution: (72, 1),
        piexif.ImageIFD.ResolutionUnit: 2,
        piexif.ImageIFD.Software: 'Adobe Photoshop CC 2024',
        piexif.ImageIFD.DateTime: '2024:06:15 15:45:30',
        piexif.ImageIFD.Artist: 'Test Photographer',
        piexif.ImageIFD.Copyright: 'Copyright 2024',
    }
    
    # 1st IFD (thumbnail)
    first_ifd = {
        piexif.ImageIFD.Orientation: 1,
        piexif.ImageIFD.XResolution: (72, 1),
        piexif.ImageIFD.YResolution: (72, 1),
        piexif.ImageIFD.ResolutionUnit: 2,
    }
    
    # Create thumbnail
    thumbnail = img.copy()
    thumbnail.thumbnail((160, 120), Image.Resampling.LANCZOS)
    
    # Save thumbnail as JPEG bytes
    from io import BytesIO
    thumb_io = BytesIO()
    thumbnail.save(thumb_io, format='JPEG')
    thumb_bytes = thumb_io.getvalue()
    
    # Combine all EXIF data
    exif_dict = {
        "0th": zeroth_ifd,
        "Exif": exif_ifd,
        "GPS": gps_ifd,
        "1st": first_ifd,
        "thumbnail": thumb_bytes,
    }
    
    # Convert to bytes
    exif_bytes = piexif.dump(exif_dict)
    
    # Save the image with EXIF data
    output_path = '/home/president/project/imageSICS/test_image_with_metadata.jpg'
    img.save(output_path, 'JPEG', quality=85, exif=exif_bytes)
    
    print(f"✓ Test image created: {output_path}")
    print(f"  - Dimensions: {width}x{height}")
    print(f"  - GPS Location: 48°51'29.89\"N, 2°17'40.09\"E (Eiffel Tower, Paris)")
    print(f"  - Camera: Canon EOS 5D Mark IV")
    print(f"  - Lens: Canon EF 50mm f/1.8 STM")
    print(f"  - Date: 2024:06:15 14:30:00")
    print(f"  - Contains: Colorful patterns, shapes, and duplicate elements for testing")

if __name__ == '__main__':
    create_test_image_with_metadata()
