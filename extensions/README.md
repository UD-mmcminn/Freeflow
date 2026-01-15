# Extensions - Third-Party Adapters (Enterprise)

This directory contains enterprise-specific adapters that implement domain-core interfaces.

## Structure

-   `auth-workday/`: Workday Passport Strategy implementation (to be implemented)
-   `workday-bridge/`: Implementation of IFlowRepository that calls Workday APIs (to be implemented)

## Purpose

Extensions provide enterprise-specific implementations of domain-core interfaces, allowing the system to work with Workday SSO, Agentflow filtering, and JSON-based persistence without polluting the OSS core.
