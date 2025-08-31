# Tickets Upload Directory

This directory stores uploaded ticket images and other concert-related files for memories in the MuseMap application.

## Purpose

The `uploads/tickets/` directory is used to store files uploaded by users when creating or editing memories. These files typically include:

- Concert ticket images
- Event flyers
- Concert photos
- Receipts
- Any other concert-related documents

## File Naming Convention

Uploaded files are automatically renamed using a timestamp-based pattern to ensure uniqueness and security:

```
{YYYYMMDD-HHMMSS}_{original_filename}
```

Examples:
- `20240831-143022_ticket.jpg` - Uploaded on Aug 31, 2024 at 14:30:22
- `20240831-143045_concert_photo.png` - Uploaded on Aug 31, 2024 at 14:30:45

## Upload Process

1. User selects a file when creating/editing a memory
2. File is uploaded via multipart/form-data to `/memories` endpoint
3. Server generates a safe filename with timestamp prefix
4. File is saved to this directory
5. File path is stored in the memory's `assets` field

## File Structure

```
server/uploads/tickets/
├── README.md          # This documentation file
├── .gitkeep           # Keeps the directory in git (uploaded files will be stored here)
└── [uploaded files]   # timestamp_filename.ext (generated at runtime)
```

## Security Features

- **Timestamp Prefix**: Prevents filename conflicts
- **Safe Filenames**: Original filenames are preserved but prefixed
- **Directory Isolation**: Uploads are stored in a dedicated directory
- **File Type Validation**: Server can validate file types (implement as needed)

## API Integration

Files are uploaded via the `/memories` endpoint:

```bash
POST /memories
Content-Type: multipart/form-data

# Form fields:
- artist: "The Beatles"
- venue: "Royal Albert Hall"
- city: "London"
- date: "31-08-2024"  # European format (DD-MM-YYYY)
- lat: "51.5074"
- lng: "-0.1278"
- file: [ticket_image.jpg]  # Optional file upload
```

## File Access

Uploaded files are referenced in the memory's `assets` field as:
```
uploads/tickets/20240831-143022_ticket.jpg
```

## Technical Details

- **Supported Formats**: Images (JPG, PNG, GIF), PDFs, etc. (configurable)
- **Storage**: Local filesystem (can be extended to cloud storage)
- **Backup**: Consider backing up this directory regularly
- **Cleanup**: Implement cleanup for unused files if needed
- **Date Format**: European format (DD-MM-YYYY) is used throughout the application

## Example Usage

When a user uploads a ticket image:
1. File is saved as `20240831-143022_ticket.jpg`
2. Memory record stores `assets: ["uploads/tickets/20240831-143022_ticket.jpg"]`
3. Frontend can display the image using the stored path
