import multer from "multer";
import { file } from "zod";

// Store files in memory temporarily, then we upload the buffer to Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits:{fileSize:5 * 1024 * 1024 }, //5MB max per image
    fileFilter: (req,file,cb) =>{
        if(file.mimetype.startsWith("image")){
            cb(null,true);
        }
        else{
            cb(new Error("Only image files are allowed"))
        }
    }
})

export default upload