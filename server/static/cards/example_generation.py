#!/usr/bin/env python3
"""
Example script to demonstrate poster generation for the MuseMap application.
This script shows how to generate a sample poster without needing the full application.
"""

import sys
import os

# Add the parent directory to the path so we can import the poster service
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from services.poster import draw_poster

def generate_example_poster():
    """Generate an example poster to demonstrate the functionality."""
    
    # Example data
    artist = "The Beatles"
    city = "London, UK"
    date_str = "15 Aug 1965"
    palette = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"]
    tracks = [
        "Help!",
        "Yesterday",
        "Ticket to Ride",
        "Eight Days a Week",
        "I Feel Fine"
    ]
    qr_url = "https://musemap.example.com/memories/1"
    
    # Output path
    out_path = os.path.join(os.path.dirname(__file__), "example_card.png")
    
    print(f"Generating example poster for {artist}...")
    print(f"Output: {out_path}")
    
    try:
        result_path = draw_poster(
            artist=artist,
            city=city,
            date_str=date_str,
            palette=palette,
            tracks=tracks,
            qr_url=qr_url,
            out_path=out_path
        )
        print(f"✅ Poster generated successfully: {result_path}")
        return True
    except Exception as e:
        print(f"❌ Error generating poster: {e}")
        return False

if __name__ == "__main__":
    generate_example_poster()
