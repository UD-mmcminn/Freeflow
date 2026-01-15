# Apps - Orchestration Entry Points

This directory contains dedicated entry points that compose the application by injecting specific adapters at startup.

## Structure

-   `oss-server/`: Standard Edition entry point (to be implemented)
-   `workday-server/`: Workday Enterprise Edition entry point (to be implemented)

## Purpose

Each app entry point:

1. Initializes the EnterpriseRegistry
2. Registers enterprise-specific adapters (if applicable)
3. Bootstraps the legacy server with appropriate shims
4. Starts the application
