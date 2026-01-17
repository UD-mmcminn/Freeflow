/**
 * Minimal placeholder for IAM permissions.
 * Implement real role/permission resolution when RBAC is wired to the database.
 */
export class Permissions {
    getAllPermissions() {
        return {}
    }

    hasPermission(): boolean {
        return true
    }
}

export default Permissions
