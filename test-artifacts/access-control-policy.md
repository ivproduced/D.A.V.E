# Access Control Policy
**Organization:** Sample Healthcare Corp  
**Document ID:** AC-POL-001  
**Version:** 2.1  
**Effective Date:** January 1, 2026  
**Last Review:** February 1, 2026

## 1. Purpose (AC-1)
This policy establishes access control requirements for information systems processing Protected Health Information (PHI) and Personally Identifiable Information (PII).

## 2. Scope
Applies to all information systems, users, and data classified as Confidential or higher.

## 3. Policy Statements

### 3.1 Account Management (AC-2)
- **AC-2.1** All user accounts must be formally authorized before creation
- **AC-2.2** User accounts shall be reviewed quarterly for appropriateness
- **AC-2.3** Terminated employee accounts must be disabled within 8 hours
- **AC-2.4** Contractor accounts expire automatically after 90 days unless renewed
- **AC-2.5** Shared/group accounts are prohibited except for system maintenance
- **AC-2.6** Account creation requires manager approval via ServiceNow ticket

**Implementation Status:** Implemented via Active Directory and Okta SSO

### 3.2 Access Enforcement (AC-3)
- All access decisions enforced by application-level role-based access control (RBAC)
- Minimum of 3 role levels: User, Manager, Administrator
- Privilege escalation requires multi-factor authentication
- Administrative access logged and monitored in real-time

**Implementation Status:** Implemented via Okta RBAC and AWS IAM policies

### 3.3 Information Flow Enforcement (AC-4)
- Data classification labels enforced: Public, Internal, Confidential, PHI
- Network segmentation separates PHI systems from general corporate network
- Data Loss Prevention (DLP) tools monitor sensitive data egress
- Cross-boundary data transfers require encryption and approval

**Implementation Status:** Implemented via Palo Alto firewall ACLs and Symantec DLP

### 3.4 Separation of Duties (AC-5)
- No single user can approve and execute financial transactions
- Code deployment requires approval from separate developer
- Database changes require peer review and DBA approval
- Audit log access separated from system administration

**Implementation Status:** Implemented via GitLab approval workflows and segregated AWS accounts

### 3.5 Least Privilege (AC-6)
- Users granted minimum permissions required for job function
- Administrative rights time-limited to 4-hour sessions
- Just-in-time (JIT) access provisioning for elevated privileges
- Quarterly access recertification by resource owners

**Implementation Status:** Implemented via AWS SSO and PIM (Privileged Identity Management)

### 3.6 Unsuccessful Login Attempts (AC-7)
- Maximum 5 failed login attempts within 15-minute window
- Account lockout duration: 30 minutes
- Administrator notification after 3 failed attempts
- Automated blocking of brute-force attacks at network perimeter

**Implementation Status:** Implemented in Okta and AWS WAF

### 3.7 System Use Notification (AC-8)
- Login banners display authorized use notification
- Users must acknowledge acceptable use policy annually
- Warning messages displayed before accessing PHI systems

**Implementation Status:** Implemented via Windows GPO and application login screens

### 3.8 Concurrent Session Control (AC-10)
- Maximum 3 concurrent sessions per user
- Administrator accounts limited to 2 concurrent sessions
- Mobile device sessions terminate after 15 minutes idle

**Implementation Status:** Implemented in application session management

### 3.9 Session Lock (AC-11)
- Workstations auto-lock after 10 minutes idle time
- Server console sessions lock after 5 minutes
- Session unlock requires password or biometric re-authentication

**Implementation Status:** Implemented via Windows/macOS screen saver policies

### 3.10 Session Termination (AC-12)
- Web sessions terminate after 30 minutes idle
- Administrator sessions terminate after 15 minutes idle
- User-initiated logout immediately terminates all sessions

**Implementation Status:** Implemented in application session timeout configuration

### 3.11 Permitted Actions Without Identification (AC-14)
- Public website allows anonymous browsing
- Password reset limited to 3 attempts per hour
- No PHI accessible without authentication

**Implementation Status:** Implemented via public website architecture and rate limiting

## 4. Remote Access (AC-17)
- VPN required for all remote access to corporate network
- Multi-factor authentication mandatory for VPN connection
- Remote desktop sessions encrypted via TLS 1.3
- Split-tunneling prohibited
- VPN access logs reviewed monthly

**Implementation Status:** Implemented via Cisco AnyConnect VPN and Duo MFA

## 5. Wireless Access (AC-18)
- Corporate SSID requires 802.1X authentication
- Guest wireless network isolated from corporate resources
- WPA3 encryption required for all corporate wireless
- Rogue access point detection enabled

**Implementation Status:** Implemented via Cisco Wireless LAN Controllers

## 6. Mobile Device Management (AC-19)
- All mobile devices accessing corporate email/data must be enrolled in MDM
- Remote wipe capability enabled for lost/stolen devices
- Mobile devices must have PIN/biometric authentication
- Quarterly security patch compliance required

**Implementation Status:** Implemented via Microsoft Intune MDM

## 7. Roles and Responsibilities
- **CISO:** Overall policy ownership and approval
- **IT Security Team:** Policy implementation and monitoring
- **System Owners:** Access control configuration for assigned systems
- **Managers:** Quarterly access reviews for direct reports
- **All Users:** Compliance with policy requirements

## 8. Compliance and Enforcement
- Quarterly compliance audits conducted by Internal Audit
- Policy violations subject to disciplinary action
- Critical violations may result in immediate termination

## 9. Related Documents
- Incident Response Plan (IRP-001)
- System and Communications Protection Policy (SC-POL-001)
- Audit and Accountability Policy (AU-POL-001)
- Identification and Authentication Policy (IA-POL-001)

## 10. Revision History
| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | 2024-01-01 | J. Smith | Initial version |
| 2.0 | 2025-06-15 | M. Johnson | Updated for new VPN solution |
| 2.1 | 2026-01-01 | A. Williams | Added mobile device requirements |

---
**Approved By:** John Smith, CISO  
**Signature:** ________________________  
**Date:** January 1, 2026
