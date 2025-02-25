export const hasRoles = (...roles) => {
    return (req, res, next) =>{
        if(!req.admin){
            return res.status(500).json({
                success: false,
                message: "Se quiere verificar un role antes de validar el token"
            })
        }

        if(!roles.includes(req.admin.role)){
            return res.status(401).json({
                success: false,
                message:`El servicio requiere uno de estos roles ${roles}`
            })
        }
        next()
    }
}