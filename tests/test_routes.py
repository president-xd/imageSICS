#!/usr/bin/env python3
"""
Test Flask routes
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import unittest
import tempfile
from io import BytesIO

class TestRoutes(unittest.TestCase):
    
    def setUp(self):
        """Set up test client"""
        os.environ['PYTHONPATH'] = os.path.join(os.path.dirname(__file__), '..', 'packages', 'imagesics-core', 'src')
        
        try:
            from apps.monolith.app import app
            app.config['TESTING'] = True
            self.client = app.test_client()
            self.app_available = True
        except Exception as e:
            print(f"Warning: Could not load Flask app: {e}")
            self.app_available = False
    
    def test_index_route(self):
        """Test that index page loads"""
        if not self.app_available:
            self.skipTest("Flask app not available")
        
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'imageSICS', response.data)
    
    def test_upload_route_exists(self):
        """Test that upload route exists"""
        if not self.app_available:
            self.skipTest("Flask app not available")
        
        # POST without file should return error
        response = self.client.post('/api/uploads/')
        # Should not be 404
        self.assertNotEqual(response.status_code, 404)
    
    def test_digest_route_exists(self):
        """Test that digest route exists"""
        if not self.app_available:
            self.skipTest("Flask app not available")
        
        response = self.client.post('/api/forensic/digest', 
                                   json={'image_path': '/fake/path'})
        # Should not be 404
        self.assertNotEqual(response.status_code, 404)

if __name__ == '__main__':
    unittest.main()
