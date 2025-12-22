#!/usr/bin/env python3
"""
Test forensic analysis modules
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'packages', 'imagesics-core', 'src'))

import unittest
import numpy as np
import cv2

class TestForensicModules(unittest.TestCase):
    
    def setUp(self):
        """Create test image"""
        self.test_image = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
    
    def test_metrics_import(self):
        """Test that metrics module can be imported"""
        try:
            from imagesics_core.forensic import metrics
            self.assertTrue(True)
        except ImportError as e:
            self.fail(f"Failed to import metrics: {e}")
    
    def test_metadata_import(self):
        """Test that metadata module can be imported"""
        try:
            from imagesics_core.forensic import metadata
            self.assertTrue(True)
        except ImportError as e:
            self.fail(f"Failed to import metadata: {e}")
    
    def test_various_import(self):
        """Test that various module can be imported"""
        try:
            from imagesics_core.forensic import various
            self.assertTrue(True)
        except ImportError as e:
            self.fail(f"Failed to import various: {e}")
    
    def test_compare_images(self):
        """Test image comparison functionality"""
        try:
            from imagesics_core.forensic.metrics import compare_images
            
            img1 = self.test_image
            img2 = self.test_image.copy()
            
            result = compare_images(img1, img2)
            
            # Check that result has expected keys
            self.assertIn('ssim', result)
            self.assertIn('psnr', result)
            self.assertIn('mse', result)
            
            # Identical images should have perfect SSIM
            self.assertGreater(result['ssim'], 0.99)
            
        except Exception as e:
            self.fail(f"compare_images failed: {e}")

if __name__ == '__main__':
    unittest.main()
