terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }

  backend "s3" {
    bucket = "campus-erp-terraform-state"
    key    = "infrastructure/terraform.tfstate"
    region = "ap-south-1"
  }
}

provider "aws" {
  region = var.aws_region
}

module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = "campus-erp-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["ap-south-1a", "ap-south-1b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = true
  enable_vpn_gateway = false
  tags = {
    Environment = "production"
    Project     = "campus-erp"
  }
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "19.15.0"

  cluster_name    = "campus-erp-cluster"
  cluster_version = "1.28"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  node_groups = {
    main = {
      desired_capacity = 3
      max_capacity     = 10
      min_capacity     = 2

      instance_types = ["t3.medium"]
      disk_size      = 50
    }
  }

  tags = {
    Environment = "production"
    Project     = "campus-erp"
  }
}

module "rds" {
  source = "terraform-aws-modules/rds/aws"
  version = "6.0.0"

  identifier = "campus-erp-db"

  engine               = "postgres"
  engine_version       = "16"
  family               = "postgres16"
  major_engine_version = "16"
  instance_class       = "db.t3.medium"

  allocated_storage     = 50
  max_allocated_storage = 100

  db_name  = "campus_erp"
  username = "campus"
  password = random_password.db_password.result
  port     = 5432

  vpc_security_group_ids = [module.vpc.default_security_group_id]

  maintenance_window = "Mon:00:00-Mon:03:00"
  backup_window      = "03:00-06:00"

  backup_retention_period = 30

  tags = {
    Environment = "production"
    Project     = "campus-erp"
  }
}

resource "random_password" "db_password" {
  length  = 16
  special = false
}

resource "aws_s3_bucket" "uploads" {
  bucket = "campus-erp-uploads-${var.environment}"
  acl    = "private"

  versioning {
    enabled = true
  }

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }

  tags = {
    Environment = var.environment
    Project     = "campus-erp"
  }
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "campus-erp-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379

  subnet_group_name = aws_elasticache_subnet_group.redis.name

  tags = {
    Environment = var.environment
    Project     = "campus-erp"
  }
}

resource "aws_elasticache_subnet_group" "redis" {
  name       = "campus-erp-redis-subnet"
  subnet_ids = module.vpc.private_subnets
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}
