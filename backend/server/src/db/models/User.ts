import mongoose from "mongoose"
import bcrypt from "bcrypt"

const config = require("config")

/*
    Type interface.
    Decided to extend mongoose.Document as it 
    grants us access to .isModified().
*/
export interface UserDocument extends mongoose.Document{
    firstName: string;
    secondName: string;
    age: Number;
    email: string;
    password: string;
    tickets: Array<mongoose.Schema.Types.ObjectId>;
    friends: Array<mongoose.Schema.Types.ObjectId>;
    hostedEvents: Array<mongoose.Schema.Types.ObjectId>;
    attendingEvents: Array<mongoose.Schema.Types.ObjectId>;
    verified: Boolean;
    createdAt: Date;
    updatedAt: Date;
    compareHashAndPassword(enteredPassword: string): Promise<boolean>;
}

/*
    Schema definition
*/
const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        age: {
            type: Number,
            // required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        // Array of tickets
        tickets: [{type: mongoose.Schema.Types.ObjectId, ref: 'Ticket'}],
        // Array of friends
        friends: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        // Array of hosted events
        hostedEvents:[{
            type: mongoose.Schema.Types.ObjectId, ref: 'Event' 
        }],
        // Array of attending events
        attendingEvents: [{
            type: mongoose.Schema.Types.ObjectId, ref: 'Event'
        }],
        // An average rating of the average ratings of hosted events
        avgRating: {
            type: Number,
            default: 0
        },
        verified: Boolean,
        interestedEventTypes: [String],
        location: String,
        bio: String,
        gender: String,
        avatar: String,
        eventTypeHistory: [],
        eventHostHistory:[{type: String}],
        eventDescriptionHistory:[{type: String}]
    },
    {
        timestamps: true
    }
)

/*
    Encryption.
    This happens before this document is saved.
*/
userSchema.pre("save", async function(next){

    let user = this as UserDocument

    // Check if password has been modified DOES THIS NOT WORK? IT ALWAYS SAYS PASSWORD ISN'T modified
    if(!user.isModified("password")){
        return next();
    }

    // Generating encryption
    const salt = await bcrypt.genSalt(config.get('saltRounds'))
    const hash = await bcrypt.hashSync(user.password, salt) 
    user.password = hash
    
    return next();
})

/*
    UserSchema method
    - comparing entered password with stored hash for validation.
*/
userSchema.methods.compareHashAndPassword = async function(
    enteredPassword: string
): Promise<boolean>{
    const user = this as UserDocument;

    const result = await bcrypt.compareSync(enteredPassword, user.password)
    return result;
}

/*
    User Model
*/
const UserModel = mongoose.model("User", userSchema)
export default UserModel;
