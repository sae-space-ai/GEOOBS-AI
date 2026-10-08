# Security and Sovereignty — GEOOBS-AI

## Principles

1. **Local-first**: All processing occurs locally unless explicitly configured otherwise
2. **No external transmission**: Data is never sent to external services without explicit authorization
3. **Input validation**: All files are validated for type, size, and structure before processing
4. **No arbitrary execution**: No code execution from external sources or AI-generated commands
5. **Secret management**: Secrets stored only in environment variables or server-side configuration
6. **Audit trail**: Every operation is logged with timestamp, actor, and resource

## Current Implementation

### Input Validation
- File type checking (MIME type and extension)
- Size limits (50MB per file in frontend)
- No path traversal (browser File API sandboxed)
- No arbitrary code execution

### Data Isolation
- All data stays in browser memory/localStorage
- No network requests to external APIs
- No telemetry or analytics
- No third-party data processing

### Audit Trail
- Every operation logged with UUID, timestamp, and details
- Processing chain fully traceable
- Observable records include source file ID and chain ID

## Planned Security Enhancements

1. **Authentication**: JWT-based auth for backend API
2. **Authorization**: Role-based access control
3. **Encryption**: At-rest encryption for sensitive data
4. **Integrity**: SHA-256 checksums for all stored data
5. **Rate limiting**: Backend API rate limiting
6. **CSP**: Content Security Policy headers
7. **Dependency scanning**: Automated vulnerability scanning

## Sovereignty

- No dependency on cloud providers for core functionality
- No proprietary format lock-in
- Open standards: JSON, CSV, NetCDF-CF
- Open licenses: All dependencies are MIT, BSD, or Apache-2.0
- Portable: Can run on any OS with Node.js and Python

## AI Safety

- AI assistants (if integrated) generate operations, not direct commands
- All AI-generated operations are typed, validated, and require confirmation
- No automatic execution of arbitrary instructions
- Human-in-the-loop for all critical operations
