# Deploying

Both environments run k3s (a certified Kubernetes distribution) on ARM, so the same images and manifests run on each:

| | test | prod |
|---|---|---|
| Server | Oracle Always Free, Ampere A1, created by `infra/oci` | Hetzner CAX11 |
| Size | 2 OCPU / 4 GB, the same as prod | 2 vCPU / 4 GB |
| Manifests | `deploy/overlays/test` | `deploy/overlays/prod` (not written yet) |
| Deploys | every push to `main` | manual promotion of a tag that has passed test |

Pin the same `k3s_version` on both servers.

Test is private: with `web_access = "admin"` (the default in `infra/oci`), only your IP (`admin_cidrs`) can reach HTTPS. It uses a free [sslip.io](https://sslip.io) hostname, so it needs no domain. Prod will sit behind Cloudflare on a real domain; see [Cloudflare](#cloudflare).

## Layout

- `base/`: the backend and frontend Deployments and Services, and the Ingress. Only the frontend has an Ingress; the browser reaches the Go server through the Next.js `/backend` proxy.
- `overlays/<env>/`: namespace, image tags, hostname, `APP_ORIGINS`.
- `platform/`: cluster-wide pieces, applied once per cluster: cert-manager, the Let's Encrypt issuers and Traefik settings.
- `../infra/oci/`: OpenTofu for the Oracle server and its network.
- `../.gitlab/agents/oracle-test/`: GitLab agent config, which lets CI deploy without the Kubernetes API being open to the internet.

## One-time setup (test)

1. **Oracle API key**: OCI console → Profile → API keys → Add, then save the config it shows to `~/.oci/config`.
2. **Server**: state is stored in GitLab (Operate → Terraform states → `oracle-test`), so it has locking and history and isn't tied to one laptop. Log in with the GitLab CLI, which stores its token in the macOS Keychain, then initialise through it:
   ```sh
   brew install glab
   glab auth login --hostname gitlab.com --device      # approve in the browser
   cp infra/oci/terraform.tfvars.example infra/oci/terraform.tfvars   # fill in
   glab opentofu init oracle-test -d infra/oci
   cd infra/oci && tofu apply
   ```
   `glab` passes its login token to tofu, which saves it in `infra/oci/.terraform/` (gitignored). That token expires, so when a `tofu` command fails with 401, re-run `glab opentofu init oracle-test -d infra/oci -- -reconfigure`.

   Without `glab`: create a personal access token with the `api` scope, `export TF_HTTP_USERNAME=<username> TF_HTTP_PASSWORD=<token>`, and run `tofu init -backend-config=gitlab.tfbackend`.
   If the apply fails with "Out of host capacity", A1 capacity is full. Retry later or set `availability_domain_index`.
3. **kubectl**: wait a few minutes for cloud-init, then run the `fetch_kubeconfig` output and `export KUBECONFIG=~/.kube/k3s-test.yaml`.
4. **Platform**: `kubectl apply -k deploy/platform`. Run it a second time once `kubectl -n cert-manager get pods` shows the pods ready; the issuers need cert-manager's CRDs.
5. **Hostname**: in `overlays/test/kustomization.yaml`, replace `SERVER-IP.sslip.io` with the `sslip_domain` output (for example `132-145-1-2.sslip.io`). The site is then `https://fxtrax-test.132-145-1-2.sslip.io`. There's no DNS to set up because the address is in the name. Port 80 stays open to everyone so Let's Encrypt can check the server, but the app is only served on 443, which only your IP can reach. If your home IP changes, update `admin_cidrs` and re-apply.
6. **GitLab agent**: lets CI deploy without the Kubernetes API being open to the internet. The agent dials out to GitLab. Register it and store its token in the cluster without printing it:
   ```sh
   AGENT_ID=$(glab api -X POST projects/84575151/cluster_agents -f name=oracle-test | jq .id)
   kubectl apply -f deploy/agents/oracle-test/namespace.yaml
   glab api -X POST projects/84575151/cluster_agents/$AGENT_ID/tokens -f name=k3s-oracle-test | jq -j .token \
     | kubectl -n gitlab-agent create secret generic gitlab-agent-token --from-file=token=/dev/stdin
   kubectl apply -k deploy/agents/oracle-test
   ```
   What CI may do through it is set in `.gitlab/agents/oracle-test/config.yaml`, which GitLab reads from `main`.
7. **Registry access**: the registry is private, so the cluster pulls with a read-only deploy token:
   ```sh
   glab api -X POST projects/84575151/deploy_tokens -f name=k3s-oracle-test-pull -F 'scopes=["read_registry"]' \
     | jq -j '{auths: {"registry.gitlab.com": {username, password: .token, auth: ("\(.username):\(.token)" | @base64)}}}' \
     | kubectl -n fxtrax create secret generic gitlab-registry --type=kubernetes.io/dockerconfigjson --from-file=.dockerconfigjson=/dev/stdin
   ```
8. **Supabase**: set the project the test environment uses as protected CI/CD variables scoped to `test` (only pipelines on `main` can read them):
   ```sh
   glab variable set SUPABASE_URL -v https://<project>.supabase.co -s test -p -r
   glab variable set SUPABASE_KEY -v <publishable key> -s test -p -m -r
   ```

After this, every push to `main` builds the images and deploys them to test.

## CI runner

CI runs on a self-hosted GitLab runner, a second Always Free VM created by `infra/oci` (`runner.tf`). GitLab's own runners have no fixed IPs, so they couldn't reach the private test environment, and the Free tier's 400 compute minutes a month run out after roughly 15 full pipelines. Every job is tagged `oracle-arm`, so GitLab's runners never pick them up.

After `tofu apply` has created the VM, wait for its cloud-init to finish, then register it. The token goes from GitLab straight into the runner's config, without being printed or stored in tofu state:
```sh
RUNNER_IP=$(tofu -chdir=infra/oci output -raw runner_ip)
ssh ubuntu@$RUNNER_IP cloud-init status --wait
glab api -X POST user/runners -f runner_type=project_type -F project_id=84575151 \
    -f description=oracle-arm -F 'tag_list=["oracle-arm"]' -F run_untagged=false -F locked=true \
  | jq -j .token \
  | ssh ubuntu@$RUNNER_IP 'sudo gitlab-runner register --non-interactive --url https://gitlab.com \
      --token "$(cat)" --executor docker --docker-image alpine:3.22 --docker-privileged \
      --description oracle-arm \
    && sudo sed -i "s/^concurrent = .*/concurrent = 2/" /etc/gitlab-runner/config.toml'
```
The runner should then show as online under Settings → CI/CD → Runners. `--docker-privileged` is what Docker-in-Docker image builds need. It's acceptable because the VM only runs this project's pipelines: pipelines for merge requests from forks run in the fork, not here.

## Cloudflare

For an environment on a real domain (prod), all web traffic goes through Cloudflare's proxy. This hides the server's IP, absorbs floods before they reach a 2-CPU box, and gives you a free rate-limiting rule. Set `web_access = "cloudflare"` so the firewall only accepts ports 80/443 from Cloudflare's ranges, and nobody can go around it. In that overlay, keep the default `letsencrypt-cloudflare` issuer and add Cloudflare's ranges to `TRUSTED_PROXIES`.

1. **Add the domain**: Cloudflare dashboard → Add a domain, free plan. At your registrar, replace the nameservers with the two Cloudflare gives you, then wait for the domain to show as Active.
2. **DNS record**: add an `A` record, for example `fxtrax-test` → the server's `public_ip`, with **Proxied** (orange cloud) turned on. Put the full hostname into the overlay's Ingress patch and `APP_ORIGINS`.
3. **SSL/TLS** → Overview: set the mode to **Full (strict)**. Cloudflare then checks the Let's Encrypt certificate on the server, so the connection is encrypted all the way through.
4. **API token for certificates**: My Profile → API Tokens → Create Token → the *Edit zone DNS* template, limited to this zone. cert-manager uses it to prove domain ownership through DNS (DNS-01), so Let's Encrypt never has to reach the firewalled server:
   ```sh
   kubectl -n cert-manager create secret generic cloudflare-api-token --from-literal=api-token=<token>
   ```
5. **Rate limiting rule** (optional, but free): Security → WAF → Rate limiting rules, for example 20 requests per 10 seconds per IP for paths starting `/backend/auth/`, blocking for 10 seconds. It stops floods at Cloudflare's edge; the backend's own per-IP and per-email limits still apply after it.

Cloudflare's IP ranges appear in three places: the firewall (fetched on every `tofu apply`), `deploy/platform/traefik-config.yaml` and `TRUSTED_PROXIES` in each Cloudflare overlay. They rarely change. If they ever do, update the two YAML lists from https://www.cloudflare.com/ips-v4.

## Checking a deploy

After every deploy to test, CI runs two jobs from the runner against the public URL:
- `verify:smoke`: `deploy/tests/smoke/`, nine checks through the full path (TLS, security headers, the backend proxy, a `Secure` session cookie, Supabase, cross-site and oversized requests refused). Results show in the pipeline's Tests tab. Run them locally with `BASE_URL=https://<host> node --test deploy/tests/smoke/smoke.test.mjs`.
- `verify:lighthouse`: Lighthouse CI on the login and sign-up pages, three runs each, failing below the thresholds in `deploy/tests/lighthouse/lighthouserc.cjs`. The HTML reports are kept as job artifacts for 30 days.

By hand:

- `curl -I https://<host>` should return 200 with a valid certificate.
- Log in and check that the `Set-Cookie` header for the session cookie includes `Secure`. That only happens if `X-Forwarded-Proto` makes it through Traefik and the Next.js proxy.
