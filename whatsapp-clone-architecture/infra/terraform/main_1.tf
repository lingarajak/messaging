provider "aws" {
  region = "us-east-1"
}

module "eks" {
  source          = "terraform-aws-modules/eks/aws"
  cluster_name    = "whatsapp-clone"
  cluster_version = "1.28"
  subnets         = ["subnet-xxx", "subnet-yyy"]
  vpc_id          = "vpc-xxx"
  
  node_groups = {
    main = {
      desired_capacity = 3
      max_capacity     = 10
      instance_types   = ["t3.medium"]
    }
  }
}

resource "aws_rds_cluster" "postgres" {
  cluster_identifier = "whatsapp-db"
  engine             = "aurora-postgresql"
  master_username    = "admin"
  master_password    = "changeme"
  skip_final_snapshot = true
}

resource "aws_elasticache_replication_group" "redis" {
  replication_group_id = "whatsapp-redis"
  description          = "Redis for presence"
  node_type            = "cache.t3.micro"
  num_cache_clusters   = 2
}
