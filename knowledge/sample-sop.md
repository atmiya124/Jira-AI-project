# Password Reset and Authentication Troubleshooting SOP

This document describes the standard procedure for handling user-reported password reset and login failure issues.

## Overview

Authentication issues are one of the most common support requests. This SOP covers diagnosis and resolution steps for password resets, login failures, and account lockouts.

## Password Reset Procedure

When a user reports they cannot log in due to a forgotten password:

1. Verify the user's identity using the standard identity verification checklist (see Identity Verification section).
2. Direct the user to the self-service password reset flow at the login page.
3. If the self-service flow fails (e.g. the reset email never arrives), check the email delivery logs for bounces or spam filtering.
4. As a last resort, an administrator can trigger a manual password reset from the admin console. This requires manager approval and must be logged in the access-change audit trail.

## Login Failure Troubleshooting

If a user can enter credentials but login still fails:

- Confirm the account is not locked due to repeated failed attempts (lockout threshold is 5 attempts within 15 minutes).
- Check whether multi-factor authentication (MFA) is enabled and whether the user's MFA device is available. Lost MFA devices require identity verification before MFA can be reset.
- Check for known outages or degraded authentication service status on the internal status page before assuming the issue is account-specific.
- Review recent security events for the account - a forced logout or credential reset triggered by a security policy will also present as a login failure.

## Identity Verification

Before resetting credentials or MFA for any user, verify at least two of the following:

- Employee ID or government-issued ID (for external users)
- Manager confirmation via a secondary channel (e.g. Slack DM to the manager, not the requester)
- Successful answer to a previously configured security question

Never bypass identity verification, even for urgent requests. Escalate urgent requests to a team lead instead of skipping verification.

## Escalation

Escalate to the Identity & Access team if:

- The issue persists after all steps above have been attempted
- There is any suspicion of account compromise or unauthorized access attempts
- The user is a privileged/admin account holder

Similar authentication incidents are tracked in the incident management system under the "auth-incidents" category. Search there before opening a new incident, since many login failures are duplicates of an already-known, already-mitigated issue.
