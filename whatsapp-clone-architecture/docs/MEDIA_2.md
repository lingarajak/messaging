# Media Upload
1. Client requests POST /v1/media/upload-url
2. Gets pre-signed S3 URL, uploads directly to MinIO
3. Sends message with {type: 'image', mediaKey: 'uploads/uuid.jpg'}
4. Recipient fetches via CDN
