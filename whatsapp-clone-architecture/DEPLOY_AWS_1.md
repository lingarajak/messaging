# Deploy to AWS EKS

## Prerequisites
1. AWS CLI configured: `aws configure`
2. Terraform: `brew install terraform`
3. kubectl: `brew install kubectl`
4. helm: `brew install helm`

## Step 1: Provision Infrastructure
```bash
cd infra/terraform/aws
terraform init
terraform apply -auto-approve
```
This creates: EKS cluster, RDS Postgres, ElastiCache Redis, MSK Kafka, S3 buckets

## Step 2: Configure kubectl
```bash
aws eks update-kubeconfig --name whatsapp-clone --region us-east-1
```

## Step 3: Deploy Services with Helm
```bash
cd ../../k8s
helm upgrade --install whatsapp ./chart   --set secrets.postgres.password=$TF_VAR_db_password   --set secrets.redis.url=$TF_VAR_redis_url
```

## Step 4: Get LoadBalancer URL
```bash
kubectl get svc chat-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

## Step 5: FCM/APNs Setup
1. Add `serviceAccountKey.json` to `services/notification-service/`
2. `kubectl create secret generic fcm-key --from-file=serviceAccountKey.json`
3. Restart notification-service pods

Total cost estimate: ~$200/mo for dev, ~$2k/mo for 100k MAU
