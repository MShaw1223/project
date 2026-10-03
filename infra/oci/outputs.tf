output "public_ip" {
  value = oci_core_instance.k3s.public_ip
}

output "sslip_domain" {
  description = "Free wildcard DNS for the server: <anything>.<this> resolves to its IP"
  value       = "${replace(oci_core_instance.k3s.public_ip, ".", "-")}.sslip.io"
}

output "ssh" {
  value = "ssh ubuntu@${oci_core_instance.k3s.public_ip}"
}

output "fetch_kubeconfig" {
  description = "Run once cloud-init has finished (a few minutes after creation)"
  value       = "ssh ubuntu@${oci_core_instance.k3s.public_ip} sudo cat /etc/rancher/k3s/k3s.yaml | sed 's/127.0.0.1/${oci_core_instance.k3s.public_ip}/' > ~/.kube/${var.name}.yaml"
}

output "runner_ip" {
  value = var.runner_enabled ? oci_core_instance.runner[0].public_ip : null
}
