import mongoose from "mongoose"

/*
    Schema definition
*/
const pendingVerificationSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true
        }
    }
)

/*
    PendingVerificationSchema Model
*/
const PendingVerificationModel = mongoose.model("pendingVerification", pendingVerificationSchema)
export default PendingVerificationModel;