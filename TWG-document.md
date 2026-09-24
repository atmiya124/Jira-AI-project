Install & Setup TWG CLI
On This Page
1. CLI installation mode
2. Agent installation mode
Verify setup
Try it
Upgrade
Uninstall
Beta upgrades
Feedback
Next steps
1. CLI installation mode
Use this mode when you want to install and authenticate TWG CLI directly from your terminal.

Before you begin
You need macOS (arm64 or x64), Linux (x64), or Windows (arm64 or x64).
You need an Atlassian account with access to the products you want to use.
To use TWG CLI through an agent after CLI setup, you need an AI coding agent installed on your computer.
The TWG CLI binary does not require a separate runtime (for example, no Node.js).

Step 1: Install TWG CLI
macOS and Linux
Recommended:


 
curl -fsSL --retry 2 https://teamwork-graph.atlassian.com/cli/install | bash

During setup:

First-time consent and OAuth login require a controlling terminal.
Setup installs and refreshes TWG agent skills.
The installer opens your browser to sign in with OAuth. Sign in to Atlassian, select the site you want to authorize (auto-selected if you have access to only one), review the requested permissions, and select Accept.
After core setup and twg doctor pass, setup may offer to configure the optional Bitbucket token. If you skip it, TWG CLI is still ready for non-Bitbucket commands.
The installer completes setup and runs twg doctor automatically. To repair setup later:


 
twg setup

Run installation from a terminal when consent or login is needed. Runtime TWG_* credentials authenticate commands and twg doctor, but are not used by login.

On macOS, setup may enable a background helper and show a system notification for Atlassian Pty Ltd or twg. This is expected; see Configure OAuth 2.1 for details.

To install a specific version:


 
curl -fsSL --retry 2 https://teamwork-graph.atlassian.com/cli/install | bash -s -- --version 0.9.1

If ~/.local/bin is not in your PATH, the installer prints the exact line to add to your shell profile.

Install with the macOS package
Use the signed, universal macOS package when you need a system-wide or managed installation. Download install.pkg, open it in Finder, and follow the installer prompts. The package installs twg to /usr/local/bin/twg and requires an administrator password.

To install it from a terminal instead:


 
curl -fL https://teamwork-graph.atlassian.com/cli/install.pkg -o twg.pkg
sudo installer -pkg twg.pkg -target /

The package installs only the CLI binary. Open a new terminal and complete the per-user setup:


 
twg setup
twg doctor

To upgrade a package-managed installation, install the latest package again or use your organization's device-management process. twg upgrade does not upgrade package-managed installations.

Windows
Windows: SmartScreen may warn about the installer — choose More info → Run anyway. Pre-release builds may not yet use a production code signature; that is expected until generally available signed binaries ship.

Use Windows PowerShell or Command Prompt for Windows installation. Don't run the Windows installer from Git Bash, MINGW, WSL, or another bash-like shell.

Install — PowerShell

 
curl.exe -fsSL https://teamwork-graph.atlassian.com/cli/install.ps1 -o twg-install.ps1
powershell -ExecutionPolicy Bypass -File .\twg-install.ps1

Install — Command Prompt (cmd)
curl is built into Windows 10 1803 and later. If you're on an older version, use the PowerShell method above instead.


 
curl.exe -fsSL https://teamwork-graph.atlassian.com/cli/install.ps1 -o twg-install.ps1
powershell -ExecutionPolicy Bypass -File twg-install.ps1

The Windows installer performs the same interactive setup as macOS and Linux: binary install, checksum verification, consent, skill install, OAuth login, and doctor verification.

Install with a Windows MSI
Use the signed MSI when you need a system-wide or managed installation. Choose the package that matches your device:

Windows x64 MSI for most Windows PCs
Windows ARM64 MSI for Windows on ARM
Download the MSI, then double-click it and approve the administrator prompt. To install from PowerShell, download the matching package and run msiexec:


 
Invoke-WebRequest https://teamwork-graph.atlassian.com/cli/twg-windows-x64.msi -OutFile twg-windows-x64.msi
msiexec.exe /i .\twg-windows-x64.msi

