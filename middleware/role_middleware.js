const { permissions } = require("../model/permissions_model");


const authorize_role = (...permissionNames) => {
    return async (req, res, next) => {
        
        const userPermissionIds = Array.isArray(req.permissions) ? req.permissions : [];
        try {
            
            const foundPermissions = await permissions.findAll({
                where: { permissions_name: permissionNames },
                attributes: ['id']
            });
            const requiredPermissionIds = foundPermissions.map(p => p.id);
            const hasAllPermissions = requiredPermissionIds.every(id => userPermissionIds.includes(id));
            if (!hasAllPermissions) return res.status(403).json({ Error: "Access denied, you do not have the required permissions." });
            
            next();

        } catch (error) {
            console.error("Error in authorizerole middleware:", error);
            return res.status(500).json({ Error: "Internal server error." });
        }
    };
};

module.exports = authorize_role;