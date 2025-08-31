#!/usr/bin/env python3
"""
Example script demonstrating file upload functionality for the MuseMap application.
This script shows how files are processed and stored in the uploads directory.
"""

import os
import sys
from datetime import datetime
import mimetypes

def create_sample_ticket_file():
    """Create a sample ticket file for demonstration purposes."""
    
    # Sample ticket content (simulating a ticket image)
    ticket_content = """
    ========================================
    CONCERT TICKET
    ========================================
    
    Artist: The Beatles
    Venue: Royal Albert Hall
    Date: 31-08-2024
    Time: 8:00 PM
    Seat: A-15
    Price: £50.00
    
    ========================================
    This is a sample ticket for demonstration
    ========================================
    """
    
    return ticket_content

def simulate_file_upload(original_filename, file_content):
    """Simulate the file upload process used by the Flask app."""
    
    # Get current directory
    upload_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Generate timestamp-based filename (same as Flask app)
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    safe_filename = f"{timestamp}_{original_filename}"
    
    # Full path for the uploaded file
    file_path = os.path.join(upload_dir, safe_filename)
    
    # Write the file (simulating upload)
    with open(file_path, 'w') as f:
        f.write(file_content)
    
    return safe_filename, file_path

def get_file_info(file_path):
    """Get information about the uploaded file."""
    
    if not os.path.exists(file_path):
        return None
    
    file_stats = os.stat(file_path)
    
    return {
        'filename': os.path.basename(file_path),
        'size': file_stats.st_size,
        'created': datetime.fromtimestamp(file_stats.st_ctime),
        'modified': datetime.fromtimestamp(file_stats.st_mtime),
        'mime_type': mimetypes.guess_type(file_path)[0] or 'application/octet-stream'
    }

def demonstrate_upload_process():
    """Demonstrate the complete upload process."""
    
    print("🎫 Demonstrating file upload process...")
    print("=" * 50)
    
    # Create sample ticket content
    ticket_content = create_sample_ticket_file()
    original_filename = "beatles_ticket.txt"
    
    print(f"📄 Original filename: {original_filename}")
    print(f"📏 Content length: {len(ticket_content)} characters")
    
    # Simulate upload
    print("\n📤 Simulating file upload...")
    uploaded_filename, file_path = simulate_file_upload(original_filename, ticket_content)
    
    print(f"✅ File uploaded as: {uploaded_filename}")
    print(f"📁 Full path: {file_path}")
    
    # Get file information
    file_info = get_file_info(file_path)
    if file_info:
        print("\n📊 File Information:")
        print(f"   Size: {file_info['size']} bytes")
        print(f"   Created: {file_info['created']}")
        print(f"   Modified: {file_info['modified']}")
        print(f"   MIME Type: {file_info['mime_type']}")
    
    # Show how it would be stored in the database
    print("\n💾 Database Storage:")
    relative_path = f"uploads/tickets/{uploaded_filename}"
    print(f"   Assets field: ['{relative_path}']")
    
    # Clean up demonstration file
    print("\n🧹 Cleaning up demonstration file...")
    os.remove(file_path)
    print("✅ Demonstration file removed")
    
    return uploaded_filename

def show_upload_api_example():
    """Show how the upload API would be used."""
    
    print("\n🌐 API Usage Example:")
    print("=" * 50)
    
    print("""
POST /memories
Content-Type: multipart/form-data

Form Data:
- artist: "The Beatles"
- venue: "Royal Albert Hall"
- city: "London"
- country: "UK"
- date: "31-08-2024"
- lat: "51.5010"
- lng: "-0.1774"
- note: "Amazing concert!"
- file: [beatles_ticket.jpg]  # File upload

Response:
{
  "id": 1,
  "artist": "The Beatles",
  "venue": "Royal Albert Hall",
  "city": "London",
  "country": "UK",
  "date": "31-08-2024",
  "lat": 51.5010,
  "lng": -0.1774,
  "note": "Amazing concert!",
  "assets": ["uploads/tickets/20240831-143022_beatles_ticket.jpg"],
  "palette": null,
  "tracks": null
}
    """)

if __name__ == "__main__":
    demonstrate_upload_process()
    show_upload_api_example()