For Windows on ARM, replace x64 with arm64 in both commands. The MSI installs twg.exe to C:\Program Files\twg and adds that directory to the machine PATH.

The MSI installs only the CLI binary. Open a new PowerShell or Command Prompt window, then complete the per-user setup:


 
twg setup
twg doctor

To update an MSI-managed installation, install the latest MSI again or use your organization's device-management process. twg update does not update MSI-managed installations.

Run the Windows installer from a console when consent or login is needed. Runtime TWG_* credentials authenticate commands and twg doctor, but are not used by login.

During setup, the installer:

Opens your browser to sign in with OAuth. In the browser, select the site you want to authorize (auto-selected if you have access to only one), review the requested permissions, and select Accept.
Offers the optional Bitbucket token step. You can skip this unless you plan to use Bitbucket-specific commands.
Credentials are saved in the TWG config directory and reused across sessions. For re-authentication and the Bitbucket token, see Configure OAuth 2.1.

After installation, open a new PowerShell or Command Prompt window and run:


 
twg doctor

If Windows doesn't recognize twg, close and reopen the terminal so PATH changes are loaded, then try again.

2. Agent installation mode
Use this mode when you want an AI coding agent to install TWG CLI, authenticate, and set up agent skills for you.

  the following prompt and paste it into your agent:


 
Install/setup TWG using https://teamwork-graph.atlassian.com/cli/AGENTS.md

The agent should use that hosted AGENTS.md directly. There are no separate agent-specific install URLs.

Verify setup
Run:


 
twg doctor

This checks authentication, connectivity, and build info. It works the same on macOS, Linux, PowerShell, and cmd.

Try it
Your AI coding agent can now access your Atlassian data across Jira, Confluence, Bitbucket, and more. Describe what you want in plain language and your agent handles the rest:

"Summarize the work I did this week"
"What are my open Jira issues?"
"Create a Confluence page about our Q2 goals"
"Show the current sprint for my team"
See Agent examples for more prompts to try.

To discover command syntax directly in the terminal, run:


 
twg --help
twg confluence --help
twg jira --help

Upgrade
Run the built-in upgrader:


 
twg upgrade

TWG CLI checks for upgrades during normal use and notifies you when a new version is available.

Uninstall
Preview the files and configs that would be removed:


 
twg uninstall --dry-run

Uninstall asks for confirmation, revokes stored credentials, and removes the binary, installer-owned skill bundles, PATH changes, caches, consent, and all local TWG configs:


 
twg uninstall

Beta upgrades
To receive pre-release upgrades before they reach the stable channel, use the beta channel.

