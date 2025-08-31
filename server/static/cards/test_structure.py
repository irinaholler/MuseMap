#!/usr/bin/env python3
"""
Simple test script to verify the cards directory structure.
This script doesn't require external dependencies.
"""

import os
import sys

def test_directory_structure():
    """Test that the cards directory structure is set up correctly."""
    
    # Get the current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("🔍 Testing cards directory structure...")
    print(f"📁 Current directory: {current_dir}")
    
    # Check if required files exist
    required_files = [
        "README.md",
        ".gitkeep",
        "example_generation.py"
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
    
    # Check if we can create a test file
    test_file_path = os.path.join(current_dir, "test_write.tmp")
    try:
        with open(test_file_path, 'w') as f:
            f.write("test")
        os.remove(test_file_path)
        print("✅ Can create and delete files")
    except Exception as e:
        print(f"❌ Cannot create files: {e}")
        all_good = False
    
    # Check parent directory structure
    parent_dir = os.path.dirname(current_dir)
    if os.path.basename(parent_dir) == "static":
        print("✅ Located in static directory")
    else:
        print("❌ Not in static directory")
        all_good = False
    
    if all_good:
        print("\n🎉 All tests passed! The cards directory is ready for poster generation.")
    else:
        print("\n⚠️  Some tests failed. Please check the issues above.")
    
    return all_good

if __name__ == "__main__":
    test_directory_structure()
