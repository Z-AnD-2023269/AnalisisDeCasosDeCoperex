`user strict`

import { hash } from "argon2";
import Admin from "./admin.model.js";

export const defaultAdmin = async () => {
    const defaultAdmin = {
        "name": "Anderson",
        "email": "alopez-2023269@gmail.com",
        "phone": "35978171",
        "password": "Ziloyta.269",
        "role": "ADMIN_ROLE"
    }

    const admin = await Admin.findOne({email: defaultAdmin.email})
    if(!admin){
        defaultAdmin.password =  await hash(defaultAdmin.password)
        await Admin.create(defaultAdmin)
        console.log(`Admin creado email: ${defaultAdmin.email}, Contraseña: Ziloyta.269`)
    }
}