# Cloudflare's edge addresses; the VCN is IPv4 only, so Cloudflare always connects over IPv4
data "http" "cloudflare_ipv4" {
  url = "https://www.cloudflare.com/ips-v4"
}

locals {
  compartment_id  = coalesce(var.compartment_ocid, var.tenancy_ocid)
  cloudflare_ipv4 = compact(split("\n", data.http.cloudflare_ipv4.response_body))
  # the CI runner may always reach HTTPS, to test deployments: by its public IP, and by its subnet in
  # case the VCN routes the traffic internally
  ci_sources = var.runner_enabled ? ["${oci_core_instance.runner[0].public_ip}/32", oci_core_subnet.ci[0].cidr_block] : []
  https_sources = concat({
    admin      = var.admin_cidrs
    cloudflare = local.cloudflare_ipv4
    public     = ["0.0.0.0/0"]
  }[var.web_access], local.ci_sources)
  # Let's Encrypt's HTTP-01 check comes from anywhere; behind Cloudflare certificates use DNS-01 instead
  http_sources = var.web_access == "cloudflare" ? local.cloudflare_ipv4 : ["0.0.0.0/0"]
}

resource "oci_core_vcn" "main" {
  compartment_id = local.compartment_id
  display_name   = var.name
  cidr_blocks    = ["10.0.0.0/16"]
  dns_label      = "main"
}

resource "oci_core_internet_gateway" "main" {
  compartment_id = local.compartment_id
  vcn_id         = oci_core_vcn.main.id
  display_name   = var.name
}

resource "oci_core_route_table" "public" {
  compartment_id = local.compartment_id
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.name}-public"
  route_rules {
    destination       = "0.0.0.0/0"
    network_entity_id = oci_core_internet_gateway.main.id
  }
}

resource "oci_core_security_list" "public" {
  compartment_id = local.compartment_id
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.name}-public"

  egress_security_rules {
    destination = "0.0.0.0/0"
    protocol    = "all"
  }

  # HTTP and HTTPS, see web_access
  dynamic "ingress_security_rules" {
    for_each = concat(
      [for cidr in local.http_sources : { source = cidr, port = 80 }],
      [for cidr in local.https_sources : { source = cidr, port = 443 }],
    )
    content {
      source   = ingress_security_rules.value.source
      protocol = "6"
      tcp_options {
        min = ingress_security_rules.value.port
        max = ingress_security_rules.value.port
      }
    }
  }

  # SSH and the k3s API only from admin addresses; CI reaches the cluster through the GitLab agent
  dynamic "ingress_security_rules" {
    for_each = setproduct(var.admin_cidrs, [22, 6443])
    content {
      source   = ingress_security_rules.value[0]
      protocol = "6"
      tcp_options {
        min = ingress_security_rules.value[1]
        max = ingress_security_rules.value[1]
      }
    }
  }

  # path MTU discovery
  ingress_security_rules {
    source   = "0.0.0.0/0"
    protocol = "1"
    icmp_options {
      type = 3
      code = 4
    }
  }
}

resource "oci_core_subnet" "public" {
  compartment_id    = local.compartment_id
  vcn_id            = oci_core_vcn.main.id
  display_name      = "${var.name}-public"
  cidr_block        = "10.0.1.0/24"
  dns_label         = "public"
  route_table_id    = oci_core_route_table.public.id
  security_list_ids = [oci_core_security_list.public.id]
}
