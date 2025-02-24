import Admin from "../admin/admin.model.js"

export const emailExists = async (email = "") => {
    const existe = await Admin.findOne({email})
    if(existe){
        throw new Error(`The email ${email} is already registered`)
    }
}

export const adminExists = async (uid = " ") => {
    const existe = await Admin.findById(uid)
    if(!existe){
        throw new Error("No existe el usuario con el ID proporcionado")
    }
}

