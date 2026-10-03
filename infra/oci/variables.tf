variable "tenancy_ocid" {
  description = "Tenancy OCID, from ~/.oci/config"
  type        = string
}

variable "compartment_ocid" {
  description = "Compartment to create everything in; defaults to the tenancy (root) compartment"
  type        = string
  default     = null
}

variable "region" {
  description = "Your home region (Always Free compute only runs there), eg uk-london-1"
  type        = string
}

variable "oci_profile" {
  type    = string
  default = "DEFAULT"
}

variable "name" {
  type    = string
  default = "k3s-test"
}

variable "ssh_public_key_path" {
  type    = string
  default = "~/.ssh/id_ed25519.pub"
}

variable "admin_cidrs" {
  description = "Addresses allowed to reach SSH and the Kubernetes API, eg [\"203.0.113.7/32\"]"
  type        = list(string)
}

variable "web_access" {
  description = <<-EOT
    Who may reach HTTPS (443):
      admin      - only admin_cidrs: a private test environment. Port 80 stays open to everyone so Let's
                   Encrypt can validate certificates; the app itself is only served on 443
      cloudflare - only Cloudflare's edge, for a domain proxied by Cloudflare
      public     - anyone
  EOT
  type        = string
  default     = "admin"
  validation {
    condition     = contains(["admin", "cloudflare", "public"], var.web_access)
    error_message = "web_access must be admin, cloudflare or public."
  }
}

# Sized like prod (Hetzner CAX11: 2 ARM vCPU / 4 GB / 40 GB) so test shows whether things fit there.
# Always Free allows up to 4 OCPUs / 24 GB of Ampere A1 and 200 GB of block storage in total.
variable "ocpus" {
  type    = number
  default = 2
}

variable "memory_gbs" {
  type    = number
  default = 4
}

variable "boot_volume_gbs" {
  type    = number
  default = 50 # OCI's minimum
}

variable "availability_domain_index" {
  description = "Try another AD if creation fails with \"Out of host capacity\""
  type        = number
  default     = 0
}

variable "k3s_version" {
  description = "Exact k3s release, eg v1.33.5+k3s1; use the same one on prod. Empty installs the latest stable"
  type        = string
  default     = ""
}

variable "runner_enabled" {
  description = "A self-hosted GitLab runner VM: CI jobs run on it instead of GitLab's (saving the Free tier's compute minutes), and its fixed IP may reach the test environment"
  type        = bool
  default     = true
}

# what's left of the Always Free allowance next to the test server
variable "runner_ocpus" {
  type    = number
  default = 2
}

variable "runner_memory_gbs" {
  type    = number
  default = 12
}

variable "runner_boot_volume_gbs" {
  description = "Room for the Docker images and build caches CI jobs leave behind"
  type        = number
  default     = 100
}
