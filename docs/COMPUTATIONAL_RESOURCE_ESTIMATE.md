# Computational Resource Estimate — GEOOBS-AI

## Current (Frontend Only)

| Resource | Requirement | Notes |
|----------|-------------|-------|
| CPU | 2+ cores | Feature detection is CPU-bound |
| RAM | 512MB-2GB | Depends on image size |
| Disk | 100MB | Application + data |
| GPU | Not required | Classical CV only |
| Network | None | Fully local |

## Target (Full System)

### Development Environment
| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 4 cores | 8+ cores |
| RAM | 8GB | 16GB+ |
| Disk | 10GB | 50GB+ |
| GPU | None | NVIDIA 8GB+ VRAM |
| Network | None | For package downloads |

### Production (Single Node)
| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 8 cores | 16+ cores |
| RAM | 16GB | 32GB+ |
| Disk | 100GB | 500GB+ (SSD) |
| GPU | None | NVIDIA T4/A10 (optional) |
| Network | Internal | 1Gbps+ |

### Production (Docker Compose)
| Service | CPU | RAM | GPU | Disk |
|---------|-----|-----|-----|------|
| Frontend (nginx) | 0.5 | 128MB | No | 100MB |
| Backend (Node.js) | 1 | 512MB | No | 1GB |
| Scientific (Python) | 2-4 | 2-4GB | Optional | 5GB |
| Database (PostgreSQL) | 1 | 1GB | No | 10GB+ |
| Storage (MinIO) | 0.5 | 512MB | No | 100GB+ |

## Training Resources

| Task | CPU | RAM | GPU | Time (est.) |
|------|-----|-----|-----|-------------|
| Classical CV experiments | 2 cores | 2GB | No | seconds |
| DL model training (small) | 4 cores | 8GB | T4 | hours |
| DL model training (large) | 8 cores | 16GB | A100 | days |
| Inference (classical) | 1 core | 500MB | No | ms per image |
| Inference (DL, ONNX CPU) | 2 cores | 1GB | No | 100-500ms |
| Inference (DL, ONNX GPU) | 1 core | 500MB | T4 | 10-50ms |

## Scaling Considerations

- **Horizontal**: Multiple scientific service instances behind load balancer
- **Vertical**: Larger GPU for bigger models
- **Storage**: S3-compatible for large datasets and model artifacts
- **Database**: PostgreSQL with read replicas for concurrent access

## Cost Estimate (Cloud, Optional)

| Provider | Configuration | Monthly Cost (est.) |
|----------|---------------|---------------------|
| Local | Own hardware | Electricity only |
| AWS | t3.xlarge + no GPU | ~$150/month |
| AWS | g4dn.xlarge (T4 GPU) | ~$500/month |
| Azure | D8s v5 + no GPU | ~$140/month |
| GCP | n2-standard-8 | ~$130/month |

Note: No cloud dependency is required. The system is designed for local-first deployment.
