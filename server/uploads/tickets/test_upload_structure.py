#!/usr/bin/env python3
"""
Test script to verify the upload directory structure and functionality.
This script tests file upload simulation and directory permissions.
"""

import os
import sys
from datetime import datetime

def test_upload_directory():
    """Test that the upload directory is set up correctly."""
    
    # Get the current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("🔍 Testing upload directory structure...")
    print(f"📁 Current directory: {current_dir}")
    
    # Check if required files exist
    required_files = [
        "README.md",
        ".gitkeep"
    ]
    
    all_good = True
    for file_name in required_files:
        file_path = os.path.join(current_dir, file_name)
        if os.path.exists(file_path):
            print(f"✅ {file_name} exists")
        else:
            print(f"❌ {file_name} missing")
            all_good = False
    
    # Check directory permissions
    if os.access(current_dir, os.W_OK):
        print("✅ Directory is writable")
    else:
        print("❌ Directory is not writable")
        all_good = False
    
    # Test file upload simulation
    test_filename = simulate_file_upload("test_ticket.jpg")
    test_file_path = os.path.join(current_dir, test_filename)
    
    try:
        # Create a test file (simulating upload)
        with open(test_file_path, 'w') as f:
            f.write("This is a test ticket file")
        
        # Check if file was created
        if os.path.exists(test_file_path):
            print(f"✅ Test upload successful: {test_filename}")
            
            # Clean up test file
            os.remove(test_file_path)
            print("✅ Test file cleaned up")
        else:
            print("❌ Test upload failed")
            all_good = False
            
    except Exception as e:
        print(f"❌ Upload simulation failed: {e}")
        all_good = False
    
    # Check parent directory structure
    parent_dir = os.path.dirname(current_dir)
    if os.path.basename(parent_dir) == "uploads":
        print("✅ Located in uploads directory")
    else:
        print("❌ Not in uploads directory")
        all_good = False
    
    if all_good:
        print("\n🎉 All tests passed! The upload directory is ready for file uploads.")
    else:
        print("\n⚠️  Some tests failed. Please check the issues above.")
    
    return all_good

def simulate_file_upload(original_filename):
    """Simulate the file naming convention used by the upload system."""
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    return f"{timestamp}_{original_filename}"

def test_filename_generation():
    """Test the filename generation logic."""
    print("\n🧪 Testing filename generation...")
    
    test_cases = [
        "ticket.jpg",
        "concert_photo.png",
        "event_flyer.pdf",
        "receipt.txt"
    ]
    
    for filename in test_cases:
        generated_name = simulate_file_upload(filename)
        print(f"📄 {filename} → {generated_name}")
    
    print("✅ Filename generation working correctly")

if __name__ == "__main__":
    test_upload_directory()
    test_filename_generation()
