#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-linuxia-dep-prod}"
REGION="${REGION:-us-central1}"
REPOSITORY="${REPOSITORY:-spark}"
SERVICE_NAME="${SERVICE_NAME:-depaneuria-phone-gateway-dev}"
IMAGE_NAME="${IMAGE_NAME:-depaneuria-phone-gateway}"
SERVICE_ACCOUNT="${SERVICE_ACCOUNT:-sa-image-gen@linuxia-dep-prod.iam.gserviceaccount.com}"

IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}:$(git rev-parse --short HEAD)"

echo "PROJECT_ID=${PROJECT_ID}"
echo "REGION=${REGION}"
echo "REPOSITORY=${REPOSITORY}"
echo "SERVICE_NAME=${SERVICE_NAME}"
echo "IMAGE_URI=${IMAGE_URI}"
echo "SERVICE_ACCOUNT=${SERVICE_ACCOUNT}"

if [[ "${DRY_RUN:-0}" == "1" ]]; then
  echo "[DRY RUN] gcloud auth configure-docker ${REGION}-docker.pkg.dev"
  echo "[DRY RUN] docker build -f apps/phone-gateway/Dockerfile -t ${IMAGE_URI} ."
  echo "[DRY RUN] docker push ${IMAGE_URI}"
  echo "[DRY RUN] gcloud run deploy ${SERVICE_NAME} --image ${IMAGE_URI} --project ${PROJECT_ID} --region ${REGION} --platform managed --allow-unauthenticated --port 8080 --service-account ${SERVICE_ACCOUNT}"
  exit 0
fi

gcloud auth configure-docker "${REGION}-docker.pkg.dev"

docker build -f apps/phone-gateway/Dockerfile -t "${IMAGE_URI}" .
docker push "${IMAGE_URI}"

gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE_URI}" \
  --project "${PROJECT_ID}" \
  --region "${REGION}" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --service-account "${SERVICE_ACCOUNT}"
