terraform {
  required_version = ">= 1.6"

  # state lives in GitLab (Operate > Terraform states), with locking and history; addresses are in
  # gitlab.tfbackend, credentials come from TF_HTTP_USERNAME / TF_HTTP_PASSWORD (see README.md)
  backend "http" {}
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 7.0"
    }
    http = {
      source  = "hashicorp/http"
      version = "~> 3.4"
    }
  }
}

# authenticates with the API key in ~/.oci/config (see README)
provider "oci" {
  region              = var.region
  config_file_profile = var.oci_profile
}
