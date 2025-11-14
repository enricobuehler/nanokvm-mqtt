# nanokvm-mqtt

Exposes NanoKVM API via MQTT with support for home assistant autodiscovery/config.

## Implementation

This project is built with TypeScript and enforces runtime type safety where possible by using [zod](https://zod.dev).

## Disclaimer

Please read the License and understand that this program comes with **no warranties or guarantees**.

**Critical Security Warning:** Exposing a KVM (Keyboard, Video, Mouse) device over a network creates significant security risks, as it provides direct access to connected systems. Carefully review our security advisories below before deployment.

## Usage

1. Clone the repository
2. Create one or multiple client configs like ```xxx.client.json```
3. **Option A (recommended)** Use docker-compose like in the provided example ```docker-compose.example.yml```
3. **Option B** Install bun and run via ```bun run build && bun run start```
4. Your NanoKVM(s) should now show up in home assistant via autodiscovery

## Security Notices

### NanoKVM

**Critical vulnerability:** The NanoKVM firmware currently uses a hardcoded secret key for authentication.
Thats only one of the many security flaws.
By default, this project includes the known hardcoded secret for compatibility.

We strongly recommend blocking every connection going in and out of the NanoKVM by default,
and only allow as narrow access as possible to the web server (port 80) with return traffic.
Its also recommended to only enable SSH when you need it.

### Additional Security Recommendations

- **TLS/SSL:** Use encrypted MQTT connections (mqtts://) with valid certificates
- **MQTT Authentication:** Enable username/password authentication on your MQTT broker
- **Access Control:** Implement MQTT ACLs (Access Control Lists) to restrict topic access
- **Firewall Rules:** Block external access; only allow connections from trusted IPs
- **Regular Updates:** Monitor for NanoKVM firmware and dependency updates

### Usage with Home Assistant

**Think carefully before integrating this with Home Assistant**, especially if:

- Your Home Assistant instance is publicly accessible
- You use cloud-based integrations or remote access features
- Multiple users have access to your Home Assistant dashboard

**Recommended mitigations:**

- Keep Home Assistant on a private network only
- Use VPN access instead of port forwarding
- Monitor access logs regularly
- Consider if you truly need KVM control through Home Assistant

### Known Risks

Potential attack vectors include:

- Unauthorized access to connected computers/servers
- Keystroke injection and command execution
- Screen capture and information disclosure
- BIOS/firmware manipulation on connected systems
- Lateral movement within your network