First install via beta

 
bash <(curl -fsSL https://teamwork-graph.atlassian.com/cli/beta/install)

Installs from the beta channel record the channel preference automatically — future twg upgrade calls continue to check the beta channel.

Switch an existing install to beta

 
twg upgrade --channel beta

Switch back to stable

 
twg upgrade --channel stable

Beta releases are usually ahead of stable, so returning to stable normally means moving your binary to an older version. In that case, the command records the stable preference, reports the version difference, and leaves the binary alone. To install the stable release over the newer beta build, confirm the downgrade:


 
twg upgrade --channel stable --yes

Until you confirm, twg upgrade and twg upgrade --check report that your installed build is ahead of the channel you follow, along with the command that resolves it, instead of reporting that the CLI is up to date.

Feedback
To share feedback or report an issue, use the CLI:


 
twg feedback --summary "<short title>"

The command opens a prefilled public form in interactive terminals. In agent, structured-output, or non-interactive runs, it prints the form URL instead. Your configured TWG account email is prefilled when available. Review the details, provide an email if needed, complete reCAPTCHA, and submit the form. TWG authentication is not required.

You can also open the TWG CLI feedback form directly.


How authentication works
On This Page
OAuth 2.1
Bitbucket
Permissions are always respected
Token lifecycle
Experimental encrypted credential storage
Next steps
Teamwork Graph CLI (TWG CLI) authenticates you with Atlassian and uses your existing permissions when it accesses data. Your credentials are stored locally and reused across commands.

TWG CLI uses OAuth 2.1 as its only supported authentication method. The one exception is Bitbucket, which isn't covered by OAuth yet and requires a separate Bitbucket token.

TWG CLI never asks you to paste or share an authentication token in a prompt, chat, or conversation. If an agent or tool asks for one, don't share it. Enter tokens only through the secure terminal prompts provided by TWG CLI.

OAuth 2.1
When you run twg login, TWG CLI opens a browser where you sign in to Atlassian and grant access. Your credentials are saved locally and refreshed automatically, so you usually won't need to sign in again.

To set up OAuth 2.1, see Configure OAuth 2.1.

Admin authentication
Site and organization admin authentication use an Atlassian Admin API key limited to your organization. The key is stored separately from your personal credentials.

To authenticate as an admin, run:


 
twg admin auth login --email <your-email> --org <your-org-id>

Bitbucket
Bitbucket is the only exception to OAuth support. Its commands require a separate Bitbucket token, set up independently with twg setup bitbucket.

Permissions are always respected
TWG CLI can read or modify only the Atlassian data your account already has access to. Authentication does not grant additional permissions.

Token lifecycle
OAuth access tokens expire after 8 hours. TWG CLI refreshes credentials while commands run, but an agent sandbox may block refresh. During installation, twg setup enables the upkeep helper, which runs outside agent sandboxes and refreshes credentials in the background. You can also enable it later with twg upkeep enable. After 30 days without use, the refresh token expires and TWG CLI asks you to sign in again.

You can re-authenticate at any time by running:


 
twg login --force

To revoke your OAuth token, run:


 
twg logout

Organization admins can revoke active TWG CLI sessions after changing OAuth permissions in Atlassian Administration. You must sign in again before TWG CLI can use the updated permissions.

Experimental encrypted credential storage
TWG CLI now has an experimental option to store encrypted credentials in its vault at auth-storage/auth.db, instead of auth.conf. Its root key is stored separately: in the OS vault on macOS and Windows, or in the TWG_AUTH_STORAGE_KEY environment variable on Linux. This helps protect credentials from software that can inspect local files but cannot access the root key.

This option is not enabled automatically. Existing credentials continue to use auth.conf until you migrate them. New users can save their first login directly to encrypted storage. See Enable experimental encrypted credential storage.

Platform	Root key
macOS	macOS Keychain
Windows	Windows Credential Manager
Linux	TWG_AUTH_STORAGE_KEY; Linux does not use an OS vault.
After setup, twg doctor --basic shows which storage method is in use. The auth.db path identifies the encrypted database; the root key is stored separately.


Configure OAuth 2.1
On This Page
Sign in with OAuth 2.1
Enable experimental encrypted credential storage
Verify encrypted storage
Re-authenticate
Refresh OAuth credentials
OAuth upkeep background helper
Bitbucket authentication
Next steps
OAuth 2.1 is the only supported sign-in method for Atlassian data in Teamwork Graph CLI (TWG CLI). Bitbucket commands use a separate token. TWG CLI stores credentials under ~/.config/twg/ on macOS and Linux, or %APPDATA%\twg on Windows.

To learn how authentication works, see How authentication works.

Sign in with OAuth 2.1
In your terminal, run:


 
twg login

TWG CLI displays a verification URL and short code, then opens your browser. If it doesn't open,   the URL and open it manually.

In your browser:

Select the site to authorize, if prompted.
Review the requested permissions and select Accept.
Return to your terminal. TWG CLI confirms when your credentials are saved.

Enable experimental encrypted credential storage
TWG CLI now has an experimental option to store encrypted credentials in its vault at auth-storage/auth.db. Its root key is stored separately: in the OS vault on macOS and Windows, or in the TWG_AUTH_STORAGE_KEY environment variable on Linux. This helps protect credentials from software that can inspect local files but cannot access the root key.

Platform	Root key	Instructions
macOS	macOS Keychain	macOS
Windows	Windows Credential Manager	Windows
Linux	TWG_AUTH_STORAGE_KEY environment variable	Linux
macOS
Encrypted storage uses macOS Keychain for the root key.

If you already use TWG CLI, migrate your existing credentials:


 
twg auth storage migrate

This detects your active storage and asks before migrating to the other backend. With auth.conf active, it copies your credentials to encrypted storage, then deletes auth.conf so TWG CLI uses auth.db. With encrypted storage active, it copies the selected profile back to auth.conf, then resets encrypted storage and its other profile slots. Use --yes for an already-confirmed script.

If you are signing in for the first time, save the login directly to encrypted storage:


 
TWG_SECRET_STORE=keychain twg login --force --oauth

TWG_SECRET_STORE only applies to login; it does not need to remain set.

Windows
Encrypted storage uses Windows Credential Manager for the root key.

In PowerShell, migrate existing credentials:


 
twg auth storage migrate

If you are signing in for the first time:


 
$env:TWG_SECRET_STORE = "keychain"; twg login --force --oauth

In Command Prompt, migrate existing credentials:


 
twg auth storage migrate

If you are signing in for the first time:


 
set TWG_SECRET_STORE=keychain && twg login --force --oauth

The setting applies only to the current shell session; you do not need to persist it.

Linux
Linux does not use an OS vault for this option. Provide the root key with TWG_AUTH_STORAGE_KEY for each command:

To migrate existing credentials:


 
TWG_AUTH_STORAGE_KEY=<your-key> twg auth storage migrate

If you are signing in for the first time:


 
TWG_SECRET_STORE=keychain TWG_AUTH_STORAGE_KEY=<your-key> twg login --force --oauth

The TWG_AUTH_STORAGE_KEY value must be an unpadded base64url encoding of a random 32-byte root key. It is used instead of an OS vault for that command. For example:


 
TWG_AUTH_STORAGE_KEY=8XecAMpUKloUsQfQnmk_y0PEgOB4p4lIsvFjL1d0TT8

Generate and protect your own key; do not reuse this example.

Verify encrypted storage
After either path, use twg doctor --basic to confirm which storage method is in use:


 
twg doctor --basic

On macOS with encrypted storage enabled, the output includes an entry like this:


 
Build
  Version: 1.2.8
  Commit: abcdef
  Profile: external
  Built at: 1 minute ago

Connectivity
  Status: ok
  Token: valid
  Auth source: ~/.config/twg/auth-storage/auth.db (encrypted; root key in OS vault)
  Message: Authenticated successfully. OAuth token is valid for the configured endpoint.

The auth.db file contains encrypted credentials. The root key is held separately by Keychain or Windows Credential Manager. On Linux, it is supplied through TWG_AUTH_STORAGE_KEY instead.

Coding-agent access
A coding agent using encrypted storage needs:

Permission to read the relevant macOS Keychain or Windows Credential Manager item, or access to TWG_AUTH_STORAGE_KEY on Linux.
Read access to the active TWG config directory and auth.db.
Write access to the config directory when refreshing credentials, logging in, or recovering an interrupted database update. The CLI may need to create temporary files while saving changes.
Give the agent only the access it needs. Keep the root key and OAuth token out of prompts, chat, and command arguments. On Linux, make TWG_AUTH_STORAGE_KEY available only to the commands that need it.

To refresh credentials outside the agent sandbox, enable OAuth upkeep:


 
twg upkeep enable

twg setup enables upkeep automatically. The helper runs as your user and refreshes OAuth credentials in the background. On Linux, it does not retain TWG_AUTH_STORAGE_KEY; refresh encrypted storage in a normal terminal with the same key. If the agent still cannot access the config directory or OS vault, run twg doctor --basic or twg auth refresh in a normal terminal, or update the agent's sandbox permissions.

For a fuller authentication and connectivity check, run:


 
twg doctor

This checks your credentials, token status, and connected site.

Re-authenticate
To sign in again:


 
twg login

To restart the OAuth sign-in flow and replace saved credentials:


 
twg login --force

Refresh OAuth credentials
TWG CLI normally refreshes OAuth credentials before they expire. To check for a refresh without signing in:


 
twg auth refresh

If the credentials are still fresh, the command makes no changes. Use --force only for manual repair or validation:


 
twg auth refresh --force

Before refreshing, TWG CLI checks that it can save the updated credentials. If the config directory isn't writable, it sends no refresh request and asks you to run twg auth refresh in a normal terminal. It also detects common coding agents and prints the relevant configuration.

OAuth upkeep background helper
Upkeep is a per-user background helper that runs outside coding-agent sandboxes. It keeps OAuth credentials fresh and checks for CLI upgrades. twg setup enables it during installation. To enable or repair it later:


 
twg upkeep enable

On macOS, you may see a system notification that software from Atlassian Pty Ltd or twg can run in the background. This is expected after twg setup enables the upkeep helper.

It does not install upgrades automatically. You can manage it in System Settings > General > Login Items & Extensions.

The helper runs every 12 minutes. It refreshes OAuth when needed and checks for CLI upgrades at most once a day. When an upgrade is available, it sends an initial notification, followed by limited reminders. Each notification tells you to run twg upgrade; upkeep never downloads or installs upgrades automatically.

Use these commands to inspect, run, or remove it:


 
twg upkeep status
twg upkeep run
twg upkeep disable

TWG CLI uses a macOS LaunchAgent, Linux systemd user timer, or Windows Scheduled Task to run the helper as your user.

On Linux, scheduling requires a systemd user instance and an active user D-Bus session. If setup cannot install the schedule, retry twg upkeep enable after fixing the reported system error.

The helper stores only non-secret maintenance state in upkeep.json under the TWG config directory. twg logout leaves it enabled but skips auth work until you sign in again. twg uninstall disables it, revokes stored credentials, and removes the CLI and local TWG configs.

If you disable the helper, TWG CLI still works, but OAuth refresh and upgrade notifications may not run in the background. Run twg auth refresh or twg upgrade manually if needed.

Bitbucket authentication
Bitbucket commands require a separate token. twg login does not prompt for it. Set it up with:


 
twg setup bitbucket

twg setup also offers this during setup. An existing token is reused; pass --force to replace it:


 
twg setup bitbucket --force

For CI/CD, set the TWG_BBC_TOKEN environment variable to your Bitbucket token.

=============================
Manage TWG CLI settings for your organization
On This Page
Open Teamwork Graph CLI settings
Choose the default permission mode
Configure permissions
Revoke active sessions after changes
Authentication posture
How TWG CLI shows up in audit logs
IP allowlist behavior
Next steps
You can control which OAuth permissions Teamwork Graph CLI (TWG CLI) can request for your organization. These settings don't install or remove twg on anyone's device - they only govern what TWG CLI can do when users authenticate with OAuth.

To learn how authentication works, see How authentication works.

Open Teamwork Graph CLI settings
Go to Atlassian Administration.
Select your organization if you have more than one.
In the sidebar, select Rovo, then select Teamwork Graph CLI.
The page displays the Permissions section for Teamwork Graph CLI.

Choose the default permission mode
By default, Allow all permissions by default is on. In this mode, TWG CLI can request all current OAuth permissions in the settings page, and new TWG CLI permissions added later are allowed automatically.

To review and manage permissions individually, turn Allow all permissions by default off. You can then configure permissions in the Read, Write and manage, and Delete categories.

There isn't a separate organization-level enable or disable toggle in the current OAuth settings. To block TWG CLI OAuth access, turn off Allow all permissions by default, clear the permissions in each category, save your changes, and choose Save and revoke sessions.

Configure permissions
Use write and delete access with caution. When write and delete permissions are enabled, users can create, edit, manage, or delete objects in your connected apps - such as Jira work items and Confluence pages - using the CLI. Only enable the permissions your organization genuinely needs.

Use permissions to control what TWG CLI can do across your connected apps and tools. These permissions apply to OAuth 2.1, which is the only authentication method TWG CLI supports, except for Bitbucket commands.

For the full procedure and how enforcement works, see Configure TWG CLI permissions.

Revoke active sessions after changes
When you save permission changes, Atlassian Administration asks whether to revoke active TWG CLI sessions:

Save without revoking saves the new settings, but users may continue using existing sessions until they need to re-authenticate.
Save and revoke sessions saves the new settings and requires users to authenticate again before TWG CLI can use the updated permissions.
Revoking sessions is the fastest way to make permission reductions take effect for active users.

Authentication posture
Each user authenticates with OAuth 2.1 during setup. Authentication happens at the user level, while organization settings control the OAuth permissions TWG CLI is allowed to request.

Bitbucket is the only exception to OAuth support. Bitbucket commands require a separate Bitbucket token and aren't controlled by these OAuth permission settings.

How TWG CLI shows up in audit logs
TWG CLI actions are visible in Atlassian audit logs. Go to Atlassian Administration, then Insights, then Audit log. The captured event details include the following fields:

Name of the command (for example, jira workitem get)
Family of the command (for example, jira.workitem)
Type of command (read, write, or delete)
Status code of the command call
Invocation source (user or agent)
Agent runtime when the command was run by a coding agent (for example, rovodev or claude-code)
Permissions used to make the command call
TWG CLI version used in the command call
Command duration in milliseconds
Whether the command was manually interrupted (for example, with Ctrl-C)
Trace ID for debugging
Any command run by a user who's logged in sends an event to the audit log. Audit logs are organized in Atlassian Administration by the user's org ID. You can filter logs by:

Activity dropdown — select Invoked TWG CLI command to view all TWG CLI logs.
Command name (such as jira workitem get).
Actor — always the user's name, not an AI agent.
Each entry contains the full JSON event and associated event details.

IP allowlist behavior
TWG CLI respects all the IP allowlists configured for your organization.

=============================

Troubleshoot TWG CLI
On This Page
Run a health check
Repair your setup
Upgrade TWG CLI
Get help and give feedback
If you run into issues with Teamwork Graph CLI (TWG CLI), use this page to diagnose common problems, keep the CLI up to date, and get help.

Run a health check
To check your authentication, connectivity, and build info, run:


 
twg doctor

This is always the best first step — it tells you what's working and what isn't.

Repair your setup
If twg doctor reports issues with your configuration or agent skills, run:


 
twg setup

This re-runs the setup process and refreshes your agent skill files without reinstalling the binary.

Upgrade TWG CLI
If you're on version 0.9.6 or earlier, twg upgrade may not work correctly. Use the manual upgrade steps below instead.

macOS and Linux (curl installer, recommended for older versions)

 
curl -fsSL --retry 2 https://teamwork-graph.atlassian.com/cli/install | bash

Windows (PowerShell)

 
curl.exe -fsSL https://teamwork-graph.atlassian.com/cli/install.ps1 -o twg-install.ps1
powershell -ExecutionPolicy Bypass -File .\twg-install.ps1

Windows (Command Prompt)

 
curl.exe -fsSL https://teamwork-graph.atlassian.com/cli/install.ps1 -o twg-install.ps1
powershell -ExecutionPolicy Bypass -File twg-install.ps1

If you're on version 0.9.7 or later and want to use the built-in upgrader, run:


 
twg upgrade

