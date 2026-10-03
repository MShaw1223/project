# Self-hosted GitLab runner. It has its own subnet and security list, so the test server's security list
# can allow the runner's public IP without a dependency cycle. It needs no inbound access beyond SSH: the
# runner polls GitLab for jobs.

resource "oci_core_security_list" "ci" {
  count          = var.runner_enabled ? 1 : 0
  compartment_id = local.compartment_id
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.name}-ci"

  egress_security_rules {
    destination = "0.0.0.0/0"
    protocol    = "all"
  }

  dynamic "ingress_security_rules" {
    for_each = var.admin_cidrs
    content {
      source   = ingress_security_rules.value
      protocol = "6"
      tcp_options {
        min = 22
        max = 22
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

resource "oci_core_subnet" "ci" {
  count             = var.runner_enabled ? 1 : 0
  compartment_id    = local.compartment_id
  vcn_id            = oci_core_vcn.main.id
  display_name      = "${var.name}-ci"
  cidr_block        = "10.0.2.0/24"
  dns_label         = "ci"
  route_table_id    = oci_core_route_table.public.id
  security_list_ids = [oci_core_security_list.ci[0].id]
}

resource "oci_core_instance" "runner" {
  count               = var.runner_enabled ? 1 : 0
  compartment_id      = local.compartment_id
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[var.availability_domain_index].name
  display_name        = "${var.name}-runner"
  shape               = "VM.Standard.A1.Flex"

  shape_config {
    ocpus         = var.runner_ocpus
    memory_in_gbs = var.runner_memory_gbs
  }

  source_details {
    source_type             = "image"
    source_id               = data.oci_core_images.ubuntu.images[0].id
    boot_volume_size_in_gbs = var.runner_boot_volume_gbs
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.ci[0].id
    assign_public_ip = true
    hostname_label   = "runner"
  }

  metadata = {
    ssh_authorized_keys = file(pathexpand(var.ssh_public_key_path))
    user_data           = base64encode(file("${path.module}/runner-cloud-init.yaml"))
  }

  lifecycle {
    ignore_changes = [source_details[0].source_id, metadata]
  }
}
